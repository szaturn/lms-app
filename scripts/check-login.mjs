// Diagnosa login admin. Jalankan: npm run check
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
const username = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
const password = (process.env.ADMIN_PASSWORD || "admin12345").trim();

console.log("1. Isi .env.local");
console.log("   MONGODB_URI     :", uri ? uri.replace(/\/\/([^:/]+):([^@]+)@/, "//$1:***@") : "KOSONG  <-- perbaiki");
console.log("   NEXTAUTH_SECRET :", process.env.NEXTAUTH_SECRET ? "terisi" : "KOSONG  <-- perbaiki");
console.log("   NEXTAUTH_URL    :", process.env.NEXTAUTH_URL || "KOSONG  <-- perbaiki (http://localhost:3000)");
if (!uri) process.exit(1);

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log("2. Koneksi MongoDB : OK, database =", mongoose.connection.name);
} catch (e) {
  console.log("2. Koneksi MongoDB : GAGAL ->", e.message);
  process.exit(1);
}

const users = mongoose.connection.collection("users");
console.log("3. Jumlah user     :", await users.countDocuments());

const u = await users.findOne({ username });
if (!u) {
  const all = await users.find({}, { projection: { username: 1, role: 1 } }).limit(10).toArray();
  console.log(`4. User "${username}" : TIDAK DITEMUKAN  <-- jalankan: npm run seed:reset`);
  console.log("   User yang ada di database:", all.map((x) => `${x.username} (${x.role})`).join(", ") || "(kosong)");
} else {
  console.log(`4. User "${username}" : ditemukan, role = ${u.role}, aktif = ${u.aktif}`);
  const ok = await bcrypt.compare(password, u.password || "");
  console.log("5. Password cocok dengan ADMIN_PASSWORD:", ok ? "YA" : "TIDAK  <-- jalankan: npm run seed:reset");
}
await mongoose.disconnect();
