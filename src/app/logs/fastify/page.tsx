import { LogsCard } from "@/components/Logs/logs-card";

export default function FastifyLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-dark dark:text-white">
          Fastify
        </h1>
      </div>

      <LogsCard logKey="fastify" />
    </div>
  );
}
