// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/self-public.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: self→self2, public→public2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .self2, .public2

let handler = async(m, { conn, command }) => {
  let isPublic = command === "public";
  let self = global.opts["self"]

  if(self === !isPublic) return m.reply(`Dah ${!isPublic ? "Self" : "Public"} dari tadi ${m.sender.split("@")[0] === global.owner[1] ? "Mbak" : "Bang"} :v`)

  global.opts["self"] = !isPublic

  m.reply(`Berhasil ${!isPublic ? "Self" : "Public"} bot!`)
}


handler.owner = true

handler.command = ['self2', 'public2']

export default handler
handler.category = 'Owner'
handler.description = 'Self-public'

