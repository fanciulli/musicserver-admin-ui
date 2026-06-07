import { createServer as createHttpsServer } from "node:https";
import { createServer as createHttpServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { loadTlsConfig } from "./src/lib/tls/tlsManager";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = parseInt(process.env.PORT ?? "3001", 10);

// When the backend uses HTTPS with a self-signed cert, disable TLS verification
// for server-side fetch calls from this process (admin-ui → backend only).
const backendUrl = process.env.MUSICSERVER_API_BASE_URL ?? "";
if (backendUrl.startsWith("https://")) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn("[TLS] NODE_TLS_REJECT_UNAUTHORIZED=0 set for self-signed backend cert");
}

async function main() {
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  const tlsConfig = await loadTlsConfig();

  const requestHandler = async (
    req: Parameters<typeof handle>[0],
    res: Parameters<typeof handle>[1]
  ) => {
    try {
      const parsedUrl = parse(req!.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request", req!.url, err);
      res!.statusCode = 500;
      res!.end("internal server error");
    }
  };

  if (tlsConfig) {
    createHttpsServer(tlsConfig, requestHandler).listen(port, hostname, () => {
      console.log(`> Ready on https://${hostname}:${port}`);
    });
  } else {
    createHttpServer(requestHandler).listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  }
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
