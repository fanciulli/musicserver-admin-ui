import { PluginsCard } from "@/components/Plugins/plugins-card";

export default function PluginsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-dark dark:text-white">
          Plugins
        </h1>
      </div>

      <PluginsCard />
    </div>
  );
}
