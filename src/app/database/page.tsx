import { DatabaseContentCard } from "@/components/Database/database-content-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Database",
};

export default function DatabasePage() {
  return (
    <div className="space-y-6">
      <DatabaseContentCard />
    </div>
  );
}
