/**
 * Hitung skor per soal & nilai akhir (0-100) sebuah attempt.
 * - pilihan ganda: otomatis dari kunci
 * - esai: memakai skor yang diberikan guru (skorEsai = { [soalId]: angka })
 */
export function hitungAttempt(asesmen, jawaban, skorEsai = {}) {
  let total = 0;
  let maks = 0;
  const hasil = asesmen.soal.map((s) => {
    const bobot = Number(s.bobot) || 0;
    maks += bobot;
    const j = jawaban.find((x) => String(x.soal) === String(s._id)) || {};
    let skor = 0;
    if (s.tipe === "pilihan_ganda") {
      skor = j.pilihan === s.kunci ? bobot : 0;
    } else {
      const given = skorEsai[String(s._id)] ?? j.skor ?? 0;
      skor = Math.min(bobot, Math.max(0, Number(given) || 0));
    }
    total += skor;
    return { soal: s._id, pilihan: j.pilihan, teks: j.teks || "", skor };
  });
  return { jawaban: hasil, nilai: maks > 0 ? Math.round((total / maks) * 1000) / 10 : 0 };
}
