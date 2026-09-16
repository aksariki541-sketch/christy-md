// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/text2img.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .text2img

/*
✨ YuriPuki
💫 Nama Fitur: TextToImage
🤖 Type : Plugin Esm
🔗 Sumber : https://
*/

import axios from "axios"

const getImageUrl = (prompt) => {
 const seed = Date.now().toString() + Math.floor(Math.random() * 1e6).toString()
 return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&enhance=true&nologo=true&model=flux`
}

let handler = async (m, { text, conn }) => {
 if (!text) throw 'Masukkan prompt, contoh: .text2img Polisi tilang warga sambil minta duit'

 const urlImage = getImageUrl(text)
 await conn.sendMessage(m.chat, {
 image: { url: urlImage },
 caption: `🖼️ Prompt: ${text}`
 }, { quoted: m })
}

handler.command = ['text2img']

handler.category = 'Tools'
handler.description = 'Text2img'

export default handler