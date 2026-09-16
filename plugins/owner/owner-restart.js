// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/owner-restart.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .tart

import { parentPort } from 'worker_threads';

let handler = async (m, { conn }) => {
	if (!parentPort) throw 'Dont: node main.js\nDo: node index.js';
	if (global.conn.user.jid == conn.user.jid) {
		await m.reply('```R E S T A R T . . .```');
		parentPort.postMessage('restart');
	} else throw '_eeeeeiiittsssss..._';
};

handler.command = ['tart']
handler.owner = true;

export default handler;
handler.category = 'Owner'
handler.description = 'Owner-restart'

