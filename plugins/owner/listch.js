// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/listch.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .listch

let handler = async (m, { conn }) => {
 try {
 let res = await conn.newsletterSubscribed()

 if (!res || !res.length) {
 return m.reply('…kayaknya kamu belum ngikutin channel apapun.')
 }

 let teks = `🎧 *Channel List (${res.length})*\n\n`

 for (let ch of res) {
 let id = ch.id

 let name =
 ch.name?.text ||
 ch.thread_metadata?.name?.text ||
 ch.name ||
 ch.thread_metadata?.name ||
 'Unknown Channel'

 if (typeof name === 'object') name = 'Unknown Channel'

 teks += `▸ ${name}\n`
 teks += ` ⤷ ${id}\n\n`
 }

 m.reply(teks)
 } catch (e) {
 m.reply('…error.')
 }
}

handler.command = ['listch']
handler.owner = true

handler.category = 'Owner'
handler.description = 'Listch'

export default handler