export const NOTIFICATIONS_REFRESH_EVENT = "notifications:refresh";

export type NotificationType = "info" | "success" | "warning" | "error";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
};
