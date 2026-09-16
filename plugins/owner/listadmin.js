// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/panel/listadmin.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: listadmin→listadmin2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .listadmin2


/*
📌 Nama Fitur: Cpanel 
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VaxvdhJ6buMSjkRBNR2d
✍️ Convert By ZenzXD
Note : Gpp kalian ambil plugin nya tapi jan hapus wm bg :v ;(
*/

import fetch from 'node-fetch';
import '../../lib/nakano/config.js';

const handler = async (m, { conn }) => {
  const domain = global.domain;
  const apikey = global.apikey;

  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + apikey
      }
    });

    const res = await response.json();
    const users = res.data;

    if (!users || users.length === 0) return m.reply("Tidak ada admin panel.");

    let teks = "*Daftar Admin Panel:*\n";

    for (const i of users) {
      if (i.attributes.root_admin !== true) continue;
      teks += `
📡 *${i.attributes.id} [ ${i.attributes.first_name} ]*
• Nama: ${i.attributes.first_name}
• Created: ${i.attributes.created_at.split("T")[0]}
`;
    }

    if (teks.trim() === "*Daftar Admin Panel:*") return m.reply("Tidak ditemukan admin panel.");

    await conn.sendMessage(m.chat, { text: teks.trim() }, { quoted: m });
  } catch (err) {
    m.reply("Gagal mengambil data admin panel:\n" + err.message);
  }
};

handler.command = ['listadmin2']
handler.owner = false
handler.premium = true


export default handler;
handler.category = 'Owner'
handler.description = 'Listadmin'

