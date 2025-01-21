// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use sysinfo::{System, Disks};
use serde::Serialize;
use std::fs;
use shellexpand;
use std::path::Path;
use std::process::Command;
use std::collections::HashMap;

#[derive(Serialize)]
struct SystemInfo {
    cpu: f32,
    memory: f64,
    disk: f64,
}

#[derive(Debug, Serialize)]
struct JunkStats {
    categories: Vec<JunkCategory>,
    total_size: u64,
    total_files: usize,
}

#[derive(Debug, Serialize)]
struct JunkFile {
    path: String,
    size: u64,
    category: String
}

#[derive(Debug, Serialize)]
struct JunkCategory {
    name: String,
    description: String,
    icon: String,
    size: u64,
    file_count: u64,
    files: Vec<JunkFile>
}

#[derive(Debug, Serialize)]
struct AppInfo {
    path: String,
    size: u64,
    current_version: String,
    latest_version: String,
    update_size: u64,
}

#[tauri::command]
fn get_system_info() -> SystemInfo {
    let mut sys = System::new();
    sys.refresh_memory();
    sys.refresh_cpu();

    let max_freq = 4000.0; // Maksimum CPU frekansı (MHz)
    let cpu = sys.cpus().iter().map(|cpu| cpu.frequency()).sum::<u64>() as f32 / sys.cpus().len() as f32;
    let cpu_percentage = (cpu / max_freq) * 100.0;

    let total_memory = sys.total_memory() as f64;
    let used_memory = sys.used_memory() as f64;
    let memory_percentage = if total_memory > 0.0 {
        (used_memory / total_memory) * 100.0
    } else {
        0.0
    };

    let disks = Disks::new_with_refreshed_list();
    let disk = disks.list().first().map_or(0.0, |disk| {
        let total = disk.total_space() as f64;
        let available = disk.available_space() as f64;
        ((total - available) / total) * 100.0
    });

    SystemInfo {
        cpu: cpu_percentage,
        memory: memory_percentage,
        disk,
    }
}

fn scan_broken_login_items() -> JunkCategory {
    let mut files = Vec::new();
    let login_items_path = shellexpand::tilde("~/Library/Application Support/com.apple.backgroundtaskmanagementagent").to_string();
    
    if let Ok(entries) = fs::read_dir(login_items_path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    files.push(JunkFile {
                        path: entry.path().to_string_lossy().to_string(),
                        size: metadata.len(),
                        category: "Broken Login Items".to_string()
                    });
                }
            }
        }
    }

    let total_size: u64 = files.iter().map(|f| f.size).sum();

    JunkCategory {
        name: "Broken Login Items".to_string(),
        description: "Broken or outdated login items".to_string(),
        icon: "🔑".to_string(),
        size: total_size,
        file_count: files.len() as u64,
        files,
    }
}

fn scan_broken_preferences() -> JunkCategory {
    let mut files = Vec::new();
    let prefs_path = shellexpand::tilde("~/Library/Preferences").to_string();
    
    if let Ok(entries) = fs::read_dir(prefs_path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() && entry.path().to_string_lossy().ends_with(".plist") {
                    // Burada .plist dosyalarının bozuk olup olmadığını kontrol edebiliriz
                    files.push(JunkFile {
                        path: entry.path().to_string_lossy().to_string(),
                        size: metadata.len(),
                        category: "Broken Preferences".to_string()
                    });
                }
            }
        }
    }

    let total_size: u64 = files.iter().map(|f| f.size).sum();

    JunkCategory {
        name: "Broken Preferences".to_string(),
        description: "Corrupted or invalid preference files".to_string(),
        icon: "⚠️".to_string(),
        size: total_size,
        file_count: files.len() as u64,
        files,
    }
}

