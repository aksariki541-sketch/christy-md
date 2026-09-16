// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/setaudio.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setaudio

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command }) => {
 try {
 const quoted = m.quoted || m
 const mime = quoted?.mimetype || ''

 if (!mime.startsWith('audio/')) return m.reply(`Kirim/reply audio dulu!\nContoh: reply audio lalu ketik *${usedPrefix}${command}*`)

 const filePath = './media/tes.mp3'
 const buffer = await quoted.download()

 fs.writeFileSync(filePath, buffer)
 m.reply('✅ Audio menu berhasil diupdate!')

 } catch (e) {
 console.error(e)
 m.reply('Error: ' + e.message)
 }
}

handler.command = ['setaudio']
handler.owner = true

handler.category = 'Owner'
handler.description = 'Setaudio'

export default handler