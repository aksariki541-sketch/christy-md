// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/cekswgc.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cekswgc

let handler = async (m) => {
 console.log(
 JSON.stringify(m.message, null, 2)
 )

 m.reply('Pesan berhasil dilog ke console.')
}

handler.command = ['cekswgc']

handler.category = 'Tools'
handler.description = 'Cekswgc'

export default handler