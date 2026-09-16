// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/nanobana.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .editimage, .nanobanana

import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import fetch from 'node-fetch'

async function uguu(filePath) {
  const form = new FormData()
  form.append('files[]', fs.createReadStream(filePath))
  const { data } = await axios.post('https://uguu.se/upload', form, {
    headers: { ...form.getHeaders() }
  })
  return data.files[0].url
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  let q = m.quoted ? m.quoted : m

  if (q.mtype !== 'imageMessage') {
    return conn.reply(
      m.chat,
      `*Example :* reply gambar + ${usedPrefix + command} Ubah jadi tersenyum`,
      m
    )
  }

  if (!text) {
    return conn.reply(
      m.chat,
      `*Example :* reply gambar + ${usedPrefix + command} Ubah jadi tersenyum`,
      m
    )
  }

  let media = await q.download()
  let tmp = './tmp_' + Date.now() + '.jpg'
  fs.writeFileSync(tmp, media)

  let urlGambar = await uguu(tmp)
  fs.unlinkSync(tmp)

  let url = `${global.APIs.faa}/faa/nano-banana?url=${encodeURIComponent(urlGambar)}&prompt=${encodeURIComponent(text)}`
  let res = await fetch(url)

  if (!res.ok) return

  let buffer = Buffer.from(await res.arrayBuffer())
  await conn.sendFile(m.chat, buffer, 'edit.png', '', m)
}

handler.command = ['editimage', 'nanobanana']

export default handler
handler.category = 'Tools'
handler.description = 'Nanobana'

