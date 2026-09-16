// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/quran/islam-kisahnabi.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .kisahnabi

import fetch from 'node-fetch'

let handler = async (m, {conn, text, usedPrefix, command }) => {
 if (!text) throw `Masukan nama nabi\nExample: ${usedPrefix + command} adam`
 let url = await fetch(`https://raw.githubusercontent.com/ZeroChanBot/Api-Freee/a9da6483809a1fbf164cdf1dfbfc6a17f2814577/data/kisahNabi/${text}.json`)
 let kisah = await url.json().catch(_ => "Error")
 if (kisah == "Error") throw "*Not Found*\n*📮 ᴛɪᴘs :* coba jangan gunakan huruf capital"
 
 let hasil = `_*👳 Nabi :*_ ${kisah.name}
_*📅 Tanggal Lahir :*_ ${kisah.thn_kelahiran}
_*📍 Tempat Lahir :*_ ${kisah.tmp}
_*📊 Usia :*_ ${kisah.usia}

*— — — — — — — — [ K I S A H ] — — — — — — — —*

${kisah.description}`

 conn.reply(m.chat, hasil, m)

 }
handler.command = ['kisahnabi']
handler.category = 'Fun'
handler.description = 'Kisahnabi'

export default handler