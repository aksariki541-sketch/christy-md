// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/upchvn.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .upchvn

import fs from 'fs'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'

let handler = async (m, { conn, isOwner }) => {
  try {
    if (!isOwner) return m.reply('Khusus owner')

    let idsal = global.chId
    if (!idsal) return m.reply('ID channel belum diset di config.js')

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/audio/.test(mime)) return m.reply('Reply VN / audio yang mau dikirim ke channel')

    await m.reply('wait')

    let media = await q.download()

    const tempInput = path.join(os.tmpdir(), `${Date.now()}_input`)
    const tempOutput = path.join(os.tmpdir(), `${Date.now()}_output.ogg`)

    fs.writeFileSync(tempInput, media)

    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -y -i "${tempInput}" -map_metadata -1 -vn -ac 1 -ar 48000 -c:a libopus -b:a 96k "${tempOutput}"`,
        err => err ? reject(err) : resolve()
      )
    })

    const audioData = fs.readFileSync(tempOutput)

    await conn.sendMessage(idsal, {
      audio: audioData,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    })

    if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput)
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput)

    await m.reply('VN terkirim ke channel')
  } catch (e) {
    console.error(e)
    m.reply('Gagal kirim VN ke channel')
  }
}

handler.command = ['upchvn']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Upchvn'

