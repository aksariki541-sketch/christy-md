// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/sipaling2.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .sipaling

/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6283134600805)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/
let handler = async (m, { conn, command, usedPrefix, text, groupMetadata }) => {
 if (!text) throw `Contoh:\n${usedPrefix + command} ganteng`

 let emojis = ['😀','😂','😎','🤔','🤩','😜','🙃','😏','🥳','🥴','😇','🫡','😡']
 let praises = [
 "Luar biasa banget! 😍",
 "Nggak ada lawannya! 🤯",
 "Beneran juara! 🏆",
 "Sungguh fenomenal! 🚀",
 "Mantap kali! 💥",
 "Top banget deh! 🥳",
 ]

 function pickRandom(list) {
 return list[Math.floor(Math.random() * list.length)]
 }

 function shuffle(array) {
 for (let i = array.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1))
 ;[array[i], array[j]] = [array[j], array[i]]
 }
 return array
 }

 let participants = groupMetadata.participants
 let shuffled = shuffle([...participants])
 let target = shuffled[0].id

 let teks = `Yang *paling ${text}* adalah @${target.split('@')[0]} ${pickRandom(emojis)}\n${pickRandom(praises)}`

 conn.sendMessage(m.chat, {
 text: teks,
 mentions: [target]
 }, { quoted: m })
}

handler.command = ['sipaling']
handler.group = true

handler.category = 'Fun'
handler.description = 'Sipaling2'

export default handler