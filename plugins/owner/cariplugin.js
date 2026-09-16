// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/cariplugin.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .grepplugin, .cariplugin, .cari

import fs from 'fs'
import path from 'path'

const handler = async (m, { text, usedPrefix, command }) => {
 if (!text) {
 throw `Contoh:\n${usedPrefix + command} brat`
 }

 const dir = './plugins'
 const results = []

 function scan(folder) {
 const files = fs.readdirSync(folder)

 for (const file of files) {
 const full = path.join(folder, file)
 const stat = fs.statSync(full)

 if (stat.isDirectory()) {
 scan(full)
 } else if (file.endsWith('.js')) {
 const data = fs.readFileSync(full, 'utf8')

 if (data.includes(text)) {
 results.push(full)
 }
 }
 }
 }

 scan(dir)

 if (!results.length) {
 return m.reply(`*\`Plugin Search\`*

✿ *\`Keyword\`* : ${text}
✿ *\`Total\`* : 0`)
 }

 const res = `*\`Plugin Search\`*

✿ *\`Keyword\`* : ${text}
✿ *\`Total\`* : ${results.length}

${results.map(v => `✿ ${v}`).join('\n')}`

 m.reply(res)
}

handler.command = ['grepplugin', 'cariplugin', 'cari']
handler.owner = true
handler.category = 'Owner'
handler.description = 'Cariplugin'

export default handler