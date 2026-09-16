// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/cmd-lock.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .un

let handler = async (m, { command }) => {
	if (!m.quoted) throw 'Tag Pesan!';
	if (!m.quoted.fileSha256) throw 'SHA256 Hash Missing';
	let sticker = db.data.sticker;
	let hash = m.quoted.fileSha256;
	if (!(hash in sticker)) throw 'Hash not found in database';
	sticker[hash].locked = !/^un/i.test(command);
	m.reply('Done!');
};
handler.command = ['un']

export default handler;
handler.category = 'Tools'
handler.description = 'Cmd-lock'

