// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/readmore.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .spoiler, .hidetext, .readmore, .selengkapnya

let handler = async (m, { conn, text }) => {
 let [l, r] = text.split`|`
 if (!l) l = ''
 if (!r) r = ''
 conn.reply(m.chat, l + readMore + r, m)
}
handler.command = ['spoiler', 'hidetext', 'readmore', 'selengkapnya']

handler.category = 'Tools'
handler.description = 'Readmore'

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)