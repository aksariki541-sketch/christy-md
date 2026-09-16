// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/sfl.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .sfl, .bypasssfl

let handler = async (m, { text, usedPrefix, command }) => {
	if (!text) {
		return m.reply(
			`Masukkan URL Safelink.\n\n` +
			`Contoh:\n` +
			`${usedPrefix + command} https://sfl.gl/ntCx0RF`
		)
	}

	try {
		await m.react("🍀")

		const api = global.APIs.kyzzz
		const apikey = global.APIKeys[api]

		const res = await fetch(
			`${api}/api/bypass/sfl?url=${encodeURIComponent(text)}&apikey=${apikey}`
		)

		const json = await res.json()

		if (!json.status) {
			return m.reply("❌ Gagal membypass URL.")
		}

		const d = json.result

		await m.reply(`*\`Safelink Bypass\`*

✿ *\`Original URL\`* : ${d.originalUrl}

✿ *\`Destination URL\`* :
${d.destinationUrl}`)
	} catch (e) {
		m.reply(`❌ Error: ${e.message}`)
	}
}

handler.command = ['sfl', 'bypasssfl']

export default handler
handler.category = 'Tools'
handler.description = 'Sfl'

