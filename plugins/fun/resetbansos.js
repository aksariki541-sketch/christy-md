// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/resetbansos.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .resetbansos

let handler = async (m, { conn, args, isOwner, command }) => {
    if (!isOwner) return m.reply('❌ Hanya owner yang bisa mereset bansos!');

    if (!args[0]) return m.reply(`Gunakan: *.${command} 628xxx*`);

    let jid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    let user = global.db.data.users[jid];

    if (!user) return m.reply(`⚠️ User dengan nomor ${args[0]} belum pernah menggunakan bot.`);

    user.lastBansos = 0;
    m.reply(`✅ Bansos untuk ${args[0]} telah di-reset. Mereka bisa klaim ulang sekarang.`);
};

handler.command = ['resetbansos']
handler.owner = true;

export default handler;
handler.category = 'Fun'
handler.description = 'Resetbansos'

