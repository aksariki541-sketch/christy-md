// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/twitter.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .twitter, .tw, .xdl

/**
 ╔══════════════════════
 ⧉ [Twitter] — [downloader]
╚══════════════════════

 ✺ Type : Plugin ESM
 ✺ Source : https://
 ✺ Creator : SXZnightmare
 ✺ Scrape : 
 [ https://gist.github.com/ZenzzXD/d6223d6e9ead8f013be12c75754c00e9 ]
 [ https:///3420 ]
 ✺ Scrape Maker : [ Zenz ]
 ✺ Note : Only Video download
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
 try {
 if (!text) {
 return m.reply(`*Contoh: ${usedPrefix + command} https://x.com/...*`);
 }

 await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

 const body = new URLSearchParams({
 q: text,
 lang: 'id',
 cftoken: ''
 });

 const res = await fetch('https://savetwitter.net/api/ajaxSearch', {
 method: 'POST',
 headers: {
 'User-Agent': 'Mozilla/5.0',
 'Content-Type': 'application/x-www-form-urlencoded',
 'X-Requested-With': 'XMLHttpRequest',
 'Origin': 'https://savetwitter.net',
 'Referer': 'https://savetwitter.net/id3'
 },
 body
 });

 const json = await res.json();
 const html = json?.data;

 if (!html) {
 return m.reply('*Gagal mengambil data video 🍂*');
 }

 const title = html.match(/<h3>(.*?)<\/h3>/)?.[1]?.trim() || 'Twitter Video';
 const duration = html.match(/<p>(\d+:\d+)<\/p>/)?.[1] || '-';
 const thumbnail = html.match(/<img src="([^"]+)"/)?.[1];

 const mp4 = [...html.matchAll(/href="(https:\/\/dl\.snapcdn\.app\/get\?token=[^"]+)".*?MP4\s*\(([^)]+)\)/g)]
 .map(v => ({
 quality: v[2],
 url: v[1]
 }));

 if (!mp4.length) {
 return m.reply('*Video tidak ditemukan 🍂*');
 }

 const best = mp4[0];

 let caption = `*🐦 Twitter Downloader*\n\n`;
 caption += `*📌 Judul:* ${title}\n`;
 caption += `*⏱️ Durasi:* ${duration}\n`;
 caption += `*🎞️ Kualitas:* ${best.quality}\n`;

 await conn.sendMessage(
 m.chat,
 {
 video: { url: best.url },
 caption,
 jpegThumbnail: thumbnail ? await (await fetch(thumbnail)).arrayBuffer() : null
 },
 { quoted: m }
 );

 } catch (e) {
 await m.reply(`*Terjadi kesalahan saat memproses video 🍂*\n\n${e.message}`);
 } finally {
 await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
 }
};

handler.command = ['twitter', 'tw', 'xdl'];
handler.category = 'Media'
handler.description = 'Twitter'

export default handler;