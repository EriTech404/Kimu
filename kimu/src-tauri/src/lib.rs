pub mod cli;
mod manager;

use manager::{KeyMeta, SecretManager};
use tauri::Manager;

#[tauri::command]
fn save_secret(
    name: &str,
    value: &str,
    tag: &str,
    memo: &str,
    state: tauri::State<'_, SecretManager>,
) -> Result<(), String> {
    state.save_secret(name, value, tag, memo).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_secret(name: &str, state: tauri::State<'_, SecretManager>) -> Result<String, String> {
    state.get_secret(name).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_secret(name: &str, state: tauri::State<'_, SecretManager>) -> Result<(), String> {
    state.delete_secret(name).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_secrets(state: tauri::State<'_, SecretManager>) -> Result<Vec<KeyMeta>, String> {
    state.list_secrets().map_err(|e| e.to_string())
}

#[tauri::command]
fn update_secret_meta(
    name: &str,
    tag: Option<&str>,
    memo: Option<&str>,
    is_favorite: Option<bool>,
    state: tauri::State<'_, SecretManager>,
) -> Result<(), String> {
    state
        .update_meta(name, tag, memo, is_favorite)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_tags(state: tauri::State<'_, SecretManager>) -> Result<Vec<String>, String> {
    state.get_tags().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_tag(name: &str, state: tauri::State<'_, SecretManager>) -> Result<(), String> {
    state.add_tag(name).map_err(|e| e.to_string())
}

#[tauri::command]
fn remove_tag(name: &str, state: tauri::State<'_, SecretManager>) -> Result<(), String> {
    state.remove_tag(name).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data directory");

            let manager =
                SecretManager::new(app_data_dir).expect("failed to initialize secret manager");

            app.manage(manager);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_secret,
            get_secret,
            delete_secret,
            list_secrets,
            update_secret_meta,
            get_tags,
            add_tag,
            remove_tag,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
