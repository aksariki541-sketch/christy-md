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

 // Kredensial TIDAK ditulis di dalam file ini. Isi lewat environment variable
 // supaya token tidak ikut ter-commit / terlihat orang lain:
 //   GH_UPLOAD_TOKEN  (wajib)  personal access token GitHub, scope "repo"
 //   GH_UPLOAD_USER   (opsional, default: username pemilik token)
 //   GH_UPLOAD_REPO   (wajib, contoh: my-uploads)
 //   GH_UPLOAD_FOLDER (opsional, folder tujuan di dalam repo)
 //   GH_UPLOAD_BRANCH (opsional, default: main)
 const config = {
 username: process.env.GH_UPLOAD_USER || "",
 repo: process.env.GH_UPLOAD_REPO || "",
 folder: process.env.GH_UPLOAD_FOLDER || "",
 token: process.env.GH_UPLOAD_TOKEN || "",
 branch: process.env.GH_UPLOAD_BRANCH || "main"
 }

 if (!config.token || !config.repo) {
 throw `❌ *Upload GitHub belum dikonfigurasi.*\n\n` +
 `Isi dulu di file .env / environment server:\n` +
 `• GH_UPLOAD_TOKEN = token GitHub (scope repo)\n` +
 `• GH_UPLOAD_REPO = nama repo tujuan\n` +
 `• GH_UPLOAD_USER = username GitHub (opsional)\n\n` +
 `Lalu restart bot.`
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