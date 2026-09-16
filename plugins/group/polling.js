// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/polling.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .poll, .polling

let handler = async (m, { conn, text }) => {
 let args = text.split('\n').map(arg => arg.trim())
 let name = args[0]
 let values = args.slice(1)

 if (!name) {
 return m.reply(`*Contoh pemakaian:*
.poll text
text1
text2
seterusnya...

⌕ Contoh:
.poll best game
free fire
mobile legends
call of duty mobile
pubg mobile`.trim())
 }

 if (values.length < 2) {
 return m.reply(`*Berikan minimal 2 kata yang ingin dipoll*\n\n⌕ Contoh:\n.poll mending mana\npaolo maldini\nsergio ramos`)
 }

 let poll = {
 name: name,
 values: values,
 selectableCount: true
 }

 conn.sendMessage(m.chat, { poll: poll })

}
handler.command = ['poll', 'polling']
handler.group = true

handler.category = 'Group'
handler.description = 'Polling'

export default handler