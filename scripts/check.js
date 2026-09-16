#!/usr/bin/env node
// scripts/check.js
//
// Pemeriksa kesehatan project — jalankan dengan:  npm run check
//
// Memeriksa:
//   1. Semua file .js bisa di-parse (syntax)
//   2. Semua file .json valid
//   3. Semua import internal (./ ../) benar-benar ada
//   4. Semua nama yang di-import dari file internal benar-benar di-export
//      (inilah yang gagal kalau ada file yang belum ikut ter-update)
//
// Cocok dijalankan setelah upload untuk memastikan tidak ada file yang tertinggal.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const problems = []
const files = { js: [], json: [] }

function walk(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        if (['node_modules', 'session', '.git', 'tmp'].includes(item.name)) continue
        const full = path.join(dir, item.name)
        if (item.isDirectory()) walk(full)
        else if (item.name.endsWith('.js')) files.js.push(full)
        else if (item.name.endsWith('.json')) files.json.push(full)
    }
}
walk(root)

const rel = (file) => path.relative(root, file)
const ok = (msg) => console.log(`  ✔ ${msg}`)
const bad = (msg) => { console.log(`  ✘ ${msg}`); problems.push(msg) }

// -------------------------------------------------------------------- 1. syntax
console.log('\n[1/4] Syntax file JavaScript')
{
    const { spawnSync } = await import('child_process')
    let failed = 0
    for (const file of files.js) {
        const run = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
        if (run.status !== 0) {
            failed++
            const line = (run.stderr || '').split('\n').find(l => l.includes('Error')) || 'syntax error'
            bad(`${rel(file)} → ${line.trim()}`)
        }
    }
    if (!failed) ok(`${files.js.length} file .js valid`)
}

// -------------------------------------------------------------------- 2. json
console.log('\n[2/4] Validitas file JSON')
{
    let failed = 0
    for (const file of files.json) {
        try {
            if (!fs.readFileSync(file, 'utf8').trim()) throw new Error('file kosong')
            JSON.parse(fs.readFileSync(file, 'utf8'))
        } catch (e) {
            failed++
            bad(`${rel(file)} → ${e.message}`)
        }
    }
    if (!failed) ok(`${files.json.length} file .json valid`)
}

// -------------------------------------------------------------------- 3-4. import
console.log('\n[3/4] Import internal menunjuk ke file yang ada')

const IMPORT_RE = /(?:^|\n)\s*(?:import|export)\s+([\s\S]*?)\s*from\s*['"]([^'"]+)['"]/g
const SIDE_EFFECT_RE = /(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g

const resolveTarget = (spec, fromFile) => {
    const base = path.resolve(path.dirname(fromFile), spec)
    for (const candidate of [base, `${base}.js`, path.join(base, 'index.js')]) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate
    }
    return null
}

// Ambil daftar export dari sebuah file (termasuk export const { a, b } = ...)
function exportsOf(file) {
    const src = fs.readFileSync(file, 'utf8')
    const names = new Set()
    let hasDefault = false

    const pushList = (list) => {
        for (const raw of list.split(',')) {
            const name = raw.trim().split(/\s+as\s+/).pop().trim()
            if (name && /^[A-Za-z_$][\w$]*$/.test(name)) names.add(name)
        }
    }

    for (const m of src.matchAll(/export\s+(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/g)) names.add(m[1])
    for (const m of src.matchAll(/export\s+class\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1])
    for (const m of src.matchAll(/export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1])
    for (const m of src.matchAll(/export\s+(?:const|let|var)\s*\{([^}]*)\}/g)) pushList(m[1])
    for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) pushList(m[1])
    if (/export\s+default\b/.test(src)) hasDefault = true

    // re-export bintang: export * from '...' → anggap semua nama ada
    const star = /export\s*\*\s*from\s*['"][^'"]+['"]/.test(src)

    return { names, hasDefault, star }
}

{
    let checked = 0
    let missingFile = 0
    let missingExport = 0

    for (const file of files.js) {
        const src = fs.readFileSync(file, 'utf8')
        const specs = []

        for (const m of src.matchAll(IMPORT_RE)) specs.push({ clause: m[1], spec: m[2] })
        for (const m of src.matchAll(SIDE_EFFECT_RE)) specs.push({ clause: null, spec: m[1] })

        for (const { clause, spec } of specs) {
            if (!spec.startsWith('.')) continue   // hanya import internal
            if (spec.includes('${')) continue     // path dinamis (template literal) — tidak bisa diverifikasi statis
            checked++

            const target = resolveTarget(spec, file)
            if (!target) {
                missingFile++
                bad(`${rel(file)} → import "${spec}" : FILE TIDAK DITEMUKAN`)
                continue
            }

            if (!clause) continue
            const info = exportsOf(target)

            // import default
            if (/^\s*[A-Za-z_$][\w$]*\s*,/.test(clause) || /^\s*[A-Za-z_$][\w$]*\s*$/.test(clause)) {
                const isDefault = !clause.trim().startsWith('{') && !clause.trim().startsWith('*')
                if (isDefault && !info.hasDefault && !info.star) {
                    missingExport++
                    bad(`${rel(file)} → "${spec}" : tidak ada export default`)
                    continue
                }
            }

            // import { a, b as c }
            const braced = clause.match(/\{([^}]*)\}/)
            if (braced) {
                const wanted = braced[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean)
                const missing = wanted.filter(name => !info.names.has(name) && !info.star)
                if (missing.length) {
                    missingExport++
                    bad(`${rel(file)} → "${spec}" : TIDAK ADA export bernama ${missing.join(', ')}`)
                    bad(`     ↑ biasanya karena ${rel(target)} masih versi lama / belum ikut ter-upload`)
                }
            }
        }
    }

    if (!missingFile && checked > 0) ok(`${checked} import internal menunjuk file yang benar`)
    if (!missingExport && checked > 0) ok('semua nama yang di-import tersedia di file tujuannya')
}

// -------------------------------------------------------------------- ringkasan
console.log('\n[4/4] Ringkasan')
if (problems.length) {
    console.log(`\n  ❌ Ditemukan ${problems.length} masalah.`)
    console.log('     Pastikan SELURUH isi project (terutama folder lib/) ikut ter-upload,')
    console.log('     bukan hanya file yang baru kamu ubah.\n')
    process.exit(1)
}

console.log('\n  ✅ Semua pemeriksaan lolos — project siap dijalankan (npm start).\n')
process.exit(0)
