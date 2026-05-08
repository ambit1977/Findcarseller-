import { SearchForm } from "@/components/SearchForm";

export default function NewSearchPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">検索条件を追加</h1>
      <SearchForm />
    </div>
  );
}
