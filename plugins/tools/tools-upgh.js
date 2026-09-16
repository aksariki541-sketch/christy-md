// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/tools-upgh.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .uploadgh, .tourlgh, .ghupload

import axios from 'axios'
import https from 'https'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { usedPrefix, command }) => {
 let q = m.quoted ? m.quoted : m
 let mime = (q.msg || q).mimetype || ''

 if (!mime) throw `❌ Kirim/Reply file dengan caption *${usedPrefix + command}*`

 m.reply('📤 *Uploading...*')

 try {
 let media = await q.download()

 let type = await fileTypeFromBuffer(media)
 let mimeFix = type?.mime || mime
 let ext = type?.ext || mime.split('/')[1] || 'bin'

 const config = {
 username: "hamm-r",
 repo: "uploader",
 folder: "",
 token: "TOKEN-DIHAPUS", // ⚠️ pake token baru
 branch: "main"
 }

 let filename = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`
 let filePath = config.folder ? `${config.folder}/${filename}` : filename
 let contentBase64 = media.toString('base64')

 let apiUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${filePath}`

 const agent = new https.Agent({ family: 4 })

 await axios.put(apiUrl, {
 message: `Bot Upload: ${filename}`,
 content: contentBase64,
 branch: config.branch
 }, {
 httpsAgent: agent,
 headers: {
 "Authorization": `token ${config.token}`,
 "Content-Type": "application/json",
 "User-Agent": "Christy MD"
 }
 })

 let rawUrl = `https://raw.githubusercontent.com/${config.username}/${config.repo}/${config.branch}/${filePath}`

 let caption = `✅ *Upload Berhasil!*\n\n` +
 `📄 *File:* ${filename}\n` +
 `📦 *Type:* ${mimeFix}\n\n` +
 `🔗 *URL:*\n${rawUrl}`

 // 🔥 KIRIM URL DOANG
 m.reply(caption)

 } catch (e) {
 console.error(e)
 let errMsg = e.response?.data?.message || e.message
 m.reply(`❌ *Gagal Upload!*\n\nServer: ${errMsg}`)
 }
}

handler.command = ['uploadgh', 'tourlgh', 'ghupload']
handler.category = 'Tools'
handler.description = 'Upgh'

export default handler