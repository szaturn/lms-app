// Helper fetch untuk komponen client. Melempar Error(message) jika respons tidak ok.
export async function api(url, options = {}) {
  const { body, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan");
  return data;
}

// Untuk upload file (multipart/form-data). Jangan set Content-Type manual.
export async function apiForm(url, method, formData) {
  const res = await fetch(url, { method, body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan");
  return data;
}
