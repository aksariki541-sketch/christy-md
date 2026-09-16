// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/exp-ceksn.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ceksn

import { createHash } from 'crypto'

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { conn, text, usedPrefix }) {
 let sn = createHash('md5').update(m.sender).digest('hex')

m.reply(`*📮 SN:* ${sn}`)
}

handler.command = ['ceksn']
handler.category = 'Main'
handler.description = 'Ceksn'

export default handler