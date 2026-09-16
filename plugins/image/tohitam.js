// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/image/tohitam.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tobotak, .tochibi, .tofunk, .tofigura, .tofigurav2, .tofigurav3

/**
 * to hitam dan lain lain
 * -----------------------------
 * Type : Plugins ESM
 * creator : Riki
 * Channel : https://
 Api : https://api-faa.my.id
 */
import axios from "axios"
import FormData from "form-data"
import fetch from "node-fetch"

async function uguu(buffer) {
 try {
 const form = new FormData()
 form.append("files[]", buffer, "image.jpg")

 const { data } = await axios.post(
 "https://uguu.se/upload",
 form,
 { headers: form.getHeaders() }
 )

 return data?.files?.[0]?.url || null
 } catch {
 return null
 }
}

let handler = async (m, { conn, command }) => {
 try {
 await m.react("✨")

 let q = m.quoted ? m.quoted : m
 let mime = q.mimetype || q.msg?.mimetype || ""

 if (!mime.startsWith("image/")) {
 let list = handler.help.map(v => `.${v}`).join("\n")
 return m.reply(
`✨ *AI IMAGE CONVERTER*

Reply gambar dengan caption salah satu command berikut:

${list}`
 )
 }

 let buffer = await q.download()
 if (!buffer) return m.reply("❌ Gagal mengambil gambar")

 let imageUrl = await uguu(buffer)
 if (!imageUrl) return m.reply("❌ Upload gambar gagal")

 let apiUrl = `https://api-faa.my.id/faa/${command}?url=${encodeURIComponent(imageUrl)}`
 let res = await fetch(apiUrl)

 if (!res.ok) return m.reply("❌ API error")

 let result = Buffer.from(await res.arrayBuffer())
 await conn.sendFile(m.chat, result, `${command}.jpg`, "", m)

 } catch {
 m.reply("❌ Terjadi kesalahan!")
 }
}

handler.command = ['tobotak', 'tochibi', 'tofunk', 'tofigura', 'tofigurav2', 'tofigurav3']

handler.category = 'Media'
handler.description = 'Tohitam'

export default handler