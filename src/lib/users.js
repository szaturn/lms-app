// kolom profil yang boleh diisi per role
const PROFIL = {
  siswa: ["jenisKelamin", "tempatTanggalLahir", "namaWali"],
  guru: ["jenisKelamin", "email", "mapelUtama", "jabatan", "pendidikan"],
  kurikulum: [],
  kepsek: [],
};

export function pickProfil(body, role) {
  const out = {};
  for (const k of PROFIL[role] || []) if (body[k] !== undefined) out[k] = String(body[k]).trim();
  return out;
}
