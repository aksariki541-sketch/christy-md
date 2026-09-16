// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/upvidey.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .upvidey

import { uploadVidey } from '../../lib/nakano/scrape/videy.js'
import fs from 'fs'

let handler = async (m, { conn }) => {
  if (!m.quoted) throw 'Reply video atau audio'

  const mime = m.quoted.mimetype || ''
  if (!/video|audio/.test(mime)) throw 'Reply file video/audio'

  await m.react('✨')

  const buffer = await m.quoted.download()
  const filePath = `./tmp_${Date.now()}.mp4`

  fs.writeFileSync(filePath, buffer)

  await m.react('🎧')

  const res = await uploadVidey(filePath)

  fs.unlinkSync(filePath)

  if (!res?.link) throw 'Upload gagal'

  await m.react('🌿')

  m.reply(`🎧 Upload Complete

🔗 ${res.link}`)
}

handler.command = ['upvidey']

export default handler
handler.category = 'Tools'
handler.description = 'Upvidey'

