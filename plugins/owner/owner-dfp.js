// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/owner-dfp.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .dfp

import path from 'path';
import { unlinkSync } from 'fs';
let handler = async (m, { usedPrefix, __dirname, args }) => {
	let ar = Object.keys(plugins);
	let ar1 = ar.map((v) => v.replace('.js', ''));
	if (!args) throw `uhm.. where the text?\n\nexample:\n${usedPrefix + command} info`;
	if (!ar1.includes(args[0])) throw `*🗃️ NOT FOUND!*\n==================================\n\n${ar1.map((v) => ' ' + v).join`\n`}`;
	const file = path.join(__dirname, '../plugins/' + args[0] + '.js');
	unlinkSync(file);
	conn.reply(m.chat, `Succes deleted "plugins/${args[0]}.js"`, m);
};
handler.command = ['dfp'];
handler.owner = true;

handler.category = 'Owner'
handler.description = 'Dfp'

export default handler;
