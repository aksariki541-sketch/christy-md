// Command : .getplugin, .gp
// Fungsi  : owner mengirim isi source sebuah plugin, lengkap dengan tombol
//           "Copy Source" (nativeFlow cta_copy) supaya tidak perlu scroll manual.
//
// Catatan penyesuaian dari kode asli (base lain):
//   - import diambil dari lib/baileys.js milik project ini, bukan dari 'baileys'
//   - handler.command berupa array (loader project ini tidak mendukung RegExp)
//   - handler.rowner -> handler.owner, isROwner -> isOwner (nama yang dipakai handler.js)
//   - file dibaca lewat fs, bukan `exec('cat ...')` (tanpa shell, tanpa child_process)
//   - daftar plugin diambil dari registry (handler.__file), karena key registry
//     project ini adalah nama command, bukan nama file plugin

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateWAMessageFromContent, proto } from '../../lib/baileys.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PLUGIN_DIR = path.resolve(__dirname, '..')
const MAX_COPY = 60000 // batas aman ukuran teks yang dikirim ke tombol copy

// Kumpulkan file plugin unik dari registry.
// Nama yang bisa dipakai: "owner/getplugin" (relatif) atau "getplugin" (nama file).
function kumpulkanPlugin(registry) {
    const map = new Map()
    const namaPendek = new Map()

    for (const handler of new Set(registry.values())) {
        const file = handler?.__file
        if (!file || !file.startsWith(PLUGIN_DIR)) continue

        const rel = path.relative(PLUGIN_DIR, file).split(path.sep).join('/')
        const panjang = rel.replace(/\.js$/, '')
        if (!map.has(panjang)) map.set(panjang, file)

        const pendek = path.basename(rel, '.js')
        const isi = namaPendek.get(pendek) || []
        isi.push(panjang)
        namaPendek.set(pendek, isi)
    }

    // nama pendek hanya dipakai kalau tidak ambigu
    for (const [pendek, daftar] of namaPendek) {
        if (daftar.length === 1) map.set(pendek, map.get(daftar[0]))
    }

    return map
}

const handler = async (m, { conn, plugins, isOwner, usedPrefix, command, text }) => {
    if (!isOwner) throw 'Fitur ini khusus Owner.'

    const daftar = kumpulkanPlugin(plugins || new Map())

    if (!text) {
        const semua = [...daftar.keys()].filter(n => n.includes('/')).sort()
        return m.reply(
            `*Pengambilan source plugin*\n\n` +
            `Contoh:\n${usedPrefix + command} menu\n${usedPrefix + command} owner/broadcast\n` +
            `${usedPrefix + command} list\n\n` +
            `Jumlah plugin terdaftar: ${semua.length}`
        )
    }

    const kunci = String(text).trim().replace(/^plugins\//, '').replace(/\.js$/, '')

    // mode daftar: tampilkan semua plugin (potong supaya pesan tidak kepanjangan)
    if (['list', 'all', 'daftar'].includes(kunci.toLowerCase())) {
        const semua = [...daftar.keys()].filter(n => n.includes('/')).sort()
        const perBagian = 45
        const bagian = Math.ceil(semua.length / perBagian)
        const hasil = []
        for (let i = 0; i < bagian; i++) {
            const potong = semua.slice(i * perBagian, (i + 1) * perBagian)
            hasil.push(`*Daftar plugin (${i + 1}/${bagian})*\n\n${potong.map(n => `• ${n}`).join('\n')}`)
        }
        for (const pesan of hasil) await m.reply(pesan)
        return
    }

    const file = daftar.get(kunci) || daftar.get(kunci.toLowerCase())
    if (!file) {
        const mirip = [...daftar.keys()].filter(n => n.toLowerCase().includes(kunci.toLowerCase())).slice(0, 12)
        throw `❌ Plugin *${kunci}* tidak ditemukan.\n\n` +
            (mirip.length ? `Yang mirip:\n${mirip.map(n => `• ${n}`).join('\n')}\n\n` : '') +
            `Ketik *${usedPrefix + command} list* untuk daftar lengkap.`
    }

    await m.react('🕒')

    try {
        const code = fs.readFileSync(file, 'utf8').trim()
        const nama = path.relative(PLUGIN_DIR, file).split(path.sep).join('/')
        const potong = code.length > MAX_COPY

        const pesan = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `📄 *Plugin:* ${nama}\n` +
                                `${potong ? `\n⚠️ Source terlalu panjang (${code.length} karakter), tombol copy dimatikan.\n` : ''}\n` +
                                `Tekan tombol di bawah untuk menyalin source code.`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: 'ᴄʜʀɪsᴛʏ - ᴍᴅ'
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: potong ? [] : [{
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: ' Copy Source',
                                    copy_code: code
                                })
                            }]
                        })
                    })
                }
            }
        }, {})

        await conn.relayMessage(m.chat, pesan.message, { messageId: pesan.key.id })

        if (potong) {
            await m.reply(`⚠️ *${nama}* berukuran ${code.length} karakter (batas ${MAX_COPY}) sehingga tidak dikirim ke tombol copy. Buka langsung dari file di server.`)
        }

        await m.react('✅')
    } catch (e) {
        console.error(e)
        await m.react('❌')
        // fallback: kirim sebagai teks biasa kalau tombol gagal
        try {
            const code = fs.readFileSync(file, 'utf8').trim()
            await m.reply(`Gagal mengirim tombol copy (${e.message || e}). Isi plugin:\n\n${code}`)
        } catch {
            throw e.message || String(e)
        }
    }
}

handler.help = ['getplugin', 'gp']
handler.tags = ['owner']
handler.command = ['getplugin', 'gp']
handler.description = 'Ambil source plugin + tombol salin (owner)'
handler.category = 'Owner'
handler.owner = true

export default handler
