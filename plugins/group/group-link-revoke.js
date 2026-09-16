// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/group-link-revoke.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: linkgc→linkgc2, revoke→revoke2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .linkgc2, .revoke2

let handler = async (m, { command }) => {
	if (command === 'linkgc') {
		m.reply('https://chat.whatsapp.com/' + (await conn.groupInviteCode(m.chat)));
	}
	if (command === 'revoke') {
		m.reply('Berhasil Reset linkgc\n\nLink : https://chat.whatsapp.com/' + (await conn.groupRevokeInvite(m.chat)));
	}
};
handler.command = ['linkgc2', 'revoke2']
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
handler.category = 'Group'
handler.description = 'Group-link-revoke'