fn scan_user_log_files() -> JunkCategory {
    let mut files = Vec::new();
    let user_logs_path = shellexpand::tilde("~/Library/Logs").to_string();
    
    if let Ok(entries) = fs::read_dir(user_logs_path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() && metadata.len() > 1024 * 1024 { // 1MB'dan büyük loglar
                    files.push(JunkFile {
                        path: entry.path().to_string_lossy().to_string(),
                        size: metadata.len(),
                        category: "User Log Files".to_string()
                    });
                }
            }
        }
    }

    let total_size: u64 = files.iter().map(|f| f.size).sum();

    JunkCategory {
        name: "User Log Files".to_string(),
        description: "Application and system logs in user directory".to_string(),
        icon: "📄".to_string(),
        size: total_size,
        file_count: files.len() as u64,
        files,
    }
}

fn scan_system_log_files() -> JunkCategory {
    let mut files = Vec::new();
    let system_logs_path = "/var/log";
    
    if let Ok(entries) = fs::read_dir(system_logs_path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() && metadata.len() > 1024 * 1024 { // 1MB'dan büyük loglar
                    files.push(JunkFile {
                        path: entry.path().to_string_lossy().to_string(),
                        size: metadata.len(),
                        category: "System Log Files".to_string()
                    });
                }
            }
        }
    }

    let total_size: u64 = files.iter().map(|f| f.size).sum();

    JunkCategory {
        name: "System Log Files".to_string(),
        description: "System-wide log files".to_string(),
        icon: "📄".to_string(),
        size: total_size,
        file_count: files.len() as u64,
        files,
    }
}

fn scan_cache_files() -> JunkCategory {
    let mut files = Vec::new();
    let cache_paths = [
        shellexpand::tilde("~/Library/Caches").to_string(),
        "/Library/Caches".to_string(),
    ];
    
    for cache_path in cache_paths.iter() {
        if let Ok(entries) = fs::read_dir(cache_path) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() && metadata.len() > 5 * 1024 * 1024 { // 5MB'dan büyük cache'ler
                        files.push(JunkFile {
                            path: entry.path().to_string_lossy().to_string(),
                            size: metadata.len(),
                            category: "Cache Files".to_string()
                        });
                    }
                }
            }
        }
    }

    let total_size: u64 = files.iter().map(|f| f.size).sum();

    JunkCategory {
        name: "Cache Files".to_string(),
        description: "Application and system cache files".to_string(),
        icon: "💾".to_string(),
        size: total_size,
        file_count: files.len() as u64,
        files,
    }
}

fn scan_trash_files() -> JunkCategory {
    let mut files = Vec::new();
    let trash_path = shellexpand::tilde("~/.Trash").to_string();
    
    if let Ok(entries) = fs::read_dir(trash_path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                files.push(JunkFile {
                    path: entry.path().to_string_lossy().to_string(),
                    size: metadata.len(),
                    category: "Trash Files".to_string()
                });
            }
        }
    }

    let total_size: u64 = files.iter().map(|f| f.size).sum();

    JunkCategory {
        name: "Trash Files".to_string(),
        description: "Files in your trash bin".to_string(),
        icon: "🗑️".to_string(),
        size: total_size,
        file_count: files.len() as u64,
        files,
    }
}

