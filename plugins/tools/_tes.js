// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anu/_tes.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : (listener/customPrefix)

let handler = async (m) => {
  const Christy = `*\`Christy MD\`*

✿ *\`Status\`* : Online.
✿ *\`Info\`* : Ketik *.menu* untuk melihat semua fitur.

Lagi dengar lagu pakai headphone... ada yang bisa kubantu?`

  m.reply(Christy)
}

handler.customPrefix = /^(tes|bot|Christy|nakanobot|test)$/i


export default handler
handler.category = 'Tools'
handler.description = 'Tes'

