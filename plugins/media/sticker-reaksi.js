// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/sticker/sticker-reaksi.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .reaksi

import canvasLib from '@napi-rs/canvas'
const { createCanvas, loadImage } = canvasLib

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Masukkan namanya, bub! Contoh: .reaksi RIN IMUP');
    
    try {
        const imageUrl = "https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/IMG-20260626-WA0295.jpg";
        const templateImg = await loadImage(imageUrl);
        
        const canvas = createCanvas(templateImg.width, templateImg.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.fillStyle = '#000000'; // Warna hitam
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const teksLengkap = `REAKSI ${text.trim().toUpperCase()}`;
        ctx.fillText(teksLengkap, 251, 80);
        
        const canvasBuffer = canvas.toBuffer('image/png');
        await conn.sendSticker(m.chat, canvasBuffer, m, {
            packName: 'RIN',  
            packPublish: 'MD'
        });

    } catch (e) {
        console.error(e);
        m.reply('Gagal membuat Reaksi.');
    }
};

handler.command = ['reaksi']

export default handler;
handler.category = 'Media'
handler.description = 'Sticker-reaksi'

