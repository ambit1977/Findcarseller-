"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function PollButton({ searchId }: { searchId?: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function trigger() {
    start(async () => {
      setMsg(null);
      const url = searchId ? `/api/poll?id=${searchId}` : "/api/poll";
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMsg(`エラー: ${data.error ?? res.statusText}`);
        return;
      }
      const total = searchId
        ? data.result?.inserted ?? 0
        : (data.results ?? []).reduce(
            (n: number, r: { inserted: number }) => n + r.inserted,
            0,
          );
      setMsg(`新着 ${total} 件`);
      router.refresh();
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={trigger}
        disabled={pending}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "巡回中..." : searchId ? "この検索を今すぐ巡回" : "全件を今すぐ巡回"}
      </button>
      {msg && <span className="text-sm text-neutral-600">{msg}</span>}
    </span>
  );
}
