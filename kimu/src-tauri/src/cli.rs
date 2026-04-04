use std::collections::HashMap;
use std::env;
use std::path::{Path, PathBuf};
use std::process::{Command, ExitCode};

use clap::{Parser, Subcommand};
use regex::Regex;

use crate::manager;

/// Default env file names checked in priority order (later files override earlier ones).
const DEFAULT_ENV_FILES: &[&str] = &[".env", ".env.development", ".env.local"];

#[derive(Parser)]
#[command(name = "kimu", version, about = "Secure secret manager & CLI env injector")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Option<Commands>,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Run a command with secrets injected from the OS keyring
    Run {
        /// Path to a specific .env file (overrides automatic discovery)
        #[arg(short, long)]
        env_file: Option<PathBuf>,

        /// The command and its arguments to execute
        #[arg(trailing_var_arg = true, required = true)]
        args: Vec<String>,
    },
}

pub fn execute() -> ExitCode {
    let cli = Cli::parse();

    match cli.command {
        Some(Commands::Run { env_file, args }) => run_with_secrets(env_file.as_deref(), &args),
        None => ExitCode::SUCCESS,
    }
}

/// Returns true if CLI args contain a subcommand that should bypass the GUI.
pub fn has_subcommand() -> bool {
    let args: Vec<String> = env::args().collect();
    args.iter().any(|a| a == "run")
}

fn run_with_secrets(explicit_env_file: Option<&Path>, args: &[String]) -> ExitCode {
    let env_vars = if let Some(path) = explicit_env_file {
        match parse_env_file(path) {
            Ok(vars) => vars,
            Err(err) => {
                eprintln!("kimu: failed to read {}: {}", path.display(), err);
                return ExitCode::FAILURE;
            }
        }
    } else {
        load_default_env_files()
    };

    let placeholder_re = match Regex::new(r"SECRET\{\{([^}]+)\}\}") {
        Ok(re) => re,
        Err(err) => {
            eprintln!("kimu: internal regex error: {}", err);
            return ExitCode::FAILURE;
        }
    };

    let mut injected: HashMap<String, String> = env::vars().collect();
    let mut resolved_count: usize = 0;

    for (key, raw_value) in &env_vars {
        let mut final_value = raw_value.clone();
        let mut had_error = false;

        for cap in placeholder_re.captures_iter(raw_value) {
            let full_match = &cap[0];
            let secret_name = &cap[1];

            match manager::get_secret_direct(secret_name) {
                Ok(secret_value) => {
                    final_value = final_value.replace(full_match, &secret_value);
                    resolved_count += 1;
                }
                Err(err) => {
                    eprintln!(
                        "kimu: failed to resolve secret '{}' for env var '{}': {}",
                        secret_name, key, err
                    );
                    had_error = true;
                }
            }
        }

        if had_error {
            return ExitCode::FAILURE;
        }

        injected.insert(key.clone(), final_value);
    }

    if env_vars.is_empty() {
        eprintln!("kimu: no env vars to inject, running command as-is");
    } else {
        eprintln!(
            "kimu: injected {} secret(s) into {} env var(s)",
            resolved_count,
            env_vars.len()
        );
    }

    let program = &args[0];
    let child_args = &args[1..];

    let status = Command::new(program)
        .args(child_args)
        .envs(&injected)
        .status();

    match status {
        Ok(exit_status) => {
            let code = exit_status.code().unwrap_or(1);
            ExitCode::from(code as u8)
        }
        Err(err) => {
            eprintln!("kimu: failed to spawn '{}': {}", program, err);
            ExitCode::FAILURE
        }
    }
}

/// Loads env files in priority order. Later files override earlier ones.
/// Returns an empty map (with a warning) if no files are found.
fn load_default_env_files() -> HashMap<String, String> {
    let mut merged = HashMap::new();
    let mut loaded_any = false;

    for filename in DEFAULT_ENV_FILES {
        let path = Path::new(filename);
        if !path.exists() {
            continue;
        }

        match parse_env_file(path) {
            Ok(vars) => {
                eprintln!("kimu: loaded {}", filename);
                merged.extend(vars);
                loaded_any = true;
            }
            Err(err) => {
                eprintln!("kimu: warning: failed to parse {}: {}", filename, err);
            }
        }
    }

    if !loaded_any {
        eprintln!("kimu: no .env files found, proceeding without secret injection");
    }

    merged
}

fn parse_env_file(path: &Path) -> Result<HashMap<String, String>, String> {
    let iter = dotenvy::from_path_iter(path).map_err(|e| e.to_string())?;

    let mut vars = HashMap::new();
    for item in iter {
        let (key, value) = item.map_err(|e| e.to_string())?;
        vars.insert(key, value);
    }

    Ok(vars)
}
