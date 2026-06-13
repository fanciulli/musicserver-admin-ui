import type { Metadata } from "next";
import { NotificationsCard } from "./_components/notifications-card";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <NotificationsCard />
    </div>
  );
}
