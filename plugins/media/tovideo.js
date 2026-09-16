// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/tovideo.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: tomp4→tomp42, tovideo→tovideo2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tomp42, .tovideo2

import { webp2mp4 } from '../../lib/nakano/webp2mp4.js'
import { ffmpeg } from '../../lib/converter.js'
let handler = async (m, { conn, usedPrefix, command }) => {
	if (!m.quoted) throw `Balas stiker/audio yang ingin diubah menjadi video dengan perintah ${usedPrefix + command}`
	let mime = m.quoted.mimetype || ''
	if (!/webp|audio/.test(mime)) throw `Balas stiker/audio yang ingin diubah menjadi video dengan perintah ${usedPrefix + command}`
	let media = await m.quoted.download()
	let out = Buffer.alloc(0)
	if (/webp/.test(mime)) {
		out = await webp2mp4(media)
	} else if (/audio/.test(mime)) {
		out = await ffmpeg(media, [
			'-filter_complex', 'color',
			'-pix_fmt', 'yuv420p',
			'-crf', '51',
			'-c:a', 'copy',
			'-shortest'
		], 'mp3', 'mp4')
	}
	await conn.sendFile(m.chat, out, 'out.mp4', '*DONE*', m, 0, { thumbnail: out })
}


handler.command = ['tomp42', 'tovideo2']


export default handler
handler.category = 'Media'
handler.description = 'Tovideo'

