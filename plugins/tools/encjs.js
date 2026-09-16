// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/encjs.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .encjs

import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const pexec = promisify(exec)

let handler = async (m, { conn }) => {
 let q = m.quoted

 if (!q) {
 return m.reply('Reply file .js yang ingin di-obfuscate')
 }

 let fileName = q.fileName || q.msg?.fileName || ''

 if (!fileName.endsWith('.js')) {
 return m.reply('Reply file .js yang valid')
 }

 let buffer = await q.download()

 let tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obf-'))
 let input = path.join(tmpDir, fileName)
 let output = path.join(tmpDir, `enc-${fileName}`)

 try {
 await fs.writeFile(input, buffer)

 await pexec(
 `npx javascript-obfuscator "${input}" ` +
 `--output "${output}" ` +
 `--compact true ` +
 `--string-array true ` +
 `--string-array-encoding rc4 ` +
 `--string-array-threshold 1 ` +
 `--self-defending true`
 )

 let result = await fs.readFile(output)

 await conn.sendMessage(m.chat, {
 document: result,
 fileName,
 mimetype: 'application/javascript'
 }, { quoted: m })

 } catch (e) {
 console.error(e)
 m.reply(`Error:\n${e.message}`)
 } finally {
 await fs.rm(tmpDir, {
 recursive: true,
 force: true
 }).catch(() => {})
 }
}

handler.command = ['encjs']
handler.category = 'Tools'
handler.description = 'Encjs'

export default handler