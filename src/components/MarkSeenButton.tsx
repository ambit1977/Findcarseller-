"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function MarkSeenButton({
  searchId,
  all,
}: {
  searchId?: number;
  all?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function trigger() {
    start(async () => {
      await fetch("/api/listings/seen", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(searchId ? { searchId } : { all: true }),
      });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={trigger}
      disabled={pending}
      className="rounded border px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
    >
      {pending ? "処理中..." : all ? "全て既読にする" : "既読にする"}
    </button>
  );
}
