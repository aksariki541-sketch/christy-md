// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/group/group-delete.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .delete, .del, .hps, .hapus, .erase

const handler = async (m, { conn, command }) => {
 if (!m.quoted) throw 'Reply pesan yang ingin dihapus';
 try {
 let bilek = m.message.extendedTextMessage.contextInfo.participant;
 let banh = m.message.extendedTextMessage.contextInfo.stanzaId;
 return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: banh, participant: bilek } });
 } catch {
 return conn.sendMessage(m.chat, { delete: m.quoted.vM.key });
 }
};

handler.command = ['delete', 'del', 'hps', 'hapus', 'erase'];
handler.admin = false;

handler.category = 'Group'
handler.description = 'Delete'

export default handler;
