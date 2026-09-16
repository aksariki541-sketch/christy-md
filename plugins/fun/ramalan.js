// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/ramalan.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ramal

let handler = async (m, { text }) => {
 const nama = text || m.pushName || 'Kamu'

 const ramalan = [
 '💸 Akan jadi sultan dadakan dari giveaway yang gak sengaja diikutin.',
 '💔 Akan ditikung sahabat sendiri, tapi tetap ikhlas karena jodoh gak ke mana.',
 '🛌 Kamu akan tidur 14 jam dan bangun tetap capek.',
 '📱 HP kamu akan jatuh tapi nggak lecet. Cuma mental kamu yang retak.',
 '🎓 Kamu akan lulus... dari hubungan tanpa kejelasan.',
 '📉 Akan investasi kripto, tapi malah beli token tipu-tipu.',
 '🛍️ Kamu akan belanja banyak, tapi lupa bayar listrik.',
 '👽 Alien bakal culik kamu karena mengira kamu spesies langka.',
 '💘 Akan jatuh cinta sama orang yang ngira kamu bot.',
 '😂 Kamu akan ketawa hari ini gara-gara baca pesan ini.'
 ]

 const hasil = ramalan[Math.floor(Math.random() * ramalan.length)]
 m.reply(`🔮 *Ramalan Masa Depan*\n\n${nama}, ${hasil}`)
}

handler.command = ['ramal']
handler.category = 'Fun'
handler.description = 'Ramalan'

export default handler