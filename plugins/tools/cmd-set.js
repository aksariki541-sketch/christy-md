// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/cmd-set.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: setcmd→setcmd2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setcmd2

let handler = async (m, { text, usedPrefix, command }) => {
	if (!m.quoted) throw `Balas stiker dengan perintah *${usedPrefix + command}*`;
	if (!m.quoted.fileSha256) throw 'SHA256 Hash Missing';
	if (!text) throw `Penggunaan:\n${usedPrefix + command} <teks>\n\nContoh:\n${usedPrefix + command} tes`;
	let sticker = db.data.sticker;
	let hash = m.quoted.fileSha256;
	if (sticker[hash] && sticker[hash].locked) throw 'Kamu tidak memiliki izin untuk mengubah perintah stiker ini';
	sticker[hash] = {
		text,
		mentionedJid: m.mentionedJid,
		creator: m.sender,
		at: Date.now(),
		locked: false,
	};
	m.reply(`Success!`);
};

handler.command = ['setcmd2']

export default handler;
handler.category = 'Tools'
handler.description = 'Cmd-set'

