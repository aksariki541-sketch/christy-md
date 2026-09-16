// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/maker/fakegroup2.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .fakegroup2

import FormData from 'form-data'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  const args = text.split('|').map(v => v.trim())

  if (args.length < 2) {
    throw `Contoh:
.fakegroup2 Christy MD|123`
  }

  const [name, members] = args

  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime)) {
    throw 'Reply atau kirim gambar dengan caption *.fakegroup2 nama|member*'
  }

  try {
    await m.react('🕒')

    const media = await q.download()
    if (!media) throw 'Gagal mengunduh gambar.'

    const form = new FormData()
    form.append('apikey', global.APIKeys[global.APIs.theresav])
    form.append('name', name)
    form.append('members', members)
    form.append('image', media, {
      filename: 'image.jpg',
      contentType: mime
    })

    const res = await fetch(`${global.APIs.theresav}/canvas/fakegroup2`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    })

    if (!res.ok) throw `HTTP ${res.status}`

    const buffer = Buffer.from(await res.arrayBuffer())

    await conn.sendMessage(m.chat, {
      image: buffer
    }, {
      quoted: m
    })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw 'Gagal membuat gambar.'
  }
}

handler.command = ['fakegroup2']

export default handler
handler.category = 'Media'
handler.description = 'Fakegroup2'

