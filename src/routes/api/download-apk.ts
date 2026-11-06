import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs";
import path from "node:path";

export const Route = createFileRoute("/api/download-apk")({
  server: {
    handlers: {
      GET: async () => {
        const filePath = path.resolve(process.cwd(), "public/downloads/faczz-v2.6.0.apk");
        if (!fs.existsSync(filePath)) {
          return new Response("APK file not found", { status: 404 });
        }
        const fileBuffer = fs.readFileSync(filePath);
        return new Response(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.android.package-archive",
            "Content-Disposition": 'attachment; filename="faczz-v2.6.0.apk"',
            "Content-Length": fileBuffer.length.toString(),
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
