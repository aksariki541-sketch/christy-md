// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/cmd-del.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: delcmd→delcmd2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .delcmd2

let handler = async (m) => {
	let hash;
	if (m.quoted && m.quoted.fileSha256) hash = m.quoted.fileSha256;
	if (!hash) throw `Tidak ada hash`;
	let sticker = global.db.data.sticker;
	if (sticker[hash] && sticker[hash].locked) throw 'Kamu tidak memiliki izin untuk menghapus perintah stiker ini';
	delete sticker[hash];
	m.reply(`Berhasil!`);
};

handler.command = ['delcmd2']

export default handler;
handler.category = 'Tools'
handler.description = 'Cmd-del'

