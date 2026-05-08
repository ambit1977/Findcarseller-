"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sources } from "@/db/schema";

export function SearchForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [source, setSource] = useState<(typeof sources)[number]>("yahoo_auctions");
  const [keyword, setKeyword] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [area, setArea] = useState("");
  const [extraParams, setExtraParams] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/searches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name || `${source}: ${keyword}`,
          source,
          keyword,
          minPrice: minPrice ? Number(minPrice) : null,
          maxPrice: maxPrice ? Number(maxPrice) : null,
          area: area || null,
          extraParams: extraParams || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">名前 (任意)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: ユーノス ロードスター(ヤフオク)"
          className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">ソース</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as typeof source)}
          className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="yahoo_auctions">ヤフオク</option>
          <option value="jmty">ジモティー</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          キーワード (車種名など)
        </label>
        <input
          required
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="例: ユーノス ロードスター NA6CE"
          className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">最低価格 (円)</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">最高価格 (円)</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          地域 (ジモティー用 / 例: tokyo, osaka, all)
        </label>
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="all"
          className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          追加クエリ (key=value&...) 任意
        </label>
        <input
          value={extraParams}
          onChange={(e) => setExtraParams(e.target.value)}
          placeholder="例: auccat=2084005108"
          className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm font-mono dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
      {error && <p className="text-sm text-red-600">エラー: {error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
