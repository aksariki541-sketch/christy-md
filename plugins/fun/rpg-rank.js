// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/rpg-rank.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .rank

let handler = async (m,{conn})=>{

let user = global.db.data.users[m.sender]

let rank = 'F'

if(user.exp > 5000) rank='E'
if(user.exp > 10000) rank='D'
if(user.exp > 20000) rank='C'
if(user.exp > 40000) rank='B'
if(user.exp > 70000) rank='A'
if(user.exp > 120000) rank='S'

conn.reply(m.chat,`
❀ *ADVENTURER STATUS* ❀

👤 @${m.sender.split('@')[0]}

🏅 Rank : ${rank}
✨ Exp : ${user.exp}
💰 Money : ${user.money}
❤️ Health : ${user.health}
`,m,{mentions:[m.sender]})

}

handler.command = ['rank']
handler.group = true

export default handler
handler.category = 'Fun'
handler.description = 'Rpg-rank'

