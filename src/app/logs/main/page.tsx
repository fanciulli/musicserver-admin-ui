import { LogsCard } from "@/components/Logs/logs-card";

export default function MainLogsPage() {
  return (
    <div className="space-y-6">
      <LogsCard title="Main" logKey="main" />
    </div>
  );
}
