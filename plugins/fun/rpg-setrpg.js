// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/rpg-setrpg.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .setrpg

let handler = async (m,{conn,args})=>{

let user = global.db.data.users[m.sender]

let type = (args[0]||'').toLowerCase()

if(type !== 'anya')
return conn.reply(m.chat,'Gunakan:\n.setrpg anya',m)

if(user.anya)
return conn.reply(m.chat,'Kamu sudah menjadi Adventurer Anya',m)

user.anya = true

conn.reply(m.chat,`
🌸 *ANYA RPG* ❀

Selamat datang Adventurer!

Sekarang kamu bisa berburu monster dengan:
.huntanya
`,m)

}

handler.command = ['setrpg']
handler.group = true

export default handler
handler.category = 'Fun'
handler.description = 'Rpg-setrpg'

