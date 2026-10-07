import bcrypt from "bcryptjs";
import User from "@/models/User";
import Kelas from "@/models/Kelas";
import Mapel from "@/models/Mapel";
import { adminRoute, json } from "@/lib/api";
import { cekKapasitas } from "@/lib/kelas";
import { pickProfil } from "@/lib/users";

export const PUT = adminRoute(async (req, { params }) => {
  const body = await req.json();
  const user = await User.findById(params.id);
  if (!user || user.role === "admin") return json({ message: "Pengguna tidak ditemukan" }, 404);

  if (body.nama !== undefined) user.nama = String(body.nama).trim();

  if (body.username !== undefined) {
    const uname = String(body.username).trim().toLowerCase();
    if (uname !== user.username) {
      if ((user.role === "siswa" || user.role === "guru") && !/^\d{6,20}$/.test(uname))
        return json({ message: `${user.role === "siswa" ? "NISN" : "NIP"} harus berupa angka (6-20 digit)` }, 400);
      user.username = uname;
    }
  }

  if (body.aktif !== undefined) user.aktif = !!body.aktif;

  if (user.role === "siswa" && body.kelas !== undefined) {
    const baru = body.kelas || null;
    if (String(baru || "") !== String(user.kelas || "")) {
      const penuh = await cekKapasitas(baru, user._id);
      if (penuh) return json({ message: penuh }, 400);
    }
    user.kelas = baru;
  }

  Object.assign(user, pickProfil(body, user.role));

  if (body.password) {
    if (body.password.length < 6) return json({ message: "Password minimal 6 karakter" }, 400);
    user.password = await bcrypt.hash(body.password, 10);
  }
  await user.save();
  return json({ message: "Berhasil diperbarui" });
});

export const DELETE = adminRoute(async (req, { params }) => {
  const user = await User.findById(params.id);
  if (!user || user.role === "admin") return json({ message: "Pengguna tidak ditemukan" }, 404);
  if (user.role === "guru") {
    await Kelas.updateMany({}, { $pull: { pengajar: { guru: user._id } } });
    await Mapel.updateMany({ guru: user._id }, { $set: { guru: null } });
  }
  await user.deleteOne();
  return json({ message: "Berhasil dihapus" });
});
