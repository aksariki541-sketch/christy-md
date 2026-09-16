// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/search/npmjs.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .npmjs

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
 if (!text) {
 return conn.reply(
 m.chat,
 `Penggunaan: ${usedPrefix}${command} <nama_package>\n\nContoh: ${usedPrefix}${command} express`,
 m
 );
 }

 await m.react('🕒');

 try {
 const query = text.trim();

 const response = await fetch(
 `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=10`
 );

 const result = await response.json();

 if (!result.objects || result.objects.length === 0) {
 await m.react('❌');
 return conn.reply(m.chat, `Tidak ada hasil untuk "${query}"`, m);
 }

 let caption = '— npmjs search —\n\n';

 result.objects.slice(0, 5).forEach((pkg, index) => {
 const data = pkg.package;

 caption += `${index + 1}. ❀ name :\n${data.name}\n\n`;
 caption += `❀ version :\n${data.version}\n\n`;
 caption += `❀ description :\n${data.description || 'Tidak ada deskripsi'}\n\n`;
 caption += `❀ author :\n${data.author?.name || 'Unknown'}\n\n`;
 caption += `❀ url :\n${data.links?.npm || 'N/A'}\n\n`;
 caption += '—————————————\n\n';
 });

 await m.react('✅');
 await conn.reply(m.chat, caption.trim(), m);

 } catch (error) {
 await m.react('❌');
 conn.reply(m.chat, `Terjadi kesalahan: ${error.message}`, m);
 }
};

handler.command = ['npmjs'];
handler.category = 'Tools'
handler.description = 'Npmjs'

export default handler;