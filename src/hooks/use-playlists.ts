import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface PlaylistsResponse {
  data: Playlist[];
}

interface CreateInput {
  name: string;
  description?: string;
}

interface UpdateInput {
  name?: string;
  description?: string;
}

const KEY = "user/playlists";

async function post<T>(path: string, body: unknown): Promise<T> {
  return fetchBayaan<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function put<T>(path: string, body: unknown): Promise<T> {
  return fetchBayaan<T>(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function del<T>(path: string): Promise<T> {
  return fetchBayaan<T>(path, { method: "DELETE" });
}

export function usePlaylists() {
  const { data, error, isLoading, mutate } = useSWR<PlaylistsResponse>(KEY, fetchBayaan, {
    revalidateOnFocus: false,
  });
  const playlists = data?.data ?? [];

  async function createPlaylist(input: CreateInput): Promise<Playlist> {
    const response = await post<{ data: Playlist }>(KEY, input);
    await mutate();
    return response.data;
  }

  async function updatePlaylist(id: string, input: UpdateInput): Promise<Playlist | null> {
    const response = await put<{ data: Playlist }>(`${KEY}/${id}`, input);
    await mutate(
      (current) => ({
        data: (current?.data ?? []).map((p) => (p.id === id ? response.data : p)),
      }),
      { revalidate: false },
    );
    return response.data;
  }

  async function deletePlaylist(id: string): Promise<void> {
    await mutate((current) => ({ data: (current?.data ?? []).filter((p) => p.id !== id) }), {
      revalidate: false,
    });
    try {
      await del(`${KEY}/${id}`);
    } catch (err) {
      await mutate();
      throw err;
    }
  }

  return {
    playlists,
    isLoading,
    error,
    mutate,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
  };
}
