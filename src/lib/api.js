import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import { connectDB } from "./mongodb";
import { UserError } from "./errors";

export const json = (body, status = 200) => NextResponse.json(body, { status });

/** Pembungkus route API per role: cek login + role, koneksi DB, dan penanganan error umum. */
function makeRoute(roles) {
  return (handler) => async (req, ctx) => {
    const session = await getServerSession(authOptions);
    if (!session) return json({ message: "Belum login" }, 401);
    if (!roles.includes(session.user.role)) return json({ message: "Tidak punya akses" }, 403);
    try {
      await connectDB();
      return await handler(req, ctx, session);
    } catch (e) {
      if (e instanceof UserError) return json({ message: e.message }, e.status);
      if (e.code === 11000) return json({ message: "Data sudah ada (duplikat)" }, 409);
      if (e.name === "CastError" || e.name === "ValidationError" || e.name === "SyntaxError")
        return json({ message: "Data tidak valid" }, 400);
      console.error(e);
      return json({ message: "Terjadi kesalahan server" }, 500);
    }
  };
}

export const adminRoute = makeRoute(["admin"]);
export const guruRoute = makeRoute(["guru"]);
