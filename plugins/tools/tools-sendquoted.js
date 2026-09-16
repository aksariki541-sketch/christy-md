// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/tools-sendquoted.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .quoted

async function handler(m) {
	if (!m.quoted) throw 'reply pesan!';
	let q = await m.getQuotedObj();
	if (!q.quoted) throw 'pesan yang anda reply tidak mengandung reply!';
	await q.quoted.copyNForward(m.chat, true);
}
handler.command = ['quoted'];
handler.category = 'Tools'
handler.description = 'Sendquoted'

export default handler;
