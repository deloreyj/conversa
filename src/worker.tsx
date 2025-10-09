import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { PackManagement } from "@/app/pages/manage/PackManagement";
import { setCommonHeaders } from "@/app/headers";
import { type User, db, setupDb } from "@/db";
import { createAuth } from "@/lib/auth";
import { env } from "cloudflare:workers";
export { FlashcardPackGenerator } from "./workflows/flashcard-pack-generator";

export type AppContext = {
  user: User | null;
  session: { id: string; userId: string } | null;
};

let auth: ReturnType<typeof createAuth>;

export default defineApp([
  setCommonHeaders(),
  async ({ ctx, request, headers }) => {
    await setupDb(env);
    auth = createAuth();

    const url = new URL(request.url);

    // Redirect non-www to www
    if (url.hostname === "alfacinha.me") {
      return Response.redirect(`https://www.alfacinha.me${url.pathname}${url.search}`, 301);
    }

    // Handle auth routes
    if (url.pathname.startsWith("/api/auth")) {
      return auth.handler(request);
    }

    // Get session and user for all other routes
    const sessionData = await auth.api.getSession({
      headers: request.headers,
    });

    ctx.user = sessionData?.user ?? null;
    ctx.session = sessionData?.session ?? null;
  },
  render(Document, [
    route("/", Home),
    route("/manage/:slug", (req) => <PackManagement slug={req.params.slug} {...req} />),
    route("/login", async () => {
      const { Login } = await import("@/app/pages/auth/Login");
      return <Login />;
    }),
  ]),
]);
