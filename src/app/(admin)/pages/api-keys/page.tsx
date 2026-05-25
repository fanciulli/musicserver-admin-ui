import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { ApiKeysCard } from "./_components/api-keys-card";

export const metadata: Metadata = {
  title: "API Keys",
};

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb pageName="API Keys" />
      <ApiKeysCard />
    </div>
  );
}
