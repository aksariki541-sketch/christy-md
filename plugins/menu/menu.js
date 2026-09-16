import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { runtime } from '../../lib/myfunc.js'
import {
    brand, textWidth,
    GLASS, toBold, toSmall, timezoneLabel, glassHeader, glassBlock, glassRow
} from '../../lib/ui.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(__dirname, '../../config.json')
const thumbPath = path.join(__dirname, '../../media/thumb.jpg')

// Ikon & judul per kategori. Urutan di object = urutan tampil di menu.
const CATEGORY = {
    Main: { icon: '🧿', title: 'Main' },
    System: { icon: '📡', title: 'System' },
    Media: { icon: '🛰️', title: 'Media & Gambar' },
    Tools: { icon: '🔩', title: 'Tools' },
    Group: { icon: '🛡️', title: 'Group' },
    Fun: { icon: '🕹️', title: 'Fun' },
    Owner: { icon: '♛', title: 'Owner' },
    Other: { icon: '🧩', title: 'Lainnya' }
}
const ORDER = Object.keys(CATEGORY)

const ALIAS_SHOWN = 8   // alias yang ditulis satu per satu sebelum diringkas
const NAME_WIDTH = 17   // lebar kolom nama kategori di menu utama
const MAX_ROWS = 9      // baris kategori di tombol single-select
const DEFAULT_TZ = 'Asia/Makassar'

const row = (key, val, pad = 8) => `${GLASS.bullet} ${String(key).padEnd(pad)} ${GLASS.pip} ${val}`

// satu item = satu baris (lurus ke bawah, tidak dipadatkan menyamping)
const line = (indent, marker, text) => `${GLASS.v}${' '.repeat(indent)}${marker} ${text}`

// padding yang sadar lebar karakter (emoji/CJK dihitung 2 kolom)
const padName = (text, size = NAME_WIDTH) =>
    text + ' '.repeat(Math.max(1, size - textWidth(text)))

