// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/ekspedisilist.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .ekspedisilist

let handler = async (m, { conn }) => {
 const ekspedisi = [
 'shopee-express', 'ninja', 'lion-parcel', 'pos-indonesia', 'tiki',
 'acommerce', 'gtl-goto-logistics', 'paxel', 'sap-express', 'indah-logistik-cargo',
 'lazada-express-lex', 'lazada-logistics', 'janio-asia', 'jet-express', 'pcp-express',
 'pt-ncs', 'nss-express', 'grab-express', 'rcl-red-carpet-logistics', 'qrim-express',
 'ark-xpress', 'standard-express-lwe', 'luar-negeri-bea-cukai'
 ]

 let teks = `📦 *Daftar Ekspedisi yang Tersedia:*\n\n${ekspedisi.map(v => `• ${v}`).join('\n')}`

 await conn.reply(m.chat, teks, m)
}

handler.command = ['ekspedisilist']
handler.category = 'Tools'
handler.description = 'Ekspedisilist'

export default handler