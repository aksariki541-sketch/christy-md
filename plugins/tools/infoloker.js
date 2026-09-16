// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/internet/infoloker.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .infoloker

import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, text, command }) => {
 if (!text) return m.reply("Input query\nExample: .infoloker programmer")
 await m.reply(wait)
 try {
 let res = await infoloker(text);
 res = res.slice(0, 11);
 let teks = res.map((item, index) => {
 return `
🔍 *[ RESULT ${index + 1} ]*
📰 *Title:* ${item.job || 'Tidak diketahui'}
🏢 *Perusahaan:* ${item.perusahaan || 'Tidak diketahui'}
📍 *Daerah:* ${item.daerah || 'Tidak diketahui'}
🔗 *Link Detail:* ${item.link_Detail || 'Tidak diketahui'}
⬆️ *Upload:* ${item.upload || 'Tidak diketahui'}
`;
 }).filter(v => v).join("\n\n________________________\n\n");
 await m.reply(teks)
 } catch (e) {
 await m.reply(eror)
 }
};
handler.command = ['infoloker']
handler.category = 'Tools'
handler.description = 'Infoloker'

export default handler

/* New Line */
async function infoloker(query) {
 const url = `https://www.jobstreet.co.id/id/job-search/${query}-jobs/`;
 const response = await fetch(url);
 const html = await response.text();

 const $ = cheerio.load(html);
 const format = [];

 $('article').each((a, article) => {
 const job = $(article).find('h1 a div').text();
 const perusahaan = $(article).find('span').eq(0).text();
 const daerah = $(article).find('span span').text();
 const link_Detail = 'https://www.jobstreet.co.id' + $(article).find('h1 a').attr('href');
 const upload = $(article).find('div > time > span').text();

 format.push({ job, perusahaan, daerah, upload, link_Detail });
 });

 return format;
}
