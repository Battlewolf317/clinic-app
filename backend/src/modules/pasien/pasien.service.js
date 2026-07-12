import * as repo from "./pasien.repository.js";

export class ValidationError extends Error {
  constructor(m) { super(m); this.name = "ValidationError"; }
}

export function list(q) {
  return repo.findAll(q);
}

export async function getById(id) {
  const p = await repo.findById(id);
  if (!p) throw new ValidationError("Pasien tidak ditemukan");
  return p;
}

// generate No. RM otomatis: RM + urut 4 digit
async function genNoRm() {
  const n = await repo.countAll();
  return `RM${String(n + 1).padStart(4, "0")}`;
}

export async function create(d) {
  if (!d.nama) throw new ValidationError("Nama pasien wajib diisi");
  const no_rm = d.no_rm || (await genNoRm());
  try {
    return await repo.insert({ ...d, no_rm });
  } catch (e) {
    if (e.code === "23505") throw new ValidationError("No. RM sudah dipakai");
    throw e;
  }
}

export async function update(id, d) {
  await getById(id);
  if (!d.nama) throw new ValidationError("Nama pasien wajib diisi");
  return repo.update(id, d);
}
