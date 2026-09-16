// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/fun-ceksifat.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ceksifat

let handler = async (m, { text }) => {
	if (!text) return m.reply('Masukkan namamu!');

	m.reply(
		`
╭━━━°「 *Sifat ${text}* 」°━━━
┃
┃• Nama : ${text}
┃• Ahlak Baik : ${randomPersen()}
┃• Ahlak Buruk : ${randomPersen()}
┃• Orang yang : ${pickRandom(['Baik Hati', 'Sombong', 'Pelit', 'Dermawan', 'Rendah Hati', 'Rendah Diri', 'Pemalu', 'Penakut', 'Pengusil', 'Cengeng'])}
┃• Selalu : ${pickRandom([
			'Rajin',
			'Malas',
			'Membantu',
			'Ngegosip',
			'Jail',
			'Gak jelas',
			'Shopping',
			'Chattan sama Doi',
			'Chattan di WA karena Jomblo',
			'Sedih',
			'Kesepian',
			'Bahagia',
			'Ngocok tiap hari',
		])}
┃• Kecerdasan : ${randomPersen()}
┃• Kenakalan : ${randomPersen()}
┃• Keberanian : ${randomPersen()}
┃• Ketakutan : ${randomPersen()}
╰━━━━━━━━━━━━━━━
`.trim()
	);
};

handler.command = ['ceksifat'];

handler.category = 'Fun'
handler.description = 'Ceksifat'

export default handler;

function pickRandom(list) {
	return list[Math.floor(Math.random() * list.length)];
}

function randomPersen() {
	return (Math.random() * 100).toFixed(1) + '%';
}
