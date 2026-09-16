// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/setthumb.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setthumb

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')


let handler = async (m, { conn }) => {
 let q = m.quoted ? m.quoted : m
 let mime = (q.msg || q).mimetype || ''

 if (!mime.startsWith('image/'))
 return m.reply('Reply / kirim gambar untuk dijadikan thumbnail bot')

 let img = await q.download()

 fs.writeFileSync(ROOT + '/media/thumb.jpg', img)

 m.reply('✅ Done wok')
}

handler.command = ['setthumb']
handler.owner = true
handler.category = 'Owner'
handler.description = 'Setthumb'

export default handler