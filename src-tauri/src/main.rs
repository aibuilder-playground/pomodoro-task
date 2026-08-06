#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Fase 1: no hay comandos custom ni acceso a disco.
// Toda la gestión de tareas y el temporizador Pomodoro viven exclusivamente
// en el estado de React/Zustand del frontend (memoria RAM del proceso).
fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error al ejecutar la aplicación Tauri");
}
