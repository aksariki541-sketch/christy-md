// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/owner-broadcast.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: broadcast→broadcast2, bc→bc2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .broadcast2, .bc2

import { delay } from '../../lib/baileys.js';

let handler = async (m, { text }) => {
	if (!text) return m.reply('Kirim: .broadcast <pesan>\nMode: .broadcast group/user/owner <pesan>');
	let mode = 'group';
	let msg = text;
	const first = text.split(/\s+/)[0].toLowerCase();
	if (['group', 'user', 'owner', 'gc', 'pc'].includes(first)) {
		mode = first === 'pc' ? 'user' : first;
		msg = text.slice(first.length).trim();
	}
	if (!msg) return m.reply('Pesan kosong.');

	let targets = [];
	if (mode === 'user') targets = Object.keys(global.db.data.users).filter((j) => j.endsWith('@s.whatsapp.net'));
	else if (mode === 'owner') targets = global.owner.map(([n]) => n + '@s.whatsapp.net');
	else targets = Object.keys((await conn.groupFetchAllParticipating().catch(() => ({}))) || {});

	if (!targets.length) return m.reply('Tidak ada target.');
	let ok = 0,
		fail = 0;
	for (const jid of targets) {
		try {
			await conn.sendMessage(jid, { text: `📢 *BROADCAST*\n\n${msg}` });
			ok++;
		} catch {
			fail++;
		}
		await delay(300);
	}
	return m.reply(`✅ Broadcast selesai.\nMode: ${mode}\nDikirim: ${ok}\nGagal: ${fail}`);
};

handler.command = ['broadcast2', 'bc2']
handler.owner = true;

export default handler;
handler.category = 'Owner'
handler.description = 'Owner-broadcast'

