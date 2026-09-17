// lib/ui.js
//
// Bahasa tampilan (design language) Christy MD.
//
// Semua teks yang dilihat pengguna — banner terminal, menu bot, kartu notifikasi,
// kredit — dibangun dari helper di file ini supaya identitas visualnya konsisten
// dan tidak lagi memakai gaya layout bawaan source lama.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(__dirname, '..', 'config.json')

// Palet: cyan → violet (modern, clean, futuristic)
export const THEME = {
    from: '#22d3ee',
    to: '#a78bfa',
    edge: '#38bdf8',
    dim: '#64748b'
}

// Simbol yang dipakai konsisten di seluruh tampilan
export const SYMBOL = {
    mark: '✦',        // penanda identitas
    bullet: '⬡',      // item menu
    arrow: '❯',       // petunjuk terminal
    line: '─',
    corner: '╰'
}

let cache = null

export function brand() {
    if (!cache) {
        let config = {}
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        } catch {
            // biarkan memakai nilai default di bawah
        }
        cache = {
            name: config.botName || 'Christy MD',
            owner: config.ownerName || 'Riki Aksa',
            version: config.botVersion || '1.0.0',
            tagline: config.tagline || 'Modern • Clean • Futuristic',
            pairingCode: config.pairingCode || 'CHRISTYY',
            prefix: config.prefix || ['.']
        }
    }
    return cache
}

export function reloadBrand() {
    cache = null
}

// ---------------------------------------------------------------- terminal

const hexToRgb = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))

