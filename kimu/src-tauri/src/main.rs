// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() -> std::process::ExitCode {
    if kimu_lib::cli::has_subcommand() {
        return kimu_lib::cli::execute();
    }

    kimu_lib::run();
    std::process::ExitCode::SUCCESS
}
