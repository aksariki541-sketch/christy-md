// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/image-wallpaper.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .wallpaper

import { wallpaper } from "../../lib/nakano/scrape.js";

let handler = async (m, { conn, command, text, usedPrefix }) => {
    let query = text
    if (!query) throw `Input *URL*`;
    m.reply(wait);
    try {
        let wallpapers = await wallpaper(query);
        let randomWallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];
        let cap = "Source: wallpaperflare.com";
        conn.sendMessage(m.chat, { image: { url: randomWallpaper }, caption: cap }, m);
    } catch (e) {
        console.log(e);
        m.reply(`Error`);
    }
};

handler.command = ['wallpaper']

export default handler
handler.category = 'Media'
handler.description = 'Image-wallpaper'

