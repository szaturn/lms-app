import { guruRoute, json } from "@/lib/api";
import { getPenugasan } from "@/lib/penugasan";

export const GET = guruRoute(async (req, ctx, session) => {
  return json({ penugasan: await getPenugasan(session.user.id) });
});
