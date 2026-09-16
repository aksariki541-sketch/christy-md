// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/rvo.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .rvo

let handler = async (m, { conn }) => {
 if (!m.quoted) throw '❌ Reply ke pesan view once!'

 let q = m.quoted

 // Pastikan yang direply adalah media view once
 let mime = (q.msg || q).mimetype || ''
 if (!mime) throw '❌ Itu bukan pesan media view once!'

 let media = await q.download() // download media
 if (!media) throw '❌ Gagal download media!'

 await conn.sendFile(m.chat, media, 'media.' + mime.split('/')[1], q.text || '', m)
}

handler.command = ['rvo']
handler.category = 'Tools'
handler.description = 'Rvo'

export default handler