// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/rpg-me.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .merpg

let handler = async (m,{conn})=>{

let user = global.db.data.users[m.sender]
let e = global.rpg.emoticon

let text = `
🌸 *ANYA RPG PROFILE* ❀

👤 User : @${m.sender.split('@')[0]}

${e('level')} Level : ${user.level}
${e('exp')} Exp : ${user.exp}

${e('health')} Health : ${user.health}
${e('stamina')} Stamina : ${user.stamina}

${e('money')} Money : ${user.money}
${e('bank')} Bank : ${user.bank}

${e('diamond')} Diamond : ${user.diamond}
${e('emerald')} Emerald : ${user.emerald}

${e('limit')} Limit : ${user.limit}
`.trim()

conn.sendMessage(m.chat,{
text,
mentions:[m.sender]
},{quoted:global.fstatus})

}

handler.command = ['merpg']
handler.group = true

export default handler
handler.category = 'Fun'
handler.description = 'Rpg-me'

