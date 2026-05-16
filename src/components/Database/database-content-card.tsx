"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

type DbSummary = {
  artists: number;
  albums: number;
  songs: number;
};

type ArtistItem = {
  id: string;
  name: string;
  pluginId: string;
};

type AlbumItem = {
  id: string;
  name: string;
  pluginId: string;
  artists: string[];
};

type SongItem = {
  id: string;
  name: string;
  pluginId: string;
  albumId: string;
  trackNumber?: number;
  duration?: number;
};

type ListState<T> = {
  items: T[];
  loading: boolean;
  error: string | null;
};

const EMPTY_SUMMARY: DbSummary = {
  artists: 0,
  albums: 0,
  songs: 0,
};

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function formatDuration(seconds?: number): string {
  if (seconds === undefined || Number.isNaN(seconds)) {
    return "—";
  }

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function CounterCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-stroke bg-[#F7F9FC] px-5 py-4 dark:border-dark-3 dark:bg-dark-2">
      <p className="text-sm text-dark-4 dark:text-dark-6">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-dark dark:text-white">
        {loading ? "…" : value.toLocaleString()}
      </p>
    </div>
  );
}

function ListPanel<T extends { id: string }>({
  title,
  items,
  loading,
  error,
  emptyLabel,
  columns,
}: {
  title: string;
  items: T[];
  loading: boolean;
  error: string | null;
  emptyLabel: string;
    columns: Array<{
      key: string;
      label: string;
      className?: string;
      render: (item: T) => ReactNode;
    }>;
}) {
  return (
    <section className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="border-b border-stroke px-4 py-4 dark:border-dark-3 sm:px-5">
        <h3 className="text-lg font-semibold text-dark dark:text-white">
          {title}
        </h3>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-3 [&>th]:text-sm [&>th]:text-dark [&>th]:dark:text-white">
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow className="border-[#eee] dark:border-dark-3">
              <TableCell
                colSpan={columns.length}
                className="py-6 text-center text-dark-4 dark:text-dark-6"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow className="border-[#eee] dark:border-dark-3">
              <TableCell
                colSpan={columns.length}
                className="py-6 text-center text-[#D34053]"
              >
                {error}
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow className="border-[#eee] dark:border-dark-3">
              <TableCell
                colSpan={columns.length}
                className="py-6 text-center text-dark-4 dark:text-dark-6"
              >
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="border-[#eee] dark:border-dark-3">
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}

export function DatabaseContentCard() {
  const [summary, setSummary] = useState<DbSummary>(EMPTY_SUMMARY);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [artistsState, setArtistsState] = useState<ListState<ArtistItem>>({
    items: [],
    loading: true,
    error: null,
  });
  const [albumsState, setAlbumsState] = useState<ListState<AlbumItem>>({
    items: [],
    loading: false,
    error: null,
  });
  const [songsState, setSongsState] = useState<ListState<SongItem>>({
    items: [],
    loading: false,
    error: null,
  });
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const response = await fetch("/api/admin/db/summary", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to load summary (${response.status})`);
      }

      const payload = (await response.json()) as DbSummary;
      setSummary(payload);
    } catch (error) {
      setSummaryError(toErrorMessage(error, "Failed to load summary"));
      setSummary(EMPTY_SUMMARY);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadArtists = useCallback(async () => {
    setArtistsState((previousState) => ({
      ...previousState,
      loading: true,
      error: null,
    }));

    try {
      const response = await fetch("/api/admin/db/artists", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to load artists (${response.status})`);
      }

      const payload = (await response.json()) as ArtistItem[];
      setArtistsState({
        items: payload,
        loading: false,
        error: null,
      });
    } catch (error) {
      setArtistsState({
        items: [],
        loading: false,
        error: toErrorMessage(error, "Failed to load artists"),
      });
    }
  }, []);

  const loadAlbums = useCallback(async (artistId: string) => {
    setAlbumsState({
      items: [],
      loading: true,
      error: null,
    });

    try {
      const response = await fetch(
        `/api/admin/db/artists/${encodeURIComponent(artistId)}/albums`,
        {
          cache: "no-store",
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to load albums (${response.status})`);
      }

      const payload = (await response.json()) as AlbumItem[];
      setAlbumsState({
        items: payload,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAlbumsState({
        items: [],
        loading: false,
        error: toErrorMessage(error, "Failed to load albums"),
      });
    }
  }, []);

  const loadSongs = useCallback(async (albumId: string) => {
    setSongsState({
      items: [],
      loading: true,
      error: null,
    });

    try {
      const response = await fetch(
        `/api/admin/db/albums/${encodeURIComponent(albumId)}/songs`,
        {
          cache: "no-store",
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to load songs (${response.status})`);
      }

      const payload = (await response.json()) as SongItem[];
      setSongsState({
        items: payload,
        loading: false,
        error: null,
      });
    } catch (error) {
      setSongsState({
        items: [],
        loading: false,
        error: toErrorMessage(error, "Failed to load songs"),
      });
    }
  }, []);

  const refreshContent = useCallback(async () => {
    setSelectedArtistId(null);
    setSelectedAlbumId(null);
    setAlbumsState({
      items: [],
      loading: false,
      error: null,
    });
    setSongsState({
      items: [],
      loading: false,
      error: null,
    });

    await Promise.all([loadSummary(), loadArtists()]);
  }, [loadArtists, loadSummary]);

  useEffect(() => {
    void refreshContent();
  }, [refreshContent]);

  const selectedArtist = useMemo(
    () =>
      artistsState.items.find((artist) => artist.id === selectedArtistId) ?? null,
    [artistsState.items, selectedArtistId],
  );
  const selectedAlbum = useMemo(
    () => albumsState.items.find((album) => album.id === selectedAlbumId) ?? null,
    [albumsState.items, selectedAlbumId],
  );

  return (
    <section className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dark dark:text-white">
            Database Content
          </h2>
          <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
            Review indexed artists, albums, and songs and drill down through the
            current database contents.
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-lg border border-stroke px-3 py-2 text-sm font-medium text-dark transition hover:bg-gray-100 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          onClick={() => {
            void refreshContent();
          }}
        >
          Refresh
        </button>
      </div>

      {summaryError && (
        <div className="mb-4 rounded-lg border border-[#D34053]/30 bg-[#D34053]/10 px-3 py-2 text-sm text-[#D34053]">
          {summaryError}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <CounterCard
          label="Artists"
          value={summary.artists}
          loading={summaryLoading}
        />
        <CounterCard
          label="Albums"
          value={summary.albums}
          loading={summaryLoading}
        />
        <CounterCard label="Songs" value={summary.songs} loading={summaryLoading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ListPanel
          title="Artists"
          items={artistsState.items}
          loading={artistsState.loading}
          error={artistsState.error}
          emptyLabel="No artists found."
          columns={[
            {
              key: "name",
              label: "Name",
              render: (artist) => (
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-lg px-2 py-1 text-left text-sm text-dark transition hover:bg-gray-100 dark:text-white dark:hover:bg-dark-2",
                    selectedArtistId === artist.id &&
                      "bg-primary/10 font-semibold text-primary dark:bg-primary/20 dark:text-primary",
                  )}
                  aria-pressed={selectedArtistId === artist.id}
                  onClick={() => {
                    setSelectedArtistId(artist.id);
                    setSelectedAlbumId(null);
                    setSongsState({
                      items: [],
                      loading: false,
                      error: null,
                    });
                    void loadAlbums(artist.id);
                  }}
                >
                  <span className="block">{artist.name}</span>
                  <span className="mt-1 block text-xs text-dark-4 dark:text-dark-6">
                    {artist.pluginId}
                  </span>
                </button>
              ),
            },
          ]}
        />

        <ListPanel
          title={
            selectedArtist ? `Albums · ${selectedArtist.name}` : "Albums"
          }
          items={albumsState.items}
          loading={albumsState.loading}
          error={albumsState.error}
          emptyLabel={
            selectedArtistId === null
              ? "Select an artist to load albums."
              : "No albums found for the selected artist."
          }
          columns={[
            {
              key: "name",
              label: "Name",
              render: (album) => (
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-lg px-2 py-1 text-left text-sm text-dark transition hover:bg-gray-100 dark:text-white dark:hover:bg-dark-2",
                    selectedAlbumId === album.id &&
                      "bg-primary/10 font-semibold text-primary dark:bg-primary/20 dark:text-primary",
                  )}
                  aria-pressed={selectedAlbumId === album.id}
                  onClick={() => {
                    setSelectedAlbumId(album.id);
                    void loadSongs(album.id);
                  }}
                >
                  <span className="block">{album.name}</span>
                  <span className="mt-1 block text-xs text-dark-4 dark:text-dark-6">
                    {album.pluginId}
                  </span>
                </button>
              ),
            },
          ]}
        />

        <ListPanel
          title={selectedAlbum ? `Songs · ${selectedAlbum.name}` : "Songs"}
          items={songsState.items}
          loading={songsState.loading}
          error={songsState.error}
          emptyLabel={
            selectedAlbumId === null
              ? "Select an album to load songs."
              : "No songs found for the selected album."
          }
          columns={[
            {
              key: "track",
              label: "#",
              className: "w-16",
              render: (song) => song.trackNumber ?? "—",
            },
            {
              key: "name",
              label: "Title",
              render: (song) => (
                <div>
                  <span className="block text-dark dark:text-white">
                    {song.name}
                  </span>
                  <span className="mt-1 block text-xs text-dark-4 dark:text-dark-6">
                    {song.pluginId}
                  </span>
                </div>
              ),
            },
            {
              key: "duration",
              label: "Duration",
              className: "w-24",
              render: (song) => formatDuration(song.duration),
            },
          ]}
        />
      </div>
    </section>
  );
}
