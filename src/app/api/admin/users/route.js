import bcrypt from "bcryptjs";
import User from "@/models/User";
import "@/models/Kelas"; // daftarkan model untuk populate
import { adminRoute, json } from "@/lib/api";
import { cekKapasitas } from "@/lib/kelas";
import { pickProfil } from "@/lib/users";

const MANAGED = ["guru", "siswa", "kurikulum", "kepsek"];
const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/admin/users?role=siswa&q=budi&kelas=<id>&page=1&limit=10
export const GET = adminRoute(async (req) => {
  const sp = new URL(req.url).searchParams;
  const roles = (sp.get("role") || "").split(",").filter((r) => MANAGED.includes(r));
  const q = sp.get("q")?.trim();
  const kelas = sp.get("kelas");
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const limit = Math.max(0, parseInt(sp.get("limit") || "0", 10));

  const filter = { role: { $in: roles.length ? roles : MANAGED } };
  if (q) {
    const rx = new RegExp(escapeRx(q), "i");
    filter.$or = [{ nama: rx }, { username: rx }];
  }
  if (kelas) filter.kelas = kelas;

  const total = await User.countDocuments(filter);
  let query = User.find(filter).populate("kelas", "nama").sort({ nama: 1 });
  if (limit > 0) query = query.skip((page - 1) * limit).limit(limit);
  const users = await query.lean();
  return json({ users, total, page, pages: limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1 });
});

export const POST = adminRoute(async (req) => {
  const body = await req.json();
  const { nama, username, role } = body;
  let { password } = body;

  if (!nama?.trim() || !username?.trim() || !role)
    return json({ message: "Nama, NISN/NIP/username, dan role wajib diisi" }, 400);
  if (!MANAGED.includes(role)) return json({ message: "Role tidak valid" }, 400);

  const uname = username.trim().toLowerCase();
  if (role === "siswa" || role === "guru") {
    if (!/^\d{6,20}$/.test(uname))
      return json({ message: `${role === "siswa" ? "NISN" : "NIP"} harus berupa angka (6-20 digit)` }, 400);
    if (!password) password = uname; // password awal = NISN / NIP
  }
  if (!password || password.length < 6) return json({ message: "Password minimal 6 karakter" }, 400);

  if (role === "siswa" && body.kelas) {
    const penuh = await cekKapasitas(body.kelas);
    if (penuh) return json({ message: penuh }, 400);
  }

  const user = await User.create({
    nama: nama.trim(),
    username: uname,
    password: await bcrypt.hash(password, 10),
    role,
    aktif: body.aktif === false ? false : true,
    kelas: role === "siswa" ? body.kelas || null : null,
    ...pickProfil(body, role),
  });
  return json({ message: "Berhasil ditambahkan", id: user._id }, 201);
});
