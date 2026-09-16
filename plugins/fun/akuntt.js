// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/akuntt.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .akuntiktok, .akuntiktokprofile, .akuntt

let handler = async (m) => {
    let who = m.sender;
    const user = global.db.data.users[who];

    if (!user.tiktok || !user.tiktok.username) {
        return m.reply('❌ Anda belum memiliki akun TikTok! Gunakan perintah *.creatett <username>* untuk membuat akun.');
    }

    const { username, followers = 0, likes = 0, views = 0 } = user.tiktok;

    m.reply(`
📱 **Profil TikTok Anda** 📱

🔹 **Username**: ${username}
⭐ **Followers**: ${followers}
❤️ **Likes**: ${likes}
👁️ **Views**: ${views}

Gunakan perintah *.livett <judul>* untuk memulai siaran langsung.
    `.trim());
};

handler.command = ['akuntiktok', 'akuntiktokprofile', 'akuntt']

export default handler;
handler.category = 'Fun'
handler.description = 'Akuntt'

