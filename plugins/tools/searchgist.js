// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/searchgist.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .searchgist

/**
 * Fitur : Search GitHub Gist
 * Type : Plugins ESM
 * Creator : Riki
 * Channel : https://
 */

let handler = async (m, { text, usedPrefix, command }) => {
 if (!text) throw `${usedPrefix}${command} query`

 try {
 let hasil = []

 for (let page = 1; page <= 3; page++) {
 let res = await fetch(`https://gist.github.com/search?p=${page}&q=${encodeURIComponent(text)}`)
 let html = await res.text()

 let links = [...html.matchAll(/href="(\/[^"]+)"/g)]
 .map(v => 'https://gist.github.com' + v[1])
 .filter(v => /^https:\/\/gist\.github\.com\/[^/]+\/[a-f0-9]+$/.test(v))

 hasil.push(...links)
 }

 hasil = [...new Set(hasil)]
 .slice(0, 30)
 .map((v, i) => `❀ ${i + 1}. ${v}`)
 .join('\n\n')

 m.reply(hasil || 'Tidak ditemukan')

 } catch {
 throw 'Error'
 }
}

handler.command = ['searchgist']
handler.owner = false

handler.category = 'Tools'
handler.description = 'Searchgist'

export default handler