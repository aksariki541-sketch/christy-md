// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/owner-grepplugin.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: grepplugin→grepplugin2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .grepplugin2

import fs from 'fs'
import path from 'path'

const handler = async (m, { text }) => {
  if (!text) throw 'Masukin keyword\nContoh: .grepplugin conn.'

  const dir = './plugins'
  let results = []

  function scan(folder) {
    let files = fs.readdirSync(folder)
    for (let file of files) {
      let full = path.join(folder, file)
      let stat = fs.statSync(full)

      if (stat.isDirectory()) {
        scan(full)
      } else if (file.endsWith('.js')) {
        let data = fs.readFileSync(full, 'utf-8')
        let lines = data.split('\n')

        lines.forEach((line, i) => {
          if (line.includes(text)) {
            results.push(`${full} (baris ${i + 1})`)
          }
        })
      }
    }
  }

  scan(dir)

  if (!results.length) {
    return m.reply(`Tidak ditemukan keyword: ${text}`)
  }

  let res = `📦 Hasil grep plugin\nKeyword: ${text}\n\n`
  res += results.map((v, i) => `${i + 1}. ${v}`).join('\n')

  m.reply(res)
}

handler.command = ['grepplugin2']
handler.owner = true

export default handler
handler.category = 'Tools'
handler.description = 'Owner-grepplugin'

