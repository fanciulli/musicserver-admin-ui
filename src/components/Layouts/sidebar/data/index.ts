import { Database, Settings, Logs, KeyRound, ToyBrick } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavSubItem = { title: string; url: string };
type NavItem = { title: string; url?: string; icon: LucideIcon; items: NavSubItem[] };
type NavSection = { label: string; icon?: LucideIcon; items: NavItem[] };

export const NAV_DATA: NavSection[] = [
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
