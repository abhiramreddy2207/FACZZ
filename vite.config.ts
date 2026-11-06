import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const apkHeadersPlugin = () => ({
  name: "apk-headers-plugin",
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url && req.url.includes(".apk")) {
        const match = req.url.match(/([^/?#]+\.apk)/);
        const filename = match ? match[1] : "faczz-v2.6.0.apk";
        res.setHeader("Content-Type", "application/vnd.android.package-archive");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      }
      next();
    });
  },
  configurePreviewServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url && req.url.includes(".apk")) {
        const match = req.url.match(/([^/?#]+\.apk)/);
        const filename = match ? match[1] : "faczz-v2.6.0.apk";
        res.setHeader("Content-Type", "application/vnd.android.package-archive");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      }
      next();
    });
  },
});

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [apkHeadersPlugin()],
  },
});
