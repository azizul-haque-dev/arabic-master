import { extractErrorMessage, mapAudioError } from "./map-audio-error";
import { AudioApiError, type AudioUploadOptions, type EntityAudio } from "./types";

/**
 * Uploads an audio file for an Arabic entity to the Next.js route handler proxy.
 * Uses XMLHttpRequest to provide genuine upload progress events and abort capability.
 */
export function uploadEntityAudio(
  entityId: string,
  options: AudioUploadOptions
): Promise<EntityAudio> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `/api/arabic-entities/${encodeURIComponent(entityId)}/audio`;

    if (options.signal) {
      if (options.signal.aborted) {
        reject(new AudioApiError(0, mapAudioError(0, "Upload was cancelled."), true));
        return;
      }
      options.signal.addEventListener("abort", () => {
        xhr.abort();
      });
    }

    if (xhr.upload && options.onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
          options.onProgress?.(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && json.success) {
          resolve(json.data as EntityAudio);
        } else {
          const extracted = extractErrorMessage(json);
          const errorMsg = mapAudioError(xhr.status, extracted);
          reject(new AudioApiError(xhr.status, errorMsg));
        }
      } catch {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({} as EntityAudio);
        } else {
          reject(new AudioApiError(xhr.status, mapAudioError(xhr.status)));
        }
      }
    };

    xhr.onerror = () => {
      reject(new AudioApiError(0, mapAudioError(0)));
    };

    xhr.onabort = () => {
      reject(new AudioApiError(0, mapAudioError(0, "Upload was cancelled."), true));
    };

    const formData = new FormData();
    formData.append("audio", options.file);
    if (options.variant) {
      formData.append("variant", options.variant.trim().toUpperCase());
    }
    if (options.speaker) {
      formData.append("speaker", options.speaker.trim());
    }

    xhr.open("POST", url, true);
    // Credentials/cookies are included automatically for same-origin requests
    xhr.send(formData);
  });
}

/**
 * Retrieves all audio variants for an Arabic entity.
 */
export async function listEntityAudios(entityId: string): Promise<EntityAudio[]> {
  const url = `/api/arabic-entities/${encodeURIComponent(entityId)}/audio/all`;
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    const errorMsg = extractErrorMessage(json) || mapAudioError(res.status);
    throw new AudioApiError(res.status, errorMsg);
  }

  return Array.isArray(json.data) ? json.data : [];
}

/**
 * Retrieves a fresh playback URL and metadata for a specific audio variant.
 */
export async function getEntityAudio(
  entityId: string,
  variant = "DEFAULT"
): Promise<EntityAudio> {
  const url = `/api/arabic-entities/${encodeURIComponent(entityId)}/audio?variant=${encodeURIComponent(variant)}`;
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    const errorMsg = extractErrorMessage(json) || mapAudioError(res.status);
    throw new AudioApiError(res.status, errorMsg);
  }

  return json.data as EntityAudio;
}

/**
 * Deletes an audio variant for an Arabic entity.
 */
export async function deleteEntityAudio(
  entityId: string,
  variant = "DEFAULT"
): Promise<void> {
  const url = `/api/arabic-entities/${encodeURIComponent(entityId)}/audio?variant=${encodeURIComponent(variant)}`;
  const res = await fetch(url, {
    method: "DELETE",
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    const errorMsg = extractErrorMessage(json) || mapAudioError(res.status);
    throw new AudioApiError(res.status, errorMsg);
  }
}