fn scan_downloads() -> JunkCategory {
    let mut files = Vec::new();
    let downloads_path = shellexpand::tilde("~/Downloads").to_string();
    
    if let Ok(entries) = fs::read_dir(downloads_path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    // 7 günden eski dosyaları ekle
                    if let Ok(modified) = metadata.modified() {
                        if let Ok(duration) = modified.elapsed() {
                            if duration.as_secs() > 7 * 24 * 60 * 60 {
                                files.push(JunkFile {
                                    path: entry.path().to_string_lossy().to_string(),
                                    size: metadata.len(),
                                    category: "Old Downloads".to_string()
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    let total_size: u64 = files.iter().map(|f| f.size).sum();

    JunkCategory {
        name: "Old Downloads".to_string(),
        description: "Downloads older than 7 days".to_string(),
        icon: "📥".to_string(),
        size: total_size,
        file_count: files.len() as u64,
        files,
    }
}

fn scan_directory(dir_path: &str) -> Vec<JunkFile> {
    let mut files = Vec::new();
    if let Ok(entries) = fs::read_dir(dir_path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    let size = metadata.len();
                    // Sadece 1MB'dan büyük dosyaları ekle
                    if size > 1024 * 1024 {
                        files.push(JunkFile {
                            path: entry.path().to_string_lossy().to_string(),
                            size,
                            category: "Other Files".to_string()
                        });
                    }
                } else if metadata.is_dir() {
                    if let Some(path) = entry.path().to_str() {
                        files.extend(scan_directory(path));
                    }
                }
            }
        }
    }
    
    // Boyuta göre büyükten küçüğe sırala
    files.sort_by(|a, b| b.size.cmp(&a.size));
    
    // Sadece en büyük 50 dosyayı döndür
    files.truncate(50);
    files
}

fn scan_user_cache() -> JunkCategory {
    let user_cache_dir = shellexpand::tilde("~/Library/Caches").to_string();
    let mut files = scan_directory(&user_cache_dir);
    // Cache dosyaları için minimum boyut 1MB
    files.retain(|f| f.size > 1 * 1024 * 1024);
    let total_size = files.iter().map(|f| f.size).sum();
    let file_count = files.len() as u64;
    
    JunkCategory {
        name: "User Cache Files".to_string(),
        description: "Application specific user cache files".to_string(),
        icon: "💾".to_string(),
        size: total_size,
        file_count,
        files,
    }
}

fn scan_system_cache() -> JunkCategory {
    let system_cache_dir = "/private/var/folders".to_string();
    let mut files = scan_directory(&system_cache_dir);
    // Sistem cache için minimum boyut 2MB
    files.retain(|f| f.size > 2 * 1024 * 1024);
    let total_size = files.iter().map(|f| f.size).sum();
    let file_count = files.len() as u64;
    
    JunkCategory {
        name: "System Cache Files".to_string(),
        description: "System level cache files".to_string(),
        icon: "💾".to_string(),
        size: total_size,
        file_count,
        files,
    }
}

fn scan_xcode_junk() -> JunkCategory {
    let xcode_dir = shellexpand::tilde("~/Library/Developer/Xcode/DerivedData").to_string();
    let mut files = scan_directory(&xcode_dir);
    // Xcode için minimum boyut 5MB
    files.retain(|f| f.size > 5 * 1024 * 1024);
    let total_size = files.iter().map(|f| f.size).sum();
    let file_count = files.len() as u64;
    
    JunkCategory {
        name: "Xcode Junk".to_string(),
        description: "Unused Xcode files and caches".to_string(),
        icon: "💾".to_string(),
        size: total_size,
        file_count,
        files,
    }
}

fn scan_mail_downloads() -> JunkCategory {
    let mail_dir = shellexpand::tilde("~/Library/Containers/com.apple.mail/Data/Library/Mail Downloads").to_string();
    let files = scan_directory(&mail_dir);
    JunkCategory {
        name: "Mail Downloads".to_string(),
        description: "Temporary mail attachments and caches".to_string(),
        icon: "📧".to_string(),
        size: files.iter().map(|f| f.size).sum(),
        file_count: files.len() as u64,
        files,
    }
}

fn scan_system_storage() -> JunkCategory {
    let system_dirs = vec![
        "/private/var/log",
        "/private/var/tmp",
        "/private/var/folders",
    ];
    let mut all_files = Vec::new();
    for dir in system_dirs {
        all_files.extend(scan_directory(dir));
    }
    JunkCategory {
        name: "Macintosh HD".to_string(),
        description: "System storage cleanup".to_string(),
        icon: "💾".to_string(),
        size: all_files.iter().map(|f| f.size).sum(),
        file_count: all_files.len() as u64,
        files: all_files,
    }
}

fn scan_generic_trojan() -> JunkCategory {
    let mut files = Vec::new();
    let scan_paths = [
        shellexpand::tilde("~/Library/LaunchAgents").to_string(),
        "/Library/LaunchAgents".to_string(),
        "/Library/LaunchDaemons".to_string(),
    ];
    
    for path in scan_paths.iter() {
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        files.push(JunkFile {
                            path: entry.path().to_string_lossy().to_string(),
                            size: metadata.len(),
                            category: "Generic.Trojan".to_string()
                        });
                    }
                }
            }
        }
    }

    JunkCategory {
        name: "Generic.Trojan".to_string(),
        description: "Common trojan threats and malware".to_string(),
        icon: "🐞".to_string(),
        size: files.iter().map(|f| f.size).sum(),
        file_count: files.len() as u64,
        files,
    }
}

