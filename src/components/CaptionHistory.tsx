"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface HistoryItem {
  id: string;
  caption: string;
  brandName: string;
  topic: string;
  format: string | null;
  generatedAt: string;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-xs text-black/40 hover:text-black transition-colors border border-black/15 px-3 py-1.5 rounded-full hover:border-black/40"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function CaptionHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("caption_history")
      .select("id, caption, topic, format, created_at, brands(name)")
      .order("created_at", { ascending: false })
      .limit(50)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }) => {
        if (data) {
          setItems(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.map((row: any) => ({
              id: row.id,
              caption: row.caption,
              brandName: row.brands?.name ?? "Unknown",
              topic: row.topic ?? "",
              format: row.format ?? null,
              generatedAt: row.created_at,
            }))
          );
        }
        setLoading(false);
      });
  }, []);

  const remove = async (id: string) => {
    await supabase.from("caption_history").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = async () => {
    const ids = items.map((i) => i.id);
    if (ids.length > 0) {
      await supabase.from("caption_history").delete().in("id", ids);
    }
    setItems([]);
  };

  if (loading) {
    return (
      <div className="bg-white border border-black/10 p-12 text-center">
        <p className="text-sm text-black/30">Loading history…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-black/10 p-12 text-center">
        <p className="text-sm text-black/30">No captions generated yet.</p>
        <p className="text-xs text-black/20 mt-1">
          Generate your first caption using the ADORAR™ Content Generator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-black/30">
          {items.length} caption{items.length !== 1 ? "s" : ""} saved
        </p>
        <button
          onClick={clearAll}
          className="text-xs text-black/30 hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      </div>

      {items.map((item) => (
        <div key={item.id} className="bg-white border border-black/10 p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs border border-black/15 px-2.5 py-1 rounded-full text-black/60">
                {item.brandName}
              </span>
              {item.format && (
                <span className="text-xs border border-black/10 px-2.5 py-1 rounded-full text-black/40">
                  {item.format}
                </span>
              )}
              <span className="text-xs text-black/30">
                {new Date(item.generatedAt).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                at{" "}
                {new Date(item.generatedAt).toLocaleTimeString("en-AU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <p className="text-xs text-black/40 mb-2 leading-relaxed">
            Topic: {item.topic}
          </p>

          <p className="text-sm text-black/80 leading-relaxed whitespace-pre-line bg-zinc-50 border border-black/8 p-4">
            {item.caption}
          </p>

          <div className="flex items-center gap-3 mt-4">
            <CopyBtn text={item.caption} />
            <button
              onClick={() => remove(item.id)}
              className="text-xs text-black/30 hover:text-red-500 transition-colors border border-black/10 px-3 py-1.5 rounded-full hover:border-red-300"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
