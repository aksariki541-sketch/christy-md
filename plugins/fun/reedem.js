// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/rpg/reedem.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .reedem

/*
*Plugins : Rpg-Reedem*
*atur sesuai sc mu ya adick adick*
   *Credits :*
https://whatsapp.com/channel/0029VavBc6uHAdNdbgCgOK0k

*/


let handler = async (m, { conn, args }) => {
  try {
    if (args.length === 0) return conn.reply(m.chat, '[❗] Silakan masukkan kode redeemnya', m)
    
    let kodeValid = ['zenzxcukiganteng']; // ganti aja
    let user = global.db.data.users[m.sender];
    
    if (!user.lastcode) user.lastcode = 0;
    
    if (kodeValid.includes(args[0])) {
      let waktuSekarang = new Date();
      let waktuTerakhir = new Date(user.lastcode);
      let selisihWaktu = waktuSekarang - waktuTerakhir;
      
      if (selisihWaktu > 86400000) { // 1 hari
        user.lastcode = waktuSekarang.getTime();
        user.exp += 250000;
        user.limit += 25;
        user.bank += 25000;
        user.money += 250000;
        conn.reply(m.chat, '*🎉🙀Congratulations!*\n\nKamu telah mendapatkan:\n+25000 XP\n+25000 Money\n+25000 Nabung Money\n+25 Limit', m)
      } else {
        conn.reply(m.chat, '[🐣]Kode sudah digunakan, harap tunggu sampai besok!', m)
      }
    } else {
      conn.reply(m.chat, '[❌] Kode redeem tidak valid!', m)
    }
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '[🐧]Terjadi kesalahan.', m)
  }
}

handler.command = ['reedem']
export default handler;























/*
https://whatsapp.com/channel/0029VavBc6uHAdNdbgCgOK0k   

Sesuaikan sama sc mu
*/
handler.category = 'Fun'
handler.description = 'Reedem'

