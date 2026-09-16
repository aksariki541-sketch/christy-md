// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/ip.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: ip→ip2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ip2

import fetch from 'node-fetch'

const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `*Example:* ${usedPrefix + command} 112.90.150.204`;
  try {
    let res = await fetch(`https://ipwho.is/${text}`).then(result => result.json());
    await conn.sendMessage(m.chat, { location: { degreesLatitude: res.latitude, degreesLongitude: res.longitude }},{ ephemeralExpiration: 604800 });
    await delay(2000);
    conn.reply(m.chat, JSON.stringify(res, null, 2), m);  
  } catch (e) { 
    throw { error: `IP ${text} not found!` };
  }
}

handler.command = ['ip2']


export default handler

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
handler.category = 'Tools'
handler.description = 'Ip'

