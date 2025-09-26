import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { PackManagement } from "@/app/pages/manage/PackManagement";
import { setCommonHeaders } from "@/app/headers";
import { userRoutes } from "@/app/pages/user/routes";
import { sessions, setupSessionStore } from "./session/store";
import { Session } from "./session/durableObject";
import { type User, db, setupDb } from "@/db";
import { env } from "cloudflare:workers";
export { SessionDurableObject } from "./session/durableObject";
export { FlashcardPackGenerator } from "./workflows/flashcard-pack-generator";

export type AppContext = {
  session: Session | null;
  user: User | null;
};

export default defineApp([
  setCommonHeaders(),
  async ({ ctx, request, headers }) => {
    await setupDb(env);
    setupSessionStore(env);

    // For now, set a default user context (no authentication)
    ctx.session = null;
    ctx.user = {
      id: "dev-user",
      username: "dev-user",
      createdAt: new Date()
    };
  },
  render(Document, [
    route("/", Home),
    route("/manage/:packId", (req) => <PackManagement packId={req.params.packId} {...req} />),
    route("/protected", () => <div className="p-4">Protected content - you are logged in!</div>),
    prefix("/user", userRoutes),
  ]),
]);
