// lib/store.js
//
// Penyimpanan JSON sederhana di folder database/ untuk fitur baru
// (catatan, todo, skor game, dll). Menulis dengan pola aman: tulis ke file
// sementara lalu rename, supaya database tidak korup kalau proses berhenti.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(__dirname, '..', 'database')

function ensureDir() {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function dbPath(name) {
    ensureDir()
    return path.join(dir, `${name}.json`)
}

export function read(name, fallback = {}) {
    const file = dbPath(name)
    try {
        if (!fs.existsSync(file)) return fallback
        const raw = fs.readFileSync(file, 'utf8').trim()
        if (!raw) return fallback
        return JSON.parse(raw)
    } catch {
        return fallback
    }
}

export function write(name, data) {
    const file = dbPath(name)
    ensureDir()
    const tmp = `${file}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
    fs.renameSync(tmp, file)
    return data
}

export function update(name, fallback, mutator) {
    const data = read(name, fallback)
    const result = mutator(data)
    return write(name, result === undefined ? data : result)
}

// kunci percakapan (nomor user), dipakai untuk catatan/todo per pengguna
export function userKey(m, scope = 'global') {
    const number = String(m?.sender || '').split('@')[0].split(':')[0]
    return `${scope}:${number}`
}
