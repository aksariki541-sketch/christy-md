// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/owner-sfp.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .sfp

import fs from 'fs';
import syntaxError from 'syntax-error';

let handler = async (m, { text, usedPrefix, command }) => {
	if (!text) throw `uhm.. teksnya mana?\n\npenggunaan:\n${usedPrefix + command} <teks>\n\ncontoh:\n${usedPrefix + command} plugins/file.js`;

	if (!m.quoted?.text) throw `balas pesan nya!`;

	let code = m.quoted.text;
	let path = `./plugins/${text}.js`;

	let err = syntaxError(code, path, {
		sourceType: 'module',
		allowAwaitOutsideFunction: true,
	});

	if (err)
		throw `❌ Syntax Error

Message : ${err.message}
Line : ${err.line}
Column : ${err.column}
Annotated : ${err.annotated}`;
	fs.writeFileSync(path, code);
	m.reply(`✅ tersimpan di ${path}`);
};

handler.command = ['sfp'];
handler.owner = true;

handler.category = 'Owner'
handler.description = 'Sfp'

export default handler;
