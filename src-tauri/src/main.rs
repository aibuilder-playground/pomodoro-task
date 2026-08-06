#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::io::Write;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const DATA_FILE_NAME: &str = "pomodoro-task-data.json";

/// Fase 2: persistencia en un único archivo JSON dentro del directorio de
/// datos de la app (resuelto por el propio SO a través de Tauri). El backend
/// no conoce la forma de esos datos: solo mueve bytes de/hacia disco. Todo el
/// parseo, la validación y la lógica de negocio siguen viviendo en el
/// frontend, igual que en la Fase 1.
fn data_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join(DATA_FILE_NAME))
}

#[tauri::command]
fn load_state(app: AppHandle) -> Result<Option<String>, String> {
    let path = data_file_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    fs::read_to_string(&path).map(Some).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_state(app: AppHandle, data: String) -> Result<(), String> {
    let path = data_file_path(&app)?;

    // Escritura atómica: se escribe primero a un archivo temporal y luego se
    // renombra sobre el definitivo, para no dejar el JSON corrupto si la app
    // se cierra o pierde energía a mitad de un guardado.
    let tmp_path = path.with_extension("json.tmp");
    {
        let mut file = fs::File::create(&tmp_path).map_err(|e| e.to_string())?;
        file.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
        file.sync_all().map_err(|e| e.to_string())?;
    }
    fs::rename(&tmp_path, &path).map_err(|e| e.to_string())
}

#[tauri::command]
fn clear_state(app: AppHandle) -> Result<(), String> {
    let path = data_file_path(&app)?;
    if path.exists() {
        fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_state, save_state, clear_state])
        .run(tauri::generate_context!())
        .expect("error al ejecutar la aplicación Tauri");
}
