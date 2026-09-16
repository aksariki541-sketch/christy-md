// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/videy.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .videy

/*
* Nama Fitur : Pinterest Downloader
* Type : Plugin Esm
* Sumber : https://
* Author : ZenzXD
*/

const handler = async (m, { conn, text, usedPrefix, command }) => {
 if (!text) return m.reply(`url videy nya mana bang?\ncontoh : ${usedPrefix + command} https://videy.co/v?id=4F2uO7k21`)

 try {
 const parsed = new URL(text)
 const id = parsed.searchParams.get('id')

 if (!id) throw 'url ga validd harus mengandung parameter id contoh : https://videy.co/v?id=abc123'

 const videoUrl = `https://cdn.videy.co/${id}.mp4`
 const filename = `zenzxz_${id}.mp4`

 await conn.sendFile(m.chat, videoUrl, filename, `*Videy downloader*`, m)
 } catch (e) {
 m.reply(`Eror kak : ${e?.message || e}`)
 }
}

handler.command = ['videy']
handler.premium = true

handler.category = 'Media'
handler.description = 'Videy'

export default handler