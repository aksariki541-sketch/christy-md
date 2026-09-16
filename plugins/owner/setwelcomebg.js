// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/setwelcomebg.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setwelcomebg, .setbgwelcome

import fs from 'fs'
import path from 'path'

const handler = async (m, { usedPrefix, command }) => {
 const q = m.quoted ? m.quoted : m
 const mime = (q.msg || q).mimetype || ''

 if (!mime.startsWith('image/')) {
 return m.reply(`Reply/kirim gambar dengan caption:\n${usedPrefix + command}`)
 }

 const dir = '/home/container/src/Aesthetic'
 const file = path.join(dir, 'welcome-bg.jpg')

 if (!fs.existsSync(dir)) {
 fs.mkdirSync(dir, { recursive: true })
 }

 const buffer = await q.download()

 fs.writeFileSync(file, buffer)

 m.reply(`✅ Background welcome berhasil disimpan!\n\n📁 ${file}`)
}

handler.command = ['setwelcomebg', 'setbgwelcome']
handler.owner = true

handler.category = 'Owner'
handler.description = 'Setwelcomebg'

export default handler