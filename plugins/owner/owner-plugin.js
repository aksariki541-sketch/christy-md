// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/owner/owner-plugin.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .plugin

let handler = async (m, { args }) => {
	const sub = (args[0] || '').toLowerCase();
	if (sub === 'list') {
		const rows = Object.entries(global.plugins)
			.map(([n, p]) => `${p.disabled ? '🔴' : '🟢'} ${n}`)
			.join('\n');
		return m.reply(`*PLUGIN STATUS*\n\n${rows}\n\nAtur: .plugin enable/disable <nama>`);
	}
	const name = args[1] ? args[1] + (args[1].endsWith('.js') ? '' : '.js') : null;
	if (!name || !(name in global.plugins)) return m.reply('Plugin tidak ditemukan. Lihat .plugin list');
	if (sub === 'enable') {
		global.plugins[name].disabled = false;
		return m.reply(`🟢 ${name} diaktifkan.`);
	}
	if (sub === 'disable') {
		global.plugins[name].disabled = true;
		return m.reply(`🔴 ${name} dinonaktifkan.`);
	}
	return m.reply('Sub-perintah: list/enable/disable');
};

handler.command = ['plugin']
handler.owner = true;

export default handler;
handler.category = 'Owner'
handler.description = 'Owner-plugin'

