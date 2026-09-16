// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/sticker-brat.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .brat

let handler = async (m, { text, conn }) => {
	if (!text) throw 'Masukkan text\n\nContoh:\n.brat abay dan senn';
	try {
		const url = 'https://shinana-brat.hf.space/?text=' + encodeURIComponent(text);
		conn.sendSticker(m.chat, url, m);
	} catch (e) {
		console.error(e);
		m.reply('Brat error, donasi ke owner segera');
	}
};

handler.command = ['brat'];
handler.category = 'Media'
handler.description = 'Brat'

export default handler;
