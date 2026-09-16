// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/maker/maker-iqc2.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: iqc2→iqc22
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .iqc22

/*
📱 iPhone Quoted Chat Maker (IQC) - FIX FINAL
Type: Plugin ESM
*/

import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {

  if (!text) {
    return m.reply(
`📱 *iPhone Quoted Chat Maker*

Contoh:
.${command} Halo bang

Custom:
.${command} Halo bang|11:02|17:01`
    )
  }

  try {

    await m.reply("⏳ Membuat quoted chat...")

    let parts = text.split('|')

    let quotedText = parts[0] || 'Hello'
    let chatTime = parts[1] || '11:02'
    let statusBarTime = parts[2] || '17:01'

    let bubbleColor = '#272a2f'
    let menuColor = '#272a2f'
    let textColor = '#FFFFFF'
    let fontName = 'Arial'
    let signalName = 'Telkomsel'
    let apikey = 'freeApikey'

    let url =
      `https://anabot.my.id/api/maker/iqc?` +
      `text=${encodeURIComponent(quotedText)}` +
      `&chatTime=${encodeURIComponent(chatTime)}` +
      `&statusBarTime=${encodeURIComponent(statusBarTime)}` +
      `&bubbleColor=${encodeURIComponent(bubbleColor)}` +
      `&menuColor=${encodeURIComponent(menuColor)}` +
      `&textColor=${encodeURIComponent(textColor)}` +
      `&fontName=${encodeURIComponent(fontName)}` +
      `&signalName=${encodeURIComponent(signalName)}` +
      `&apikey=${encodeURIComponent(apikey)}`

    let res = await fetch(url)

    // cek apakah response image langsung
    let contentType = res.headers.get("content-type")

    if (contentType.includes("image")) {

      let buffer = await res.buffer()

      return await conn.sendFile(
        m.chat,
        buffer,
        'iqc.png',
        `📱 iPhone Quoted Chat

💬 ${quotedText}
🕒 ${chatTime}`,
        m
      )

    }

    // jika JSON
    let json = await res.json()

    if (!json.status) {
      throw json.message || "API Error"
    }

    let imageUrl =
      json.result?.url ||
      json.url ||
      json.result

    if (!imageUrl) throw "URL gambar tidak ditemukan"

    await conn.sendFile(
      m.chat,
      imageUrl,
      'iqc.png',
      `📱 iPhone Quoted Chat

💬 ${quotedText}
🕒 ${chatTime}`,
      m
    )

  } catch (e) {
    console.error(e)
    m.reply("❌ Gagal membuat gambar\n\n" + e)
  }

}

handler.command = ['iqc22']

export default handler
handler.category = 'Media'
handler.description = 'Maker-iqc2'

