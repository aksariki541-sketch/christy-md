// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/sharetext.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .shareteks, .bagiteks

/*
 • Fitur By Anomaki Team
 • Created : xyzan code
 • Share teks *(Plugins)*
 • Jangan Hapus Wm
 • https://
*/

import axios from 'axios';

const handler = async (m, {
 conn,
 text
}) => {
 if (!text) throw 'Kasih teks yang mau dishare dong...';

 try {
 const link = await bikinLink(text);
 await conn.reply(m.chat, `Nih link teks lu: ${link}`, m);
 } catch (e) {
 await conn.reply(m.chat, `Waduh error: ${e}`, m);
 }
};

handler.command = ['shareteks', 'bagiteks'];
handler.category = 'Tools'
handler.description = 'Sharetext'

export default handler;

const bikinLink = async (teks) => {
 const {
 data
 } = await axios.post('https://sharetext.io/api/text', {
 text: teks
 }, {
 headers: {
 'User-Agent': 'Mozilla/5.0',
 'Referer': 'https://sharetext.io/'
 }
 });

 if (!data) throw 'Gagal bikin link';
 return `https://sharetext.io/${data}`;
};

// kok simple bang? Ya emng gini simple webnya 😹