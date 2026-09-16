// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anu/_alert.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : (listener/customPrefix)
// Catatan    : handler.before/all -> handler.onMessage

let handler = m => m;

handler.onMessage = async function (m) {
    // Check if the message is sent in a group
    if (m.isGroup) {
        // Ignore messages in groups
        return;
    }

    // Check if the user is banned
    let user = global.db.data.users[m.sender];
    if (user.banned === true) {
        // Get the current timestamp
        let now = Date.now();
        // Check if the user has been notified in the last 24 hours (86400000 milliseconds)
        if (!user.lastNotified || now - user.lastNotified > 86400000) {
            // Update the last notified timestamp
            user.lastNotified = now;
            let banReason = user.banReason || 'No reason provided.';
            m.reply(`Sorry, your number has been blocked from using this bot.\n\nReason: ${banReason}`);
        }
        return;
    }
}

export default handler;
handler.category = 'Tools'
handler.description = 'Alert'

