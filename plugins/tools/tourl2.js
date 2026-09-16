// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/tourl2.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .upload

import axios from 'axios';
import FormData from 'form-data';

async function uploadImage(imageBuffer) {
 try {
 const form = new FormData();
 form.append('file', imageBuffer, {
 filename: 'image.jpg',
 contentType: 'image/jpeg'
 });

 const headers = {
 ...form.getHeaders(),
 'Content-Length': form.getLengthSync()
 };

 const response = await axios.post('https://www.pic.surf/upload.php', form, { headers });
 const identifier = response.data.identifier;

 return `https://www.pic.surf/${identifier}`;
 } catch (error) {
 throw new Error(`Upload gagal: ${error.response ? error.response.data : error.message}`);
 }
}

const handler = async (m, { conn }) => {
 try {
 await m.react('⌛');

 let q = m.quoted ? m.quoted : m;
 let mime = (q.msg || q).mimetype || '';
 if (!mime.startsWith('image')) throw 'Silakan reply gambar atau kirim gambar dengan caption command.';

 let media = await q.download();
 let imageUrl = await uploadImage(media);

 await m.react('✅');

 let caption = `*${imageUrl}*`;

 await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

 } catch (error) {
 await m.react('❌');
 await conn.sendMessage(m.chat, { text: `❌ *Error:* ${error.message}` }, { quoted: m });
 }
};

handler.command = ['upload'];
handler.category = 'Tools'
handler.description = 'Tourl2'

export default handler;