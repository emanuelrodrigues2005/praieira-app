import { createServer, IncomingMessage, ServerResponse } from "http";

export interface FakeCatalogProfile {
  id: string;
  name?: string;
  publicationStatus: "APPROVED" | "PENDING" | "REJECTED";
  isActive: boolean;
  whatsapp?: string;
  phone?: string;
  name?: string;
  category?: string;
  beach?: string;
  coverImage?: string;
}

export function createFakeCatalogServer(
  profiles: FakeCatalogProfile[] = [],
  port = 3302,
) {
  const server = createServer(
    (req: IncomingMessage, res: ServerResponse) => {
      const match = req.url?.match(/\/catalog\/workers\/(.+)/);
      if (match) {
        const id = match[1];
        const profile = profiles.find((p) => p.id === id);

        res.setHeader("Content-Type", "application/json");

        if (!profile) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: "Not found" }));
          return;
        }

        res.writeHead(200);
        res.end(JSON.stringify(profile));
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: "Not found" }));
    },
  );

  server.on("error", (err: any) => {
    console.error("Fake catalog server error:", err.message);
  });

  server.listen(port, () => {
    console.log(`Fake catalog server listening on port ${port}`);
  });
  return server;
}
