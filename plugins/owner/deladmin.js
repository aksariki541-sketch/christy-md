// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/panel/deladmin.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .deladmin


/*
📌 Nama Fitur: Cpanel 
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VaxvdhJ6buMSjkRBNR2d
✍️ Convert By ZenzXD
Note : Gpp kalian ambil plugin nya tapi jan hapus wm bg :v ;(
*/

import fetch from 'node-fetch'
import '../../lib/nakano/config.js'

const handler = async (m, { conn, text, args, command }) => {
  if (!text) return m.reply(`Contoh:\n\n*${command} <id_user_admin>*`)

  const { domain, apikey } = global

  try {
    const cek = await fetch(`${domain}/api/application/users`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + apikey
      }
    })

    const res = await cek.json()
    const users = res.data

    let target = users.find(e => e.attributes.id == args[0] && e.attributes.root_admin)

    if (!target) return m.reply("Gagal menghapus akun!\nID user tidak ditemukan atau bukan admin.")

    const idadmin = target.attributes.id
    const username = target.attributes.username

    const delusr = await fetch(`${domain}/api/application/users/${idadmin}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + apikey
      }
    })

    if (!delusr.ok) {
      const err = await delusr.json()
      return m.reply("Gagal menghapus:\n" + JSON.stringify(err.errors?.[0] || err, null, 2))
    }

    await m.reply(`Sukses menghapus akun admin panel *${username}* ✅`)
  } catch (err) {
    m.reply("Terjadi kesalahan: " + err.message)
  }
}

handler.command = ['deladmin']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Deladmin'

