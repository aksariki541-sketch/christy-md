// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/meme.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .smeme

import { sticker } from '../../lib/nakano/sticker.js'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

async function uguu(filePath) {
  try {
    const form = new FormData()
    form.append('files[]', fs.createReadStream(filePath))
    const { data } = await axios.post('https://uguu.se/upload', form, { headers: { ...form.getHeaders() } })
    return data.files[0].url
  } catch (err) {
    throw new Error(err.message)
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let [atas, bawah] = text.split('|')
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) throw `Balas media dengan perintah\n\n${usedPrefix + command} <teks atas>|<teks bawah>`

  m.react('🕒')
  let mediaBuffer = await q.download()

  let ext = mime.split('/')[1] || 'png'
  let tempFile = path.join(process.cwd(), `temp_${Date.now()}.${ext}`)
  fs.writeFileSync(tempFile, mediaBuffer)

  try {
    let url = await uguu(tempFile)
    let stiker

    if (mime.startsWith('image/')) {
      let memeUrl = `https://api.memegen.link/images/custom/${encodeURIComponent(atas || ' ')}/${encodeURIComponent(bawah || ' ')}.png?background=${url}`
      stiker = await sticker(false, memeUrl, 'Christy MD', 'ʙy ʀɪᴋɪ')
    } else {
      stiker = await sticker(false, url, 'Christy MD', 'ʙy ʀɪᴋɪ')
    }

    await conn.sendFile(m.chat, stiker, '', '', m, '')
  } finally {
    fs.unlinkSync(tempFile)
  }
}

handler.command = ['smeme']

export default handler
handler.category = 'Media'
handler.description = 'Meme'

