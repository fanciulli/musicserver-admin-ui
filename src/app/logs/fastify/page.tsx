import { LogsCard } from "@/components/Logs/logs-card";

export default function FastifyLogsPage() {
  return (
    <div className="space-y-6">
      <LogsCard title="Fastify" logKey="fastify" />
    </div>
  );
}
