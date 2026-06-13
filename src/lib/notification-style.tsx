import { Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { NotificationType } from "@/types/notification";

type NotificationStyle = {
  Icon: typeof Info;
  iconClassName: string;
  badgeClassName: string;
};

const STYLES: Record<NotificationType, NotificationStyle> = {
  info: {
    Icon: Info,
    iconClassName: "text-primary",
    badgeClassName: "bg-primary/10 text-primary",
  },
  success: {
    Icon: CheckCircle,
    iconClassName: "text-green",
    badgeClassName: "bg-green/10 text-green",
  },
  warning: {
    Icon: AlertTriangle,
    iconClassName: "text-yellow-dark",
    badgeClassName: "bg-yellow-light-4 text-yellow-dark",
  },
  error: {
    Icon: XCircle,
    iconClassName: "text-red",
    badgeClassName: "bg-red-light-6 text-red",
  },
};

export function getNotificationStyle(type: NotificationType): NotificationStyle {
  return STYLES[type] ?? STYLES.info;
}
