// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/owner-exec2.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Catatan    : trigger customPrefix diubah → '$$ ' (dobel persis dengan exec.js)
// Command    : (listener/customPrefix)

import cp, { exec as _exec } from 'child_process';
import { promisify } from 'util';
let exec = promisify(_exec).bind(cp);
let handler = async (m, { conn, command, text }) => {
	if (global.conn.user.jid != conn.user.jid) return;
	const { key } = await m.reply('Executing...');
	let o;
	try {
		o = await exec(command.trimStart() + ' ' + text.trimEnd());
	} catch (e) {
		o = e;
	} finally {
		let { stdout, stderr } = o;
		if (stdout.trim()) m.edit(stdout, key);
		if (stderr.trim()) m.reply(stderr);
	}
};
handler.customPrefix = /^\$\$ /;

handler.owner = true;
export default handler;
handler.category = 'Owner'
handler.description = 'Owner-exec2'

