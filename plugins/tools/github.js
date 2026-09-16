// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/stalk/github.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ghstalk

/**
 * Fitur : GitHub stalk
 * Type : Plugins ESM
 * Creator : Riki
 * Channel : https://
 */

let handler = async (m, { text, usedPrefix, command }) => {
 if (!text) throw `${usedPrefix}${command} username`

 try {
 let res = await fetch(`https://api.github.com/users/${text}`)
 let json = await res.json()

 m.reply(`👤 ${json.login}
📦 Repo: ${json.public_repos}
👥 Followers: ${json.followers}
🔗 ${json.html_url}`)
 } catch {
 throw 'Error'
 }
}

handler.command = ['ghstalk']
handler.category = 'Tools'
handler.description = 'Github'

export default handler