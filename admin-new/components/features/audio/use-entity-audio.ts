"use client";

import { useEffect, useState } from "react";
import { listEntityAudios } from "@/lib/audio/audio-client";
import type { EntityAudio } from "@/lib/audio/types";

export type AudioLoadStatus = "idle" | "loading" | "success" | "error";

export interface UseEntityAudioReturn {
  audios: EntityAudio[];
  status: AudioLoadStatus;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEntityAudio(
  entityId: string | null | undefined
): UseEntityAudioReturn {
  const [data, setData] = useState<{
    audios: EntityAudio[];
    status: AudioLoadStatus;
    error: string | null;
  }>({
    audios: [],
    status: entityId ? "loading" : "idle",
    error: null,
  });

  const [fetchVersion, setFetchVersion] = useState(0);

  const refetch = async () => {
    setData((prev) => ({ ...prev, status: "loading", error: null }));
    setFetchVersion((v) => v + 1);
  };

  // Adjust state during render when entityId prop changes
  const [prevEntityId, setPrevEntityId] = useState(entityId);
  if (entityId !== prevEntityId) {
    setPrevEntityId(entityId);
    setData({
      audios: [],
      status: entityId ? "loading" : "idle",
      error: null,
    });
  }

  useEffect(() => {
    if (!entityId) {
      return;
    }

    let active = true;

    listEntityAudios(entityId)
      .then((audios) => {
        if (!active) return;
        setData({
          audios,
          status: "success",
          error: null,
        });
      })
      .catch((err) => {
        if (!active) return;
        const msg = err instanceof Error ? err.message : "Failed to load audio list.";
        setData({
          audios: [],
          status: "error",
          error: msg,
        });
      });

    return () => {
      active = false;
    };
  }, [entityId, fetchVersion]);

  return {
    audios: data.audios,
    status: data.status,
    error: data.error,
    refetch,
  };
}
