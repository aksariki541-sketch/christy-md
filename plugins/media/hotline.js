// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/maker/hotline.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .hotline

import axios from "axios";

const handler = async (m, { conn, usedPrefix, command }) => {
    await m.react("🕐");

    const raw = (m.text || '').slice((usedPrefix + command).length).trim();

    if (!raw)
        return m.reply(
            `Format:\n${usedPrefix + command} teks atas|teks bawah\n\nContoh:\n${usedPrefix + command} p|salam`
        );

    if (!raw.includes("|"))
        return m.reply(
            `Gunakan pemisah |\n\nContoh:\n${usedPrefix + command} hello|world`
        );

    const [text1Raw, text2Raw] = raw.split("|");

    const imgUrl =
        `https://api.cuki.biz.id/api/canvas/meme/hotline` +
        `?apikey=cuki-x&text1=${encodeURIComponent(text1Raw.trim())}` +
        `&text2=${encodeURIComponent(text2Raw.trim())}`;

    try {
        const res = await axios.get(imgUrl, { responseType: "arraybuffer" });

        await conn.sendFile(
            m.chat,
            res.data,
            "hotline.png",
            "🖼️ Hotline Meme",
            m
        );

        await m.react("✅");
    } catch (e) {
        console.error("❌ hotline error:", e);
        await m.react("❌");
        m.reply(`*ERROR:* ${e.message}`);
    }
};

handler.command = ['hotline']

export default handler;
handler.category = 'Media'
handler.description = 'Hotline'

