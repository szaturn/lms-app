// Membuat / mereset akun admin.
//   npm run seed          -> buat admin jika belum ada
//   npm run seed:reset    -> paksa set ulang password admin sesuai .env.local
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI belum diisi di .env.local");

const username = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
const password = (process.env.ADMIN_PASSWORD || "admin12345").trim();
const reset = process.argv.includes("--reset");

await mongoose.connect(uri);
console.log("Terhubung ke database:", mongoose.connection.name);

const users = mongoose.connection.collection("users");
const existing = await users.findOne({ username });
const hash = await bcrypt.hash(password, 10);
const now = new Date();

if (!existing) {
  await users.insertOne({ nama: "Administrator", username, password: hash, role: "admin", kelas: null, aktif: true, createdAt: now, updatedAt: now });
  console.log(`Admin dibuat -> username: ${username} | password: ${password}`);
} else if (reset) {
  await users.updateOne({ username }, { $set: { password: hash, role: "admin", aktif: true, updatedAt: now } });
  console.log(`Password admin di-reset -> username: ${username} | password: ${password}`);
} else {
  console.log(`Admin "${username}" sudah ada, tidak diubah. Jika lupa password, jalankan: npm run seed:reset`);
}
await mongoose.disconnect();
