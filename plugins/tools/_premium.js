// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anu/_premium.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : (listener/customPrefix)
// Catatan    : handler.before/all -> handler.onMessage

let handler = m => m

handler.onMessage = async function (m) {
    let user = db.data.users[m.sender]
    if (user.role === 'Premium user' && user.premiumTime < Date.now()) {
        user.role = 'Free user'
        user.premiumTime = 0
        user.premium = false
    }
}

export default handler
handler.category = 'Tools'
handler.description = 'Premium'

