// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/resetchat.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .resetchat

import fetch from 'node-fetch'
let handler = async (m) => {
let arr = Object.entries(db.data.chats).filter(user => !user[1].expired >= 1).map(user => user[0])
let boy = `Sukses Menghapus ${arr.length} Chat`
for (let x of arr) delete db.data.chats[x]
await m.reply(boy)
}
handler.command = ['resetchat']
handler.owner = true
export default handler
handler.category = 'Owner'
handler.description = 'Resetchat'

