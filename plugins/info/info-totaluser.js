// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/info-totaluser.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .jumlah

let handler = async (m) => {
	let totalreg = Object.keys(global.db.data.users).length;
	let rtotalreg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
	let kon = `乂 *U S E R*
    
╭╾• *Current Database ${totalreg} User*
=
╰╾• *Currently Registered ${rtotalreg} User*`;
	await m.reply(kon);
};
handler.command = ['jumlah']

export default handler;
handler.category = 'Main'
handler.description = 'Info-totaluser'

