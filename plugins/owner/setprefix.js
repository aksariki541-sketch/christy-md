// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/setprefix.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setpref

let handler = async (m, { text }) => {

 if (!text) throw `Contoh penggunaan:
.setprefix .
.setprefix !
.setprefix . / #
.setprefix noprefix

Gunakan spasi untuk multi prefix`

 let clean = text.toLowerCase().trim()

 if (clean === 'noprefix' || clean === 'nonprefix' || clean === 'none') {
 global.prefix = /^/
 return m.reply('✅ Mode *no-prefix* aktif. Command bisa dipanggil tanpa simbol apapun.')
 }

 let prefixes = text.split(' ').map(p => p.trim()).filter(p => p)

 global.prefix = new RegExp(
 '^(' + prefixes.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')'
 )

 await m.reply(`✅ Prefix berhasil diubah menjadi: *${prefixes.join(' , ')}*`)
}

handler.command = ['setpref']
handler.rowner = true

handler.category = 'Owner'
handler.description = 'Setprefix'

export default handler