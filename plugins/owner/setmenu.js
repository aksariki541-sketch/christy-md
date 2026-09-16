// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/setmenu.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setmenu

let handler = async (m, { text }) => {
  const n = parseInt(text?.trim())

  if (![1, 2].includes(n)) {
    return m.reply(`Pilih style menu:\n\n*setmenu 1* — Button\n*setmenu 2* — Link Preview Thumbnail Besar`)
  }

  global.menuStyle = n
  m.reply(`✅ Menu style diubah ke *Style ${n}*`)
}

handler.command = ['setmenu']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Setmenu'

