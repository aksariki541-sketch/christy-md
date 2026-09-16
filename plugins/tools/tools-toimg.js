// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/tools-toimg.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .sticker2img, .stikertoimg

import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp' // untuk konversi WebP → PNG/JPG

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let handler = async (m, { conn, usedPrefix, command }) => {
 try {
 // pastikan ada sticker
 let q = m.quoted ? m.quoted : m
 let mime = (q.msg || q).mimetype || ''

 if (!/webp/.test(mime)) {
 return m.reply(
`✨ *TOIMAGE ENGINE*
Reply sticker untuk dikonversi menjadi gambar

Contoh:
${usedPrefix + command}`
 )
 }

 // pastikan folder tmp ada
 const tmpDir = join(__dirname, '../tmp')
 if (!existsSync(tmpDir)) mkdirSync(tmpDir)

 const inputPath = join(tmpDir, `${Date.now()}_sticker.webp`)
 const outputPath = join(tmpDir, `${Date.now()}_toimg.png`)

 const buffer = await q.download()
 writeFileSync(inputPath, buffer)

 // konversi WebP → PNG
 await sharp(inputPath)
 .png()
 .toFile(outputPath)

 const imgBuffer = Buffer.from(await sharp(outputPath).toBuffer())

 await conn.sendMessage(m.chat, {
 image: imgBuffer,
 caption: '✨ Sticker berhasil dikonversi menjadi gambar'
 }, { quoted: m })

 unlinkSync(inputPath)
 unlinkSync(outputPath)

 } catch (err) {
 console.error(err)
 return m.reply('❌ Gagal mengubah sticker menjadi gambar.')
 }
}

handler.command = ['sticker2img', 'stikertoimg']
handler.category = 'Tools'
handler.description = 'Toimg'

export default handler