fn scan_osx_wildpressure() -> JunkCategory {
    let mut files = Vec::new();
    let scan_paths = [
        shellexpand::tilde("~/Library/Application Support").to_string(),
        "/Library/Application Support".to_string(),
    ];
    
    for path in scan_paths.iter() {
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        files.push(JunkFile {
                            path: entry.path().to_string_lossy().to_string(),
                            size: metadata.len(),
                            category: "OSX.WildPressure".to_string()
                        });
                    }
                }
            }
        }
    }

    JunkCategory {
        name: "OSX.WildPressure".to_string(),
        description: "MacOS specific malware variant".to_string(),
        icon: "🐞".to_string(),
        size: files.iter().map(|f| f.size).sum(),
        file_count: files.len() as u64,
        files,
    }
}

fn scan_hidden_code() -> JunkCategory {
    let mut files = Vec::new();
    let home = shellexpand::tilde("~").to_string();
    
    if let Ok(entries) = fs::read_dir(&home) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                let file_name = entry.file_name().to_string_lossy().to_string();
                if metadata.is_file() && file_name.starts_with(".") {
                    files.push(JunkFile {
                        path: entry.path().to_string_lossy().to_string(),
                        size: metadata.len(),
                        category: "HiddenCode".to_string()
                    });
                }
            }
        }
    }

    JunkCategory {
        name: "HiddenCode".to_string(),
        description: "Concealed malicious code detection".to_string(),
        icon: "🤖".to_string(),
        size: files.iter().map(|f| f.size).sum(),
        file_count: files.len() as u64,
        files,
    }
}

fn scan_adload() -> JunkCategory {
    let mut files = Vec::new();
    let scan_paths = [
        shellexpand::tilde("~/Library/Application Support/Google/Chrome/Default/Extensions").to_string(),
        shellexpand::tilde("~/Library/Application Support/Firefox/Profiles").to_string(),
        shellexpand::tilde("~/Library/Safari/Extensions").to_string(),
    ];
    
    for path in scan_paths.iter() {
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        files.push(JunkFile {
                            path: entry.path().to_string_lossy().to_string(),
                            size: metadata.len(),
                            category: "AdLoad".to_string()
                        });
                    }
                }
            }
        }
    }

    JunkCategory {
        name: "AdLoad".to_string(),
        description: "Adware and unwanted software".to_string(),
        icon: "💰".to_string(),
        size: files.iter().map(|f| f.size).sum(),
        file_count: files.len() as u64,
        files,
    }
}

fn scan_background_items() -> JunkCategory {
    let mut files = Vec::new();
    let scan_paths = [
        shellexpand::tilde("~/Library/LaunchAgents").to_string(),
        "/Library/LaunchAgents".to_string(),
        "/Library/LaunchDaemons".to_string(),
        shellexpand::tilde("~/Library/Application Support/com.apple.backgroundtaskmanagementagent").to_string(),
    ];
    
    for path in scan_paths.iter() {
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        files.push(JunkFile {
                            path: entry.path().to_string_lossy().to_string(),
                            size: metadata.len(),
                            category: "Background Items".to_string()
                        });
                    }
                }
            }
        }
    }

    JunkCategory {
        name: "Background Items".to_string(),
        description: "Apps and services running in the background".to_string(),
        icon: "💻".to_string(),
        size: files.iter().map(|f| f.size).sum(),
        file_count: files.len() as u64,
        files,
    }
}

