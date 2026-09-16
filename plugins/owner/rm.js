// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/rm.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .rm

/*
wa.me/6283134600805
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
ini wm gw cok jan di hapus
*/

import {
 tmpdir
} from 'os'
import path, {
 join
} from 'path'
import {
 readdirSync,
 statSync,
 unlinkSync,
 existsSync,
 readFileSync,
 watch
} from 'fs'
let handler = async (m, {
 conn,
 usedPrefix,
 usedPrefix: _p,
 __dirname,
 args,
 text,
 command
}) => {

 if (!text) throw `uhm.. where the text?\n\nexample:\n${usedPrefix + command} scraper/xxx.js`
 try {
 const file = join(__dirname, '../' + text)
 unlinkSync(file)
 conn.reply(m.chat, `Succes deleted "${text}"`, m)
 } catch (e) {
 m.reply('folder not found :' + e)
 } finally {

 }
}
handler.command = ['rm']

handler.rowner = true

handler.category = 'Owner'
handler.description = 'Rm'

export default handler