import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "./mongodb";
import User from "@/models/User";

const log = (msg) => process.env.NODE_ENV !== "production" && console.error("[login]", msg);

export const authOptions = {
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: { username: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        try {
          await connectDB();
        } catch (e) {
          log("Koneksi MongoDB gagal: " + e.message);
          throw new Error("DB_ERROR");
        }
        const username = credentials.username.toLowerCase().trim();
        const user = await User.findOne({ username }).select("+password");
        if (!user) { log(`user "${username}" tidak ditemukan di database`); return null; }
        if (!user.aktif) { log(`user "${username}" nonaktif`); return null; }
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) { log(`password salah untuk "${username}"`); return null; }
        return { id: user._id.toString(), name: user.nama, role: user.role, username: user.username };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.username = token.username;
      return session;
    },
  },
};
