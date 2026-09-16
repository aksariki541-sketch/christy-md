// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/backup.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .backup

import fs from 'fs'
import archiver from 'archiver'
import path from 'path'

const handler = async (m, { conn }) => {
  try {
    const tmpDir = './tmp'
    const tmpFile = path.join(tmpDir, 'Christy.tmp')

    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    if (!fs.existsSync(tmpFile)) fs.writeFileSync(tmpFile, '')

    await m.reply('✨ sedang membuat backup...')

    const date = new Date().toLocaleDateString('id', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    })

    const backupName = `Christy MD - ${date}.zip`
    const output = fs.createWriteStream(backupName)
    const archive = archiver('zip', { zlib: { level: 1 } })

    output.on('close', async () => {
      const ownerChat = global.owner?.[0]?.[0]
        ? global.owner[0][0] + '@s.whatsapp.net'
        : m.sender

      const size = (archive.pointer() / 1024 / 1024).toFixed(2)

      const captionOwner = `✨ Backup Code Bot

📁 File: ${backupName}
📦 Size: ${size} MB
📅 ${date}`

      await conn.sendFile(ownerChat, backupName, backupName, captionOwner)

      if (ownerChat !== m.chat) {
        await m.reply('✨ backup berhasil dikirim ke owner')
      }

      fs.unlinkSync(backupName)
    })

    archive.on('warning', err => {
      if (err.code !== 'ENOENT') throw err
    })

    archive.on('error', err => {
      throw err
    })

    archive.pipe(output)

            archive.glob('**/*', {
          ignore: [
            'node_modules/**',
            'sessions/**',
            '.npm/**',
            'assets/**', 
            backupName
          ]
        })
        
    archive.finalize()

  } catch (e) {
    m.reply('❌ backup gagal:\n' + e.message)
  }
}

handler.command = ['backup']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Backup'