fn scan_login_items() -> JunkCategory {
    let mut files = Vec::new();
    let login_items_path = shellexpand::tilde("~/Library/Application Support/com.apple.backgroundtaskmanagementagent").to_string();
    
    if let Ok(entries) = fs::read_dir(login_items_path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    files.push(JunkFile {
                        path: entry.path().to_string_lossy().to_string(),
                        size: metadata.len(),
                        category: "Login Items".to_string()
                    });
                }
            }
        }
    }

    JunkCategory {
        name: "Login Items".to_string(),
        description: "Apps that start automatically at login".to_string(),
        icon: "🔑".to_string(),
        size: files.iter().map(|f| f.size).sum(),
        file_count: files.len() as u64,
        files,
    }
}

fn get_app_version(app_path: &str) -> Option<String> {
    let plist_path = format!("{}/Contents/Info.plist", app_path);
    let output = Command::new("defaults")
        .args(&["read", &plist_path, "CFBundleShortVersionString"])
        .output()
        .ok()?;
    
    if output.status.success() {
        String::from_utf8(output.stdout)
            .ok()
            .map(|v| v.trim().to_string())
    } else {
        None
    }
}

fn check_app_update(app_path: &str) -> Option<(String, u64)> {
    // Örnek olarak bazı popüler uygulamalar için sabit versiyon ve boyut
    let known_updates = [
        ("Google Chrome.app", "122.0.0", 200 * 1024 * 1024),
        ("Firefox.app", "124.0.1", 150 * 1024 * 1024),
        ("Visual Studio Code.app", "1.87.0", 100 * 1024 * 1024),
    ];
    
    let app_name = Path::new(app_path)
        .file_name()?
        .to_str()?;
    
    if let Some(&(name, version, size)) = known_updates.iter()
        .find(|&&(name, _, _)| app_name == name) {
        Some((version.to_string(), size))
    } else {
        None
    }
}

