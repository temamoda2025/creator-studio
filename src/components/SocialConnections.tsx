"use client";

import { useState, useEffect, useCallback } from "react";

interface Connection {
  id: string;
  platform: string;
  platform_user_id: string | null;
  platform_username: string | null;
  connected_at: string;
  expires_at: string | null;
}

const PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram",
    description: "Share photos, carousels and reels",
    startPath: "/api/auth/instagram/start",
  },
  {
    id: "tiktok",
    label: "TikTok",
    description: "Short-form video content",
    startPath: "/api/auth/tiktok/start",
  },
  {
    id: "youtube",
    label: "YouTube",
    description: "Long-form and Shorts content",
    startPath: "/api/auth/youtube/start",
  },
] as const;

export default function SocialConnections({ brandId }: { brandId: string }) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/social/connections?brand_id=${brandId}`);
    if (res.ok) {
      const data = await res.json() as { connections: Connection[] };
      setConnections(data.connections ?? []);
    }
    setLoading(false);
  }, [brandId]);

  useEffect(() => { loadConnections(); }, [loadConnections]);

  // Read OAuth result from URL params on mount (set by callback routes)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("social_connected");
    const error = params.get("social_error");

    if (connected || error) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (connected) {
      const label = PLATFORMS.find(p => p.id === connected)?.label ?? connected;
      setNotice({ text: `${label} connected`, ok: true });
      const t = setTimeout(() => setNotice(null), 4000);
      return () => clearTimeout(t);
    }
    if (error) {
      const label = PLATFORMS.find(p => p.id === error)?.label ?? error;
      setNotice({ text: `Could not connect ${label} — please try again`, ok: false });
      const t = setTimeout(() => setNotice(null), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  const disconnect = async (conn: Connection) => {
    setDisconnecting(conn.id);
    const res = await fetch(`/api/social/connections?id=${conn.id}`, { method: "DELETE" });
    if (res.ok) {
      setConnections(prev => prev.filter(c => c.id !== conn.id));
    }
    setDisconnecting(null);
  };

  const connectionFor = (platform: string) =>
    connections.find(c => c.platform === platform) ?? null;

  return (
    <div className="bg-white border border-black/10 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold">Connected Accounts</h2>
        {notice && (
          <span
            className={`text-xs border px-3 py-1 rounded-full transition-opacity ${
              notice.ok
                ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                : "border-red-200 text-red-600 bg-red-50"
            }`}
          >
            {notice.ok ? "✓ " : ""}{notice.text}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-5 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-3 bg-black/8 rounded w-20" />
                <div className="h-2.5 bg-black/5 rounded w-32" />
              </div>
              <div className="h-7 bg-black/5 rounded w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-black/6">
          {PLATFORMS.map(({ id, label, description, startPath }) => {
            const conn = connectionFor(id);
            return (
              <div key={id} className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-black/80">{label}</p>
                  <p className="text-xs text-black/40 mt-0.5">
                    {conn
                      ? conn.platform_username
                        ? `@${conn.platform_username}`
                        : "Connected"
                      : description}
                  </p>
                </div>

                <div className="shrink-0">
                  {conn ? (
                    <button
                      onClick={() => disconnect(conn)}
                      disabled={disconnecting === conn.id}
                      className="text-xs text-black/40 hover:text-red-500 border border-black/12 hover:border-red-200 px-3 py-1.5 rounded transition-colors disabled:opacity-40"
                    >
                      {disconnecting === conn.id ? "Disconnecting…" : "Disconnect"}
                    </button>
                  ) : (
                    <a
                      href={`${startPath}?brand_id=${brandId}`}
                      className="text-xs font-medium border border-black px-4 py-1.5 rounded hover:bg-black hover:text-white transition-colors"
                    >
                      Connect
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
