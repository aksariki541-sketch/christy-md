// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/addai.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .addai

//~ Ahmad tumbuh kembang
let handler = async (m, { conn, text }) => {
 try {
 const groupJid = m.chat;

 if (!groupJid.endsWith("@g.us")) {
 return m.reply("Command ini hanya untuk grup.");
 }

 const res = await conn.groupParticipantsUpdate(
 groupJid,
 ["867051314767696@bot"],
 "add",
 );

 m.reply(
 "Sukses add Meta AI ke grup ✅"
 );
 } catch (e) {
 console.error(e);
 m.reply(String(e?.stack || e));
 }
};

handler.command = ['addai'];
handler.category = 'Tools'
handler.description = 'Addai'

export default handler;