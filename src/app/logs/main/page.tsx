import { LogsCard } from "@/components/Logs/logs-card";

export default function MainLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-dark dark:text-white">
          Main
        </h1>
      </div>

      <LogsCard logKey="main" />
    </div>
  );
}
