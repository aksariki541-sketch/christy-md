// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/tools-compress.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: compress→compress2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .compress2

import sharp from "sharp";

let handler = async (m, { conn }) => {
    if (!m.quoted) return m.reply(`Reply gambar.`);

    let mime = m.quoted.mimetype || "";
    if (!mime.startsWith("image/")) return m.reply(`Yang direply harus gambar.`);

    let media = await m.quoted.download();
    let before = Buffer.byteLength(media);

    let result = await sharp(media)
        .resize({
            width: 480, 
            height: 480,
            fit: "inside",
            withoutEnlargement: true
        })
        .sharpen({
            sigma: 1.2,
            m1: 1.0,
            m2: 1.4,
            x1: 1.0,
            y2: 2.4,
            y3: 3.2
        })
        .jpeg({
            quality: 35,
            mozjpeg: true,
            chromaSubsampling: "4:2:0",
            optimiseScans: true,
            trellisQuantisation: true,
            overshootDeringing: true
        })
        .withMetadata(false)
        .toBuffer();

    let after = Buffer.byteLength(result);

    await conn.sendMessage(
        m.chat,
        {
            image: result,
            caption: `Compressed\nBefore: ${(before/1024).toFixed(1)} KB\nAfter: ${(after/1024).toFixed(1)} KB`
        },
        { quoted: m }
    );
};

handler.command = ['compress2']

export default handler;
handler.category = 'Tools'
handler.description = 'Tools-compress'