export function gradient(text, from = THEME.from, to = THEME.to) {
    const [r1, g1, b1] = hexToRgb(from)
    const [r2, g2, b2] = hexToRgb(to)
    const chars = [...text]
    return chars
        .map((ch, i) => {
            const t = chars.length > 1 ? i / (chars.length - 1) : 0
            const r = Math.round(r1 + (r2 - r1) * t)
            const g = Math.round(g1 + (g2 - g1) * t)
            const b = Math.round(b1 + (b2 - b1) * t)
            const hex = `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
            return chalk.hex(hex)(ch)
        })
        .join('')
}

// Lebar tampilan di terminal.
// Catatan: simbol seperti ✦ ⬡ ❯ (dingbats/geometric shapes) lebarnya "ambiguous" —
// hampir semua terminal menggambarnya 1 kolom, jadi JANGAN dihitung 2.
// Yang benar-benar 2 kolom: karakter CJK/Hangul/fullwidth dan emoji.
const WIDE = /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]|[\u{1F300}-\u{1FAFF}]|[\u{1F000}-\u{1F2FF}]/u

export const textWidth = (text) =>
    [...String(text)].reduce((sum, ch) => sum + (WIDE.test(ch) ? 2 : 1), 0)

const width = (text) => textWidth(text)

export function banner() {
    const b = brand()
    const rows = [
        [`✦ ${b.name.toUpperCase()} ✦`, chalk.bold.white(`✦ ${b.name.toUpperCase()} ✦`)],
        [b.tagline, chalk.hex(THEME.from)(b.tagline)],
        ['WhatsApp Bot · Node.js ESM', chalk.gray('WhatsApp Bot · Node.js ESM')],
        [`v${b.version} · Created by ${b.owner}`, chalk.gray(`v${b.version} · Created by ${b.owner}`)]
    ]

    const w = Math.max(...rows.map(([raw]) => width(raw))) + 4
    const edge = chalk.hex(THEME.edge)('│')
    const row = ([raw, colored]) => {
        const gap = Math.max(0, w - width(raw))
        const left = Math.floor(gap / 2)
        return edge + ' '.repeat(left) + colored + ' '.repeat(gap - left) + edge
    }

    return [
        gradient(`╭${'─'.repeat(w)}╮`),
        ...rows.map(row),
        gradient(`╰${'─'.repeat(w)}╯`)
    ].join('\n')
}

// ------------------------------------------------------------ pesan WhatsApp

export function header() {
    const b = brand()
    return [
        `╭─❖ ${b.name.toUpperCase()} ❖`,
        `│  ${b.tagline}`,
        '│  WhatsApp Bot · Node.js ESM',
        `╰── ${SYMBOL.mark} v${b.version}`
    ].join('\n')
}

export function section(title, lines = []) {
    const head = `╭─「 ${String(title).toUpperCase()} 」`
    const body = lines
        .filter(l => l !== undefined && l !== null && String(l).length)
        .map(l => `│  ${l}`)
    // garis penutup disamakan lebarnya dengan header supaya bingkai terlihat rapi
    const foot = `╰${'─'.repeat(Math.max(4, width(head) - 1))}`
    return [head, ...body, foot].join('\n')
}

export function card(title, body = '', footer) {
    const lines = String(body).split('\n')
    const content = lines.map(l => (l.trim() ? `│  ${l}` : '│'))
    const tail = footer === undefined ? credit() : footer
    return [
        `╭─「 ${String(title).toUpperCase()} 」`,
        '│',
        ...content,
        '│',
        tail ? `╰─ ${SYMBOL.mark} ${tail}` : '╰────────────'
    ].join('\n')
}

export function credit() {
    const b = brand()
    return `${b.name} · Created by ${b.owner}`
}

export function line(title) {
    return `──「 ${title} 」`
}

export function list(items, size = 30) {
    const out = []
    let current = ''
    for (const item of items) {
        const text = String(item)
        if (current && width(current) + width(text) + 2 > size) {
            out.push(current)
            current = ''
        }
        current = current ? `${current}  ${text}` : text
    }
    if (current) out.push(current)
    return out
}

// Garis pemisah. Dipakai untuk memisahkan blok pesan tanpa bingkai penuh —
// jauh lebih rapi di WhatsApp daripada kotak ASCII bertumpuk.
export function divider(size = 18, char = '━') {
    return char.repeat(size)
}

// Susun daftar item menjadi beberapa baris dengan pemisah (mis. " · "),
// dibungkus pada lebar tertentu. Dipakai untuk daftar command agar tidak melebar.
export function wrapList(items, { sep = ' · ', size = 32 } = {}) {
    const out = []
    let current = ''
    for (const item of items) {
        const text = String(item)
        if (current && width(current) + width(sep) + width(text) > size) {
            out.push(current)
            current = ''
        }
        current = current ? `${current}${sep}${text}` : text
    }
    if (current) out.push(current)
    return out
}

// Baris label : nilai yang sejajar (label dipadkan ke kanan).
export function fields(pairs, pad = 0) {
    const labels = pairs.map(([label]) => String(label))
    const width_ = Math.max(pad, ...labels.map(l => width(l)))
    return pairs.map(([label, value], i) => {
        const gap = ' '.repeat(Math.max(1, width_ - width(labels[i])))
        return `${label}${gap} : ${value}`
    })
}

// ---------------------------------------------------------------------------
// Gaya NEON GLASS
//
// Rangkaian helper untuk tampilan menu bergaya "neon glass": garis kotak
// elektrik + judul small caps + ikon per kategori. Dipakai plugin menu, dan
// bisa dipakai plugin lain kalau ingin tampilan yang sama.
// ---------------------------------------------------------------------------

export const GLASS = {
    tl: '╭', tr: '╮', bl: '╰', br: '╯',
    v: '│', h: '━', h2: '─',
    pip: '✦', bullet: '▸', arrow: '➤', mark: '◈', spark: '⌁', bar: '▰'
}

// Huruf small caps (untuk label/judul, BUKAN untuk command — command tetap
// ditulis normal supaya mudah disalin pengguna)
const SMALL = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
    k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ',
    u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
}

export const toSmall = (text = '') =>
    String(text).toLowerCase().split('').map(ch => SMALL[ch] || ch).join('')

// Huruf bold matematis (𝗮-𝘇, 𝟬-𝟵) — dipakai untuk judul kotak
const BOLD = {
    a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴', h: '𝗵', i: '𝗶',
    j: '𝗷', k: '𝗸', l: '𝗹', m: '𝗺', n: '𝗻', o: '𝗼', p: '𝗽', q: '𝗾', r: '𝗿',
    s: '𝘀', t: '𝘁', u: '𝘂', v: '𝘃', w: '𝘄', x: '𝘅', y: '𝘆', z: '𝘇',
    0: '𝟬', 1: '𝟭', 2: '𝟮', 3: '𝟯', 4: '𝟰', 5: '𝟱', 6: '𝟲', 7: '𝟳', 8: '𝟴', 9: '𝟵'
}

export const toBold = (text = '') =>
    String(text).toLowerCase().split('').map(ch => BOLD[ch] || ch).join('')

// Salam sesuai jam (jam dikirim dalam zona waktu config.timezone)
export function greeting(hour) {
    const spark = GLASS.spark
    if (hour < 4) return `dini hari — matikan layar, istirahat dulu ${spark}`
    if (hour < 11) return `selamat pagi — gaskeun, hari masih panjang ${spark}`
    if (hour < 15) return `selamat siang — jaga ritme, jangan kehabisan baterai ${spark}`
    if (hour < 19) return `selamat sore — rapikan sisa kerja hari ini ${spark}`
    return `selamat malam — waktunya recharge ${spark}`
}

// Kotak judul utama
export function glassHeader(title, subtitle, size = 23) {
    const line = GLASS.h.repeat(size)
    return [
        `${GLASS.tl}${line}${GLASS.tr}`,
        `   ${GLASS.spark} ${toBold(title)} ${GLASS.spark}`,
        `   ${GLASS.mark} ${subtitle}`,
        `${GLASS.bl}${line}${GLASS.br}`
    ].join('\n')
}

// Blok berjudul (dipakai untuk identitas / sistem). Garis bawah disesuaikan
// otomatis dengan baris terpanjang supaya kotaknya rapi.
export function glassBlock(label, rows = []) {
    const head = `${GLASS.tl}${GLASS.h2} ${label}`
    const body = rows.map(r => `${GLASS.v} ${r}`)
    const widest = Math.max(textWidth(head), ...body.map(r => textWidth(r)))
    return [head, ...body, `${GLASS.bl}${GLASS.h.repeat(Math.max(10, widest - 1))}`].join('\n')
}

export function glassRow(key, value, pad = 8) {
    return `${GLASS.bullet} ${String(key).padEnd(pad)} ${GLASS.pip} ${value}`
}

// Kotak kategori: kepala + kaki, isinya dirakit pemanggil.
// `info` contoh: "150 command" → "╭── 🧰 ᴛᴏᴏʟꜱ ── 150 command"
export function glassTag(icon, label, info) {
    const suffix = info ? ` ${GLASS.h2}${GLASS.h2} ${info}` : ''
    const head = `${GLASS.tl}${GLASS.h2}${GLASS.h2} ${icon} ${toSmall(label)}${suffix}`
    return {
        head,
        foot: `${GLASS.bl}${GLASS.h2.repeat(Math.max(12, textWidth(head) - 1))}`
    }
}

// Label zona waktu gaya Indonesia (WIB/WITA/WIT), fallback ke nama zona
export function timezoneLabel(timeZone = '') {
    const zone = String(timeZone)
    if (zone === 'Asia/Jakarta') return 'WIB'
    if (zone === 'Asia/Makassar') return 'WITA'
    if (zone === 'Asia/Jayapura') return 'WIT'
    const tail = zone.split('/').pop() || zone
    return tail.replace(/_/g, ' ')
}
