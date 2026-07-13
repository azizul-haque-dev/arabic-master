import { useQuery } from "@tanstack/react-query";
import { BookText, MessageSquareText, Tags } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchCategories } from "@/features/categories/api";
import { fetchWords } from "@/features/words/api";
import { fetchSentences } from "@/features/sentences/api";
import { useAuthStore } from "@/stores/auth.store";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: words } = useQuery({ queryKey: ["words", { page: 1, limit: 1 }], queryFn: () => fetchWords({ limit: 1 }) });
  const { data: sentences } = useQuery({
    queryKey: ["sentences", { page: 1, limit: 1 }],
    queryFn: () => fetchSentences({ limit: 1 }),
  });

  const stats = [
    { label: "Words", value: words?.meta.total, icon: BookText },
    { label: "Sentences", value: sentences?.meta.total, icon: MessageSquareText },
    { label: "Categories", value: categories?.length, icon: Tags },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Welcome back{user ? `, ${user.name}` : ""}</h1>
        <p className="text-sm text-muted">A quick look at the content library.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted">{label}</CardTitle>
              <Icon className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-ink">{value ?? "—"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
