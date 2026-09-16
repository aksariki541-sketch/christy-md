// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/tools-blur.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: blur→blur2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .blur2

import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    await m.react('🌫️')

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) {
      return m.reply(
        `Reply/kirim gambar dengan caption\n\n` +
        `Contoh:\n${usedPrefix + command}`
      )
    }

    let media = await q.download()

    // 🔥 upload ke uguu
    let form = new FormData()
    form.append('files[]', media, 'image.jpg')

    let res = await axios.post('https://uguu.se/upload.php', form, {
      headers: form.getHeaders()
    })

    let url = res.data.files[0].url

    // 🔥 API Popcat Blur
    let api = `https://api.popcat.xyz/v2/blur?image=${encodeURIComponent(url)}`

    await conn.sendFile(m.chat, api, 'blur.png', '🌫️ Blur done', m)

  } catch (e) {
    console.error(e)
    m.reply('❌ Error bang')
  }
}

handler.command = ['blur2']

export default handler
handler.category = 'Tools'
handler.description = 'Tools-blur'

