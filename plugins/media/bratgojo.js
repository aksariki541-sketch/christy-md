// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/bratgojo.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .bratgojo

import { sticker } from "../../lib/nakano/sticker.js"

let handler = async (m, { conn, text, usedPrefix, command }) => {
	if (m.quoted?.text) text = m.quoted.text
	else if (!text) {
		return m.reply(
			`Masukkan teks atau reply pesan.\n\n` +
			`Contoh:\n` +
			`${usedPrefix + command} Halo Riki`
		)
	}

	try {
		await m.react("🕜")

		const api = global.APIs.kyzzz
		const apikey = global.APIKeys[api]

		const res = await fetch(
			`${api}/api/maker/brat-gojo?text=${encodeURIComponent(text)}&apikey=${apikey}`
		)

		if (!res.ok) throw new Error(`HTTP ${res.status}`)

		const buffer = Buffer.from(await res.arrayBuffer())

		const stiker = await sticker(
			buffer,
			false,
			global.stickpack || global.namebot || "Sticker Pack",
			global.stickauth || global.author || "Bot"
		)

		if (stiker) {
			await conn.sendFile(m.chat, stiker, "", "", m)
			await m.react("✅")
		} else {
			await m.react("❌")
		}
	} catch (e) {
		await m.react("❌")
		throw e
	}
}

handler.command = ['bratgojo']
handler.group = false

export default handler
handler.category = 'Media'
handler.description = 'Bratgojo'

