import { invoke } from "@tauri-apps/api/core";

export type KeyMeta = {
  name: string;
  tag: string;
  memo: string;
  is_favorite: boolean;
};

export async function fetchSecrets(): Promise<KeyMeta[]> {
  return invoke<KeyMeta[]>("list_secrets");
}

export async function saveSecret(
  name: string,
  value: string,
  tag: string,
  memo: string
): Promise<void> {
  return invoke("save_secret", { name, value, tag, memo });
}

export async function revealSecret(name: string): Promise<string> {
  return invoke<string>("get_secret", { name });
}

export async function deleteSecret(name: string): Promise<void> {
  return invoke("delete_secret", { name });
}

export async function updateSecretMeta(
  name: string,
  updates: { tag?: string; memo?: string; is_favorite?: boolean }
): Promise<void> {
  // Tauri v2 renames command args to camelCase (rename_all = "camelCase").
  // We must send camelCase keys and explicit null for missing optional params.
  return invoke("update_secret_meta", {
    name,
    tag: updates.tag ?? null,
    memo: updates.memo ?? null,
    isFavorite: updates.is_favorite ?? null,
  });
}

export async function fetchTags(): Promise<string[]> {
  return invoke<string[]>("get_tags");
}

export async function addTag(name: string): Promise<void> {
  return invoke("add_tag", { name });
}

export async function removeTag(name: string): Promise<void> {
  return invoke("remove_tag", { name });
}
