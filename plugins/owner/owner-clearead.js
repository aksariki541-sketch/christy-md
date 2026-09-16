// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/owner-clearead.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .clearead

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')


let handler = async (m, { conn }) => {
 let total = 0

 for (let file of fs.readdirSync(ROOT + '/plugins')) {
 if (!file.endsWith('.js')) continue

 let filePath = path.join('./plugins', file)
 let text = fs.readFileSync(filePath, 'utf8')

 if (text.includes('externalAdReplyOffOffOffOff')) {
 text = text.replaceAll(
 'externalAdReplyOffOffOffOff',
 'externalAdReplyOffOffOffOffOff'
 )

 fs.writeFileSync(filePath, text)
 total++
 }
 }

 conn.reply(m.chat, `✅ ${total} file berhasil di nonaktifkan`, m)
}

handler.command = ['clearead']
handler.rowner = true

handler.category = 'Owner'
handler.description = 'Clearead'

export default handler