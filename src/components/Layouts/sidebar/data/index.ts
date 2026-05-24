import { Database, Settings, Logs, KeyRound, ToyBrick } from "lucide-react";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Database",
        url: "/database",
        icon: Database,
        items: [],
      },
    ],
  },
  {
    label: "SETTINGS",
    icon: Settings,
    items: [
      {
        title: "Plugins",
        url: "/plugins",
        icon: ToyBrick,
        items: [],
      },
      {
        title: "API Keys",
        url: "/pages/api-keys",
        icon: KeyRound,
        items: [],
      },
      {
        title: "Logs",
        url: "/logs/main",
        icon: Logs,
        items: [],
      },
    ],
  },
];
