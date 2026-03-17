import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Plugins",
        url: "/plugins",
        icon: Icons.Table,
        items: [],
      },
      {
        title: "Logs",
        icon: Icons.Table,
        items: [
          {
            title: "Main",
            url: "/logs/main",
          },
          {
            title: "Fastify",
            url: "/logs/fastify",
          },
        ],
      },
    ],
  },
];
