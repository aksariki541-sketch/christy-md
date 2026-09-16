// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/rpg-misi.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .misirpg

let handler = async (m, { conn, usedPrefix }) => {
	let caption = `
🚨 Silahkan Pilih Misi Kamu:

🛵 Ojek
🚀 Roket
👮 Polisi
🚶 Rob
☠️ Hitman
🚖 Taxy

Contoh:
${usedPrefix}ojek
`.trim()
	m.reply(caption)
}
handler.command = ['misirpg']
handler.group = true
handler.category = 'Main'
handler.description = 'Misi'

export default handler