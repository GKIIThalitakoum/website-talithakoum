// Sumber data yang sama dengan proyek buletin (satu sumber kebenaran untuk
// daftar Badan Pengurus, supaya tidak perlu diperbarui dua tempat berbeda).
const PUBLISHED_BASE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRGAEeE3Krym8T5OSZU28lC8Wzs3kK70mKUHwq3RGnMDaCiaoo_gGy0EwY1CZDGPa7gVmb7igOj9nc0/pub";
const GID_KONTAK_PENGURUS = "1083480543";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\r") {
        // skip
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += c;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

export async function getKepengurusan() {
  const url = `${PUBLISHED_BASE_URL}?output=csv&gid=${GID_KONTAK_PENGURUS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal mengambil data pengurus (status ${res.status}).`);

  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length === 0) return [];

  const headers = rows[0];
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = r[i] ?? ""));
    return obj;
  });
}
