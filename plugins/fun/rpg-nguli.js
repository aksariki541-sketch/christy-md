// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/rpg-nguli.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .nguli

let handler = async (m) => {
	if (new Date() - global.db.data.users[m.sender].lastnguli > 86400000) {
		global.db.data.users[m.sender].limit += 10;
		m.reply('_Selamat Kamu Mendapatkan +10 Limit_');
		global.db.data.users[m.sender].lastnguli = Date.now();
	} else m.reply('Kamu Sudah Mengklaim Upah Nguli Hari Ini');
};
handler.command = ['nguli']
handler.group = true;

export default handler;
handler.category = 'Fun'
handler.description = 'Rpg-nguli'

