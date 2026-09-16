// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/panel/listpanel.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .listpanel, .listp, .listserver


/*
📌 Nama Fitur: Cpanel
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VaxvdhJ6buMSjkRBNR2d
✍️ Convert By ZenzXD
Note : Gpp kalian ambil plugin nya tapi jan hapus wm bg :v ;(
*/  

import fetch from 'node-fetch'
import '../../lib/nakano/config.js'

const handler = async (m, { conn, sock, text, command }) => {
  try {
    let f = await fetch(`${global.domain}/api/application/servers`, {
      method: 'GET',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + global.apikey
      }
    })

    let res = await f.json()
    let servers = res.data
    if (servers.length < 1) return m.reply("Tidak ada server panel!")

    let messageText = ""
    for (let server of servers) {
      let s = server.attributes
      let f3 = await fetch(`${global.domain}/api/client/servers/${s.uuid.split('-')[0]}/resources`, {
        method: 'GET',
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + global.capikey
        }
      })

      let data = await f3.json()
      let status = data.attributes ? data.attributes.current_state : s.status
      let ram = s.limits.memory ? formatMemory(s.limits.memory) : "Unlimited"
      let cpu = s.limits.cpu ? s.limits.cpu + "%" : "Unlimited"
      let disk = s.limits.disk ? formatMemory(s.limits.disk) : "Unlimited"

      messageText += `\n 📡 *${s.id} [ ${s.name} ]*\n`
      messageText += ` *• Ram :* ${ram}\n`
      messageText += ` *• CPU :* ${cpu}\n`
      messageText += ` *• Disk :* ${disk}\n`
      messageText += ` *• Created :* ${s.created_at.split("T")[0]}\n`
    }
    await conn.sendMessage(m.chat, { text: messageText }, { quoted: m }) 

  } catch (err) {
    m.reply("Terjadi kesalahan: " + err.message)
  }
}

const formatMemory = (value) => {
  if (value.toString().length > 4) {
    return value.toString().slice(0, 2) + "GB"
  } else if (value.toString().length < 4) {
    return value.toString().charAt(1) + "GB"
  } else {
    return value.toString().charAt(0) + "GB"
  }
}

handler.command = ['listpanel', 'listp', 'listserver']
handler.owner = false
handler.premium = true

export default handler
handler.category = 'Owner'
handler.description = 'Listpanel'