fn scan_app_updates() -> JunkCategory {
    let mut files = Vec::new();
    let applications_path = shellexpand::tilde("~/Applications").to_string();
    
    if let Ok(entries) = fs::read_dir(&applications_path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                let path = entry.path();
                if metadata.is_dir() && path.extension().map_or(false, |ext| ext == "app") {
                    let path_str = path.to_string_lossy().to_string();
                    
                    // Mevcut versiyon kontrolü
                    if let Some(current_version) = get_app_version(&path_str) {
                        // Güncelleme kontrolü
                        if let Some((latest_version, update_size)) = check_app_update(&path_str) {
                            if current_version != latest_version {
                                files.push(JunkFile {
                                    path: format!("{} ({}→{})", path_str, current_version, latest_version),
                                    size: update_size,
                                    category: "Updates Available".to_string()
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    // Boyuta göre sırala
    files.sort_by(|a, b| b.size.cmp(&a.size));

    JunkCategory {
        name: "Updates Available".to_string(),
        description: "Applications that need to be updated".to_string(),
        icon: "🔄".to_string(),
        size: files.iter().map(|f| f.size).sum(),
        file_count: files.len() as u64,
        files,
    }
}

fn scan_duplicate_downloads() -> JunkCategory {
    let mut files = Vec::new();
    let mut total_size = 0;
    let mut file_count = 0;
    
    // Downloads klasörünü tara
    let downloads_path = shellexpand::tilde("~/Downloads").into_owned();
    let path = Path::new(&downloads_path);
    if path.exists() {
        // Dosyaları isme göre grupla
        let mut file_groups: HashMap<String, Vec<(String, u64)>> = HashMap::new();
        
        if let Ok(entries) = std::fs::read_dir(path) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        let size = metadata.len();
                        let name = entry.file_name().to_string_lossy().to_string();
                        // Dosya adını uzantısız al
                        if let Some(stem) = Path::new(&name).file_stem() {
                            let stem = stem.to_string_lossy().to_string();
                            file_groups.entry(stem)
                                .or_insert_with(Vec::new)
                                .push((entry.path().to_string_lossy().to_string(), size));
                        }
                    }
                }
            }
        }
        
        // Duplicate dosyaları bul
        for (_name, group) in file_groups {
            if group.len() > 1 {
                for (path, size) in group {
                    files.push(JunkFile {
                        path,
                        size,
                        category: "Duplicate Downloads".to_string()
                    });
                    total_size += size;
                    file_count += 1;
                }
            }
        }
    }
    
    // Dosyaları boyuta göre sırala
    files.sort_by(|a, b| b.size.cmp(&a.size));
    
    JunkCategory {
        name: "Duplicate Downloads".to_string(),
        description: "Tekrarlanan indirme dosyaları".to_string(),
        icon: "📥".to_string(),
        size: total_size,
        file_count,
        files
    }
}

#[tauri::command]
async fn scan_clutter() -> Result<JunkStats, String> {
    let duplicate_downloads = scan_duplicate_downloads();
    let total_size = duplicate_downloads.size;
    let total_files = duplicate_downloads.file_count as usize;
    
    Ok(JunkStats {
        total_size,
        total_files,
        categories: vec![duplicate_downloads],
    })
}

#[tauri::command]
async fn scan_junk_files() -> Result<JunkStats, String> {
    let cache_category = scan_cache_files();
    let trash_category = scan_trash_files();
    let downloads_category = scan_downloads();
    let user_cache = scan_user_cache();
    let system_cache = scan_system_cache();
    let xcode_junk = scan_xcode_junk();
    let mail_downloads = scan_mail_downloads();
    let system_storage = scan_system_storage();
    let broken_login = scan_broken_login_items();
    let broken_prefs = scan_broken_preferences();
    let user_logs = scan_user_log_files();
    let system_logs = scan_system_log_files();

    let categories = vec![
        cache_category,
        trash_category,
        downloads_category,
        user_cache,
        system_cache,
        xcode_junk,
        mail_downloads,
        system_storage,
        broken_login,
        broken_prefs,
        user_logs,
        system_logs
    ];

    let total_size: u64 = categories.iter().map(|cat| cat.size).sum();
    let total_files: usize = categories.iter().map(|cat| cat.file_count as usize).sum();

    Ok(JunkStats {
        categories,
        total_size,
        total_files,
    })
}

#[tauri::command]
async fn scan_protection() -> Result<JunkStats, String> {
    let trojan = scan_generic_trojan();
    let wildpressure = scan_osx_wildpressure();
    let hiddencode = scan_hidden_code();
    let adload = scan_adload();

    let categories = vec![
        trojan,
        wildpressure,
        hiddencode,
        adload
    ];

    let total_size: u64 = categories.iter().map(|cat| cat.size).sum();
    let total_files: usize = categories.iter().map(|cat| cat.file_count as usize).sum();

    Ok(JunkStats {
        categories,
        total_size,
        total_files,
    })
}

#[tauri::command]
async fn scan_performance() -> Result<JunkStats, String> {
    let background_items = scan_background_items();
    let login_items = scan_login_items();

    let categories = vec![
        background_items,
        login_items
    ];

    let total_size: u64 = categories.iter().map(|cat| cat.size).sum();
    let total_files: usize = categories.iter().map(|cat| cat.file_count as usize).sum();

    Ok(JunkStats {
        categories,
        total_size,
        total_files,
    })
}

#[tauri::command]
async fn scan_applications() -> Result<JunkStats, String> {
    let updates = scan_app_updates();
    
    let categories = vec![updates];
    
    let total_size: u64 = categories.iter().map(|cat| cat.size).sum();
    let total_files: usize = categories.iter().map(|cat| cat.file_count as usize).sum();

    Ok(JunkStats {
        categories,
        total_size,
        total_files,
    })
}

#[tauri::command]
async fn delete_file(path: String) -> Result<(), String> {
    let expanded_path = shellexpand::tilde(&path).to_string();
    let path = Path::new(&expanded_path);
    if path.exists() {
        if let Err(e) = std::fs::remove_file(path) {
            return Err(format!("Dosya silinirken hata oluştu: {}", e));
        }
        Ok(())
    } else {
        Err("Dosya bulunamadı".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            scan_junk_files,
            scan_protection,
            scan_performance,
            scan_applications,
            scan_clutter,
            delete_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
