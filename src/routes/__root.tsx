// Root route: document shell with theme pre-hydration and global 404.
import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

import { THEME_INIT_SCRIPT } from "#/libs/theme.ts";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Verselab - Interactive Skill Learning" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <main className="page-wrap flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-lg text-muted">Halaman tidak ditemukan</p>
    </main>
  );
}

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere selection:bg-accent/20">
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
