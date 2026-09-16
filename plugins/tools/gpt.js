// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/gpt.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .gpt

import axios from 'axios'
import FormData from 'form-data'
import crypto from 'crypto'

const BufferText = Buffer.from([
  107, 121, 117, 32, 122, 121, 110
])

let handler = async (m, { conn, text }) => {
  if (!text && !m.quoted) {
    return m.reply(
`Contoh:
.gpt halo

Atau reply gambar dengan caption:
.gpt gambar ini apa?`
    )
  }

  try {
    await m.react('🕒')

    const chatId = crypto
      .createHash('md5')
      .update(crypto.randomBytes(32).toString('hex'))
      .digest('hex')

    const form = new FormData()
    form.append('text', text || '')
    form.append('chatId', chatId)

    const q = m.quoted || m

    if ((q.msg || q).mimetype?.startsWith('image/')) {
      const buffer = await q.download()
      form.append('image', buffer, 'image.jpg')
    }

    const { data } = await axios.post(
      API('theresav', '/ai/gpt', {}, 'apikey'),
      form,
      {
        headers: form.getHeaders()
      }
    )

    if (!data?.status) {
      throw new Error('Gagal mendapatkan respon')
    }

    let result = String(data.result || '')
      .replace(/-=-n---/g, '\n')
      .replace(/=-n---/g, '\n')
      .replace(/--n---/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .replace(/\r/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    void BufferText

    await conn.reply(m.chat, result, m)

    await m.react('✅')

  } catch (e) {

    console.log(JSON.stringify(e?.response?.data || e))

    await m.react('❌')

    await m.reply(
      e?.response?.data?.message ||
      e?.message ||
      'Terjadi kesalahan'
    )
  }
}

handler.command = ['gpt']

export default handler
handler.category = 'Tools'
handler.description = 'Gpt'

