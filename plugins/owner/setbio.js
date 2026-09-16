// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/setbio.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setbio

let handler = async (m, { conn, text }) => {
 if (!text) throw `Masukan Text Untuk Bio Baru Bot`
 try {
 await conn.updateProfileStatus(text).catch(_ => _)
 conn.reply(m.chat, 'Sukses Mengganti Bio Bot', m)
} catch {
 throw 'Yah Error.. :D'
 }
}
handler.command = ['setbio']
handler.owner = true

handler.category = 'Owner'
handler.description = 'Setbio'

export default handler