// --------------------------------------------------------------------------
// Waktu mengikuti config.timezone (default Asia/Makassar)
// --------------------------------------------------------------------------
function clock(timeZone) {
    const now = new Date()
    const fmt = (opts) => new Intl.DateTimeFormat('id-ID', { timeZone, ...opts })

    let hour = now.getHours()
    try {
        const part = fmt({ hour: '2-digit', hour12: false }).formatToParts(now).find(p => p.type === 'hour')
        if (part) hour = Number(part.value)
    } catch {
        // fallback ke jam server
    }

    const jam = fmt({ hour: '2-digit', minute: '2-digit', hour12: false }).format(now).replace('.', ':')
    const tanggal = fmt({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
        .format(now)
        .replace(/\./g, '')

    return { hour, jam, tanggal }
}

// --------------------------------------------------------------------------
// Baca registry plugin → kategori → grup fitur → daftar command
// --------------------------------------------------------------------------
function collect(plugins = new Map(), prefix = '.') {
    // kumpulkan dulu per FILE plugin: satu plugin = satu blok, tidak digabung dengan plugin lain
    const files = new Map()
    for (const handler of new Set(plugins.values())) {
        if (!handler || handler.hidden) continue

        const file = handler.__file || handler.description || 'unknown'
        if (!files.has(file)) {
            files.set(file, {
                file,
                raw: CATEGORY[handler.category] ? handler.category : 'Other',
                description: handler.description || 'Tanpa keterangan',
                commands: [],
                aliases: [],
                labels: [],
                restricted: false
            })
        }

        const entry = files.get(file)

        if (handler.command) {
            const commands = Array.isArray(handler.command) ? handler.command : [handler.command]
            entry.commands.push(String(commands[0]))
            entry.aliases.push(...commands.slice(1).map(String))
        }
        // label dipakai untuk pemicu yang sudah punya sintaks sendiri (mis. "=> eval", "$ shell")
        if (handler.label) entry.labels.push(handler.label)

        if (handler.owner || handler.creator || handler.premium) entry.restricted = true
    }

    // judul blok: deskripsi plugin sendiri; kalau ada plugin lain dengan deskripsi sama, pakai nama file
    const titleCount = new Map()
    for (const entry of files.values()) {
        titleCount.set(entry.description, (titleCount.get(entry.description) || 0) + 1)
    }

    const categories = new Map()
    for (const entry of files.values()) {
        const groups = categories.get(entry.raw) || new Map()
        const title = titleCount.get(entry.description) > 1
            ? `${entry.description} · ${path.basename(entry.file, '.js')}`
            : entry.description
        groups.set(entry.file, { ...entry, description: title })
        categories.set(entry.raw, groups)
    }

    return ORDER.filter(raw => categories.has(raw)).map(raw => {
        const groups = [...categories.get(raw).entries()]
            .map(([key, entry]) => {
                const description = entry.description || key
                const commands = [...new Set(entry.commands)]
                const aliases = [...new Set(entry.aliases)]
                const labels = [...new Set(entry.labels)]
                // token yang benar-benar bisa diketik: command + alias (label ditampilkan apa adanya)
                const tokens = [...commands.map(c => `${prefix}${c}`), ...aliases.map(a => `${prefix}${a}`), ...labels]
                return { description, restricted: entry.restricted, commands, aliases, labels, tokens }
            })
            .sort((a, b) => (a.commands[0] || a.labels[0] || '').localeCompare(b.commands[0] || b.labels[0] || ''))

        const tokens = groups.flatMap(g => g.tokens)

        return {
            raw,
            tag: raw.toLowerCase(),
            icon: CATEGORY[raw].icon,
            title: CATEGORY[raw].title,
            groups,
            tokens,
            count: tokens.length,
            features: groups.length,
            restrictedOnly: groups.length > 0 && groups.every(g => g.restricted)
        }
    })
}

// --------------------------------------------------------------------------
// Rakitan teks
// --------------------------------------------------------------------------

// Kotak kategori: kepala + isi + kaki (gaya kotak referensi)
function categoryBox(category, { rows }) {
    const head = `${GLASS.tl}${GLASS.h2}${GLASS.h2} ${category.icon} ${toSmall(category.title)} ${GLASS.h2}${GLASS.h2} ${category.count} perintah${category.restrictedOnly ? ' 🔒' : ''}`
    return [head, ...rows, `${GLASS.bl}${GLASS.h2.repeat(20)}`].join('\n')
}

function renderHome({ categories, identity, config, pushname, m, total, prefix }) {
    const tz = config.timezone || DEFAULT_TZ
    const { hour, jam, tanggal } = clock(tz)
    const zone = timezoneLabel(tz)

    const status = m.isCreator ? 'Owner ♛' : m.isPremium ? 'Premium 💜' : 'Gratis ⚡'
    const mode = config.botMode === 'public' ? '🌐 Public' : '🔒 Self'

    const blocks = [
        glassHeader(identity.name, ` ${toSmall(identity.tagline)}`),
        '',
        `${GLASS.arrow} hai, ${pushname} ${GLASS.pip}`,
        `   selamat ${hour < 4 ? 'dini hari' : hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 19 ? 'sore' : 'malam'} — ${
            hour < 4 ? 'matikan layar, istirahat dulu'
                : hour < 11 ? 'gaskeun, hari masih panjang'
                    : hour < 15 ? 'jaga ritme, jangan kehabisan baterai'
                        : hour < 19 ? 'rapikan sisa kerja hari ini'
                            : 'waktunya recharge'} ${GLASS.spark}`,
        '',
        glassBlock(`${GLASS.mark} ${toSmall('identitas')}`, [
            row('Status', status),
            row('Mode', mode),
            row('Prefix', (config.prefix || ['.']).join('  ')),
            row('Uptime', runtime(process.uptime()).replace(/\*/g, ''))
        ]),
        '',
        glassBlock(`${GLASS.mark} ${toSmall('sistem')}`, [
            row('Jam', `${jam} ${zone}`),
            row('Tanggal', tanggal),
            row('Kategori', `${categories.length}`),
            row('Perintah', `${total}`)
        ]),
        '',
        `${GLASS.spark} ${toSmall('kategori tersedia')}`,
        ...categories.map(category =>
            `   ${GLASS.bullet} ${category.icon} ${padName(toSmall(category.title))} ${GLASS.pip} ${category.count} perintah${category.restrictedOnly ? ' 🔒' : ''}`
        ),
        '',
        `${GLASS.bar} ketik *${prefix}menu all* atau pakai tombol di bawah ${GLASS.pip} v${identity.version}`
    ]

    return blocks.join('\n')
}

function groupRows(group, prefix) {
    const rows = [`${GLASS.v} ${GLASS.mark} ${group.description}${group.restricted ? ' 🔒' : ''}`]

    // command utama: satu per baris, lurus ke bawah
    for (const command of group.commands) rows.push(line(3, GLASS.pip, `${prefix}${command}`))
    for (const label of group.labels) rows.push(line(3, GLASS.pip, `「${label}」`))

    // alias: satu per baris juga, pakai penanda bullet
    const shown = group.aliases.slice(0, ALIAS_SHOWN)
    const rest = group.aliases.length - shown.length
    for (const alias of shown) rows.push(line(3, GLASS.bullet, `${prefix}${alias}`))
    if (rest > 0) rows.push(`${GLASS.v}   … +${rest} alias lain`)

    return rows
}

function buildCategoryRows(category, prefix) {
    const rows = []

    // satu plugin = satu blok; command-nya selalu ditulis di bawah judul plugin itu sendiri
    for (const group of category.groups) {
        rows.push(...groupRows(group, prefix), `${GLASS.v}`)
    }

    if (rows[rows.length - 1] === `${GLASS.v}`) rows.pop()
    return rows
}

function renderCategory({ category, identity, prefix }) {
    return [
        glassHeader('direktori', ` ${toSmall(category.title)} ${GLASS.pip} ${category.count} perintah`, 21),
        '',
        categoryBox(category, { rows: buildCategoryRows(category, prefix) }),
        '',
        `${GLASS.bar} prefix *${prefix}* ${GLASS.pip} diracik oleh ${identity.owner}`
    ].join('\n')
}

function renderAll({ categories, identity, prefix }) {
    const blocks = [
        glassHeader('direktori', ` ${categories.length} kategori ${GLASS.pip} ${categories.reduce((s, c) => s + c.count, 0)} perintah`, 21),
        ''
    ]

    for (const category of categories) {
        blocks.push(categoryBox(category, { rows: buildCategoryRows(category, prefix) }))
        blocks.push('')
    }

    blocks.push(`${GLASS.bar} prefix *${prefix}* ${GLASS.pip} diracik oleh ${identity.owner}`)

    return blocks.join('\n')
}

function renderNotFound({ categories, identity, focus, prefix }) {
    const blocks = [
        glassHeader(identity.name, ` ${toSmall('kategori tidak ditemukan')}`),
        '',
        glassBlock(`${GLASS.mark} ${toSmall('pencarian')}`, [
            row('Dicari', `"${focus}"`),
            row('Hasil', 'belum terdaftar')
        ]),
        '',
        `${GLASS.spark} ${toSmall('kategori yang tersedia')}`,
        ...categories.map(c => `   ${GLASS.bullet} ${c.icon} *${c.tag}* ${GLASS.pip} ${c.count} perintah`),
        '',
        `${GLASS.arrow} contoh: *${prefix}menu ${categories[0] ? categories[0].tag : 'tools'}*`
    ]

    return blocks.join('\n')
}

// --------------------------------------------------------------------------
// Tombol
// --------------------------------------------------------------------------
function categoryRows(categories, prefix, command) {
    return categories.slice(0, MAX_ROWS).map(category => ({
        header: category.icon,
        title: category.title,
        description: `${GLASS.bar} ${category.count} perintah${category.restrictedOnly ? ` ${GLASS.pip} khusus owner` : ''}`,
        id: `${prefix}${command} ${category.tag}`
    }))
}

function quickActions(prefix, command) {
    return [
        { header: '📡', title: 'Ping', description: `${GLASS.bar} monitor server realtime`, id: `${prefix}ping` },
        { header: '📊', title: 'Statistik', description: `${GLASS.bar} ringkasan plugin & command`, id: `${prefix}stats` },
        { header: '🆔', title: 'Identitas', description: `${GLASS.bar} info akun & chat ini`, id: `${prefix}id` },
        { header: '📜', title: 'Script', description: `${GLASS.bar} aturan & kredit script`, id: `${prefix}sc` }
    ]
}

function buttonsFor(categories, prefix, command, mode = 'main') {
    const sections = [
        {
            title: `${GLASS.pip} ${categories.length} kategori ${GLASS.pip}`,
            highlight_label: '',
            rows: categoryRows(categories, prefix, command)
        },
        {
            title: `${GLASS.spark} ${toSmall('aksi cepat')} ${GLASS.spark}`,
            highlight_label: '',
            rows: quickActions(prefix, command)
        }
    ]

    const primary = {
        buttonId: `${prefix}${command}`,
        buttonText: { displayText: mode === 'detail' ? `${GLASS.mark} Beranda` : `${GLASS.mark} Lihat Kategori` },
        nativeFlowInfo: {
            name: 'single_select',
            paramsJson: JSON.stringify({
                title: `${GLASS.spark} ${brand().name} ${GLASS.pip} ${toSmall('navigasi menu')}`,
                sections
            })
        },
        type: 1
    }

    if (mode === 'detail') {
        return [
            primary,
            { buttonId: `${prefix}${command} all`, buttonText: { displayText: `${GLASS.bar} Semua Perintah` }, type: 1 },
            { buttonId: `${prefix}stats`, buttonText: { displayText: '📊 Statistik' }, type: 1 }
        ]
    }

    return [
        primary,
        { buttonId: `${prefix}${command} all`, buttonText: { displayText: `${GLASS.bar} Semua Perintah` }, type: 1 },
        { buttonId: `${prefix}ping`, buttonText: { displayText: '📡 Ping' }, type: 1 }
    ]
}

// --------------------------------------------------------------------------
let handler = async (m, { conn, prefix, plugins, args, command }) => {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    const identity = brand()
    const pushname = m.pushName || 'Kak'

    // menu bisa dibuka lewat tombol; saat itu handler dipanggil dengan prefix ''
    const activePrefix = prefix || (config.prefix || ['.'])[0]
    const usedCommand = command || 'menu'

    const focus = (args?.[0] || '').trim().toLowerCase()
    const categories = collect(plugins, activePrefix)
    // total dihitung dari kategori yang tampil supaya angka di menu selalu konsisten
    const total = categories.reduce((sum, c) => sum + c.count, 0)

    const matched = focus
        ? categories.find(c => c.tag === focus || c.title.toLowerCase() === focus)
        : null

    let text
    let mode = 'main'

    if (focus === 'all') {
        text = renderAll({ categories, identity, prefix: activePrefix })
        mode = 'detail'
    } else if (matched) {
        text = renderCategory({ category: matched, identity, prefix: activePrefix })
        mode = 'detail'
    } else if (focus) {
        text = renderNotFound({ categories, identity, focus, prefix: activePrefix })
    } else {
        text = renderHome({ categories, identity, config, pushname, m, total, prefix: activePrefix })
    }

    const thumb = await sharp(thumbPath)
        .resize(300, 300)
        .jpeg({ quality: 80 })
        .toBuffer()

    const tz = config.timezone || DEFAULT_TZ
    const { jam, tanggal } = clock(tz)

    await conn.sendMessage(m.chat, {
        buttonsMessage: {
            locationMessage: {
                degreesLatitude: 0,
                degreesLongitude: 0,
                name: `${identity.name} · v${identity.version}`,
                address: `${GLASS.pip} ${jam} ${timezoneLabel(tz)} · ${tanggal}`,
                jpegThumbnail: thumb
            },
            contentText: text,
            footerText: `${GLASS.pip} ${identity.name} · Created by ${identity.owner}`,
            buttons: buttonsFor(categories, activePrefix, usedCommand, mode),
            headerType: 6
        }
    }, { quoted: m })
}

handler.command = ['menu', 'help']
handler.category = 'Main'
handler.description = 'Menu utama bot (bisa .menu <kategori>)'
handler.usage = '[kategori|all]'

export default handler
