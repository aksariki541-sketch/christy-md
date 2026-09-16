// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/savescrape.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .savescrape

import { promises as fs } from 'fs'
import syntaxError from 'syntax-error'
import path from 'path'

const dir = './lib/nakano/scrape'

let handler = async (m, { text, __dirname }) => {
if (!text) throw 'Nama file?\nContoh:\n.savescrape y2mate'

if (!m.quoted) throw 'Reply kode scrape'

const code = m.quoted.text
if (!code) throw 'Kode tidak terbaca'

const filename = text.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.js'
const filepath = path.join(dir, filename)

await fs.mkdir(dir, { recursive: true })

const error = syntaxError(code, filename, {
sourceType: 'module',
allowAwaitOutsideFunction: true
})

if (error) throw error

await fs.writeFile(filepath, code)

m.reply(`✅ Scraper saved!

📁 ${filepath}

Import:
import { ${filename.replace('.js','')} } from '../../lib/nakano/scrape/${filename}'
`)
}

handler.command = ['savescrape']
handler.owner = true

export default handler
handler.category = 'Owner'
handler.description = 'Savescrape'

