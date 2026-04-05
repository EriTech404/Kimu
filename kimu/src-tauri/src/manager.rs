use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

use keyring::Entry;
use serde::{Deserialize, Serialize};
use thiserror::Error;

const SERVICE_NAME: &str = "kimu";
const MANIFEST_FILE: &str = "key_manifest.json";

#[derive(Debug, Error)]
pub enum SecretError {
    #[error("keyring error: {0}")]
    Keyring(#[from] keyring::Error),

    #[error("manifest I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("manifest parse error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("secret not found: {0}")]
    NotFound(String),

    #[error("secret already exists: {0}")]
    AlreadyExists(String),
}

impl From<SecretError> for String {
    fn from(err: SecretError) -> String {
        err.to_string()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyMeta {
    pub name: String,
    #[serde(default)]
    pub tag: String,
    #[serde(default)]
    pub memo: String,
    #[serde(default)]
    pub is_favorite: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct Manifest {
    keys: Vec<KeyMeta>,
    #[serde(default)]
    tags: Vec<String>,
}

/// Fetch a secret directly from the OS keyring without needing a SecretManager instance.
/// Used by the CLI runner where Tauri state is not available.
pub fn get_secret_direct(name: &str) -> Result<String, SecretError> {
    let entry = Entry::new(SERVICE_NAME, name)?;
    let value = entry.get_password()?;
    Ok(value)
}

pub struct SecretManager {
    manifest_path: PathBuf,
    manifest: Mutex<Manifest>,
}

impl SecretManager {
    pub fn new(app_data_dir: PathBuf) -> Result<Self, SecretError> {
        fs::create_dir_all(&app_data_dir)?;

        let manifest_path = app_data_dir.join(MANIFEST_FILE);
        let manifest = if manifest_path.exists() {
            let data = fs::read_to_string(&manifest_path)?;
            serde_json::from_str(&data)?
        } else {
            Manifest::default()
        };

        Ok(Self {
            manifest_path,
            manifest: Mutex::new(manifest),
        })
    }

    fn keyring_entry(key: &str) -> Result<Entry, SecretError> {
        Ok(Entry::new(SERVICE_NAME, key)?)
    }

    fn save_manifest(&self, manifest: &Manifest) -> Result<(), SecretError> {
        let data = serde_json::to_string_pretty(manifest)?;
        fs::write(&self.manifest_path, data)?;
        Ok(())
    }

    pub fn save_secret(
        &self,
        name: &str,
        value: &str,
        tag: &str,
        memo: &str,
    ) -> Result<(), SecretError> {
        let mut manifest = self.manifest.lock().unwrap();

        if manifest.keys.iter().any(|k| k.name == name) {
            return Err(SecretError::AlreadyExists(name.to_string()));
        }

        let entry = Self::keyring_entry(name)?;
        entry.set_password(value)?;

        manifest.keys.push(KeyMeta {
            name: name.to_string(),
            tag: tag.to_string(),
            memo: memo.to_string(),
            is_favorite: false,
        });

        self.save_manifest(&manifest)?;
        Ok(())
    }

    pub fn get_secret(&self, name: &str) -> Result<String, SecretError> {
        let manifest = self.manifest.lock().unwrap();

        if !manifest.keys.iter().any(|k| k.name == name) {
            return Err(SecretError::NotFound(name.to_string()));
        }

        let entry = Self::keyring_entry(name)?;
        let value = entry.get_password()?;
        Ok(value)
    }

    pub fn update_secret_value(&self, name: &str, value: &str) -> Result<(), SecretError> {
        let manifest = self.manifest.lock().unwrap();

        if !manifest.keys.iter().any(|k| k.name == name) {
            return Err(SecretError::NotFound(name.to_string()));
        }

        let entry = Self::keyring_entry(name)?;
        entry.set_password(value)?;
        Ok(())
    }

    pub fn delete_secret(&self, name: &str) -> Result<(), SecretError> {
        let mut manifest = self.manifest.lock().unwrap();

        let index = manifest
            .keys
            .iter()
            .position(|k| k.name == name)
            .ok_or_else(|| SecretError::NotFound(name.to_string()))?;

        let entry = Self::keyring_entry(name)?;
        entry.delete_credential()?;

        manifest.keys.remove(index);
        self.save_manifest(&manifest)?;
        Ok(())
    }

    pub fn list_secrets(&self) -> Result<Vec<KeyMeta>, SecretError> {
        let manifest = self.manifest.lock().unwrap();
        Ok(manifest.keys.clone())
    }

    pub fn update_meta(
        &self,
        name: &str,
        tag: Option<&str>,
        memo: Option<&str>,
        is_favorite: Option<bool>,
    ) -> Result<(), SecretError> {
        let mut manifest = self.manifest.lock().unwrap();

        let meta = manifest
            .keys
            .iter_mut()
            .find(|k| k.name == name)
            .ok_or_else(|| SecretError::NotFound(name.to_string()))?;

        if let Some(tag) = tag {
            meta.tag = tag.to_string();
        }
        if let Some(memo) = memo {
            meta.memo = memo.to_string();
        }
        if let Some(fav) = is_favorite {
            meta.is_favorite = fav;
        }

        self.save_manifest(&manifest)?;
        Ok(())
    }

    pub fn get_tags(&self) -> Result<Vec<String>, SecretError> {
        let manifest = self.manifest.lock().unwrap();
        Ok(manifest.tags.clone())
    }

    pub fn add_tag(&self, name: &str) -> Result<(), SecretError> {
        let mut manifest = self.manifest.lock().unwrap();

        if manifest.tags.iter().any(|t| t == name) {
            return Err(SecretError::AlreadyExists(name.to_string()));
        }

        manifest.tags.push(name.to_string());
        self.save_manifest(&manifest)?;
        Ok(())
    }

    pub fn remove_tag(&self, name: &str) -> Result<(), SecretError> {
        let mut manifest = self.manifest.lock().unwrap();

        let index = manifest
            .tags
            .iter()
            .position(|t| t == name)
            .ok_or_else(|| SecretError::NotFound(name.to_string()))?;

        manifest.tags.remove(index);
        self.save_manifest(&manifest)?;
        Ok(())
    }
}
