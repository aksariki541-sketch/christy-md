// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/info/market.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .market

/**
 ╔══════════════════════
 ⧉ [market] — [info]
╚══════════════════════

 ✺ Type : Plugin ESM
 ✺ Source : https://
 ✺ Creator : SXZnightmare
 ✺ API : https://zelapioffciall.koyeb.app
 ✺ Note : .market (buat menampilkan top 1-10) .market 11 atau 250 (buat nunjukin posisi market dengan rank 11 itu apa sampe seterusnya)
*/

let handler = async (m, { conn, text }) => {
 try {
 await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

 let res = await fetch("https://zelapioffciall.koyeb.app/live/market");
 if (!res.ok) throw new Error("Fetch failed");

 let json = await res.json();
 if (!json.status || !Array.isArray(json.data)) throw new Error("Invalid response");

 let output = `*📈 MARKET CRYPTO UPDATE*\n`;
 output += `*🌍 Total Market:* ${json.total}\n\n`;

 let data;

 if (!text) {
 data = json.data.slice(0, 10);
 } else {
 let rank = parseInt(text);
 if (isNaN(rank) || rank < 1)
 throw new Error("Invalid rank");

 data = json.data.filter(v => v.market_cap_rank === rank);
 if (!data.length)
 return m.reply(`🍂 *Market rank #${rank} tidak ditemukan.*`);
 }

 for (let c of data) {
 let trend =
 c.price_change_percentage_24h > 0 ? "🟢" :
 c.price_change_percentage_24h < 0 ? "🔴" : "⚪";

 output += `*#${c.market_cap_rank} ${c.name} (${c.symbol})*\n`;
 output += `💰 *Harga:* $${c.current_price}\n`;
 output += `${trend} *24 Jam:* ${c.price_change_percentage_24h.toFixed(2)}%\n`;
 output += `🏦 *Market Cap:* $${c.market_cap.toLocaleString()}\n`;
 output += `🔄 *Volume:* $${c.total_volume.toLocaleString()}\n`;
 output += `📦 *Supply:* ${c.circulating_supply.toLocaleString()}\n\n`;
 }

 output += `✨ *Update terakhir:* ${new Date(json.data[0].last_updated).toLocaleString()}`;

 await conn.sendMessage(
 m.chat,
 {
 text: output,
 contextInfo: {
 externalAdReplyOffOffOff: {
 title: "Market Crypto Update",
 body: "Realtime Global Crypto Market",
 mediaType: 1,
 thumbnailUrl: "https://files.cloudkuimages.guru/images/9f291dfe14a8.jpg",
 renderLargerThumbnail: true,
 sourceUrl: "https://zelapioffciall.koyeb.app/live/market"
 }
 }
 },
 { quoted: m }
 );
 } catch (e) {
 await m.reply(`🍂 *Gagal mengambil data market crypto.*`);
 } finally {
 await conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
 }
};

handler.command = ['market'];
handler.category = 'Main'
handler.description = 'Market'

export default handler;