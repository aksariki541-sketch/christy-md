// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/cekeror.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .checkerror, .cekeror

import fs from 'fs'
import path from 'path'

let handler = async (m) => {
 let pluginFolder = './plugins'
 let errorList = []

 if (!fs.existsSync(pluginFolder)) {
 return m.reply('❌ Folder *plugins* tidak ditemukan!')
 }

 let files = fs.readdirSync(pluginFolder)
 .filter(file => file.endsWith('.js'))

 for (let file of files) {
 try {
 await import(
 `file://${path.resolve(pluginFolder, file)}?update=${Date.now()}`
 )
 } catch (err) {
 let msg = err.message || String(err)

 if (/export default/i.test(msg)) continue

 errorList.push(`❏ ${file}\n${msg}`)
 }
 }

 if (!errorList.length) {
 return m.reply(`
 check error 

❏ status :
semua fitur aman tidak ada error
`.trim())
 }

 m.reply(`
 check error 

❏ total error :
${errorList.length} plugin bermasalah

❏ list error :

${errorList.join('\n\n')}
`.trim())
}

handler.command = ['checkerror', 'cekeror']
handler.rowner = true

handler.category = 'Owner'
handler.description = 'Cekeror'

export default handler