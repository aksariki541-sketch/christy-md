// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anime/info.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .animeinfo

import fetch from 'node-fetch'

var handler = async (m, { conn, text }) => {
 if (!text) throw `*Masukan Judul Anime Yang Ingin Kamu Cari !*`;

 let res = await fetch('https://api.jikan.moe/v4/anime?q=' + text);

 if (!res.ok) throw 'Tidak Ditemukan';

 let json = await res.json();
 let animeData = json.data[0];

 if (!animeData) throw 'Anime tidak ditemukan.';

 let {
 title_japanese,
 url,
 type,
 score,
 members,
 status,
 synopsis,
 favorites,
 images,
 genres,
 } = animeData;

 let genreList = genres.map((genre) => genre.name).join(', ');

 let animeingfo = `
Title: ${title_japanese}
Type: ${type}
Genres: ${genreList}
Score: ${score}
Members: ${members}
Status: ${status}
Favorites: ${favorites}
URL: ${url}
Synopsis: ${synopsis}
`;

 conn.sendFile(m.chat, images.jpg.image_url, 'anjime.jpg', `*ANIME INFO*\n` + animeingfo, m);
};

handler.command = ['animeinfo'];

handler.category = 'Fun'
handler.description = 'Info'

export default handler
