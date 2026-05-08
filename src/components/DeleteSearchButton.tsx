"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function DeleteSearchButton({ searchId }: { searchId: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function trigger() {
    if (!confirm("この検索条件と関連する出品履歴を削除します。よろしいですか?")) {
      return;
    }
    start(async () => {
      const res = await fetch(`/api/searches/${searchId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={trigger}
      disabled={pending}
      className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-950"
    >
      {pending ? "削除中..." : "削除"}
    </button>
  );
}
