// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/cekrek.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .cekrek, .cekrekening

import axios from 'axios'

let handler = async (m, { text, usedPrefix, command }) => {
 if (!text) {
 throw `Contoh:\n${usedPrefix + command} Dana|0855xxxxx`
 }

 let [bank, number] = text.split('|')

 if (!bank || !number) {
 throw `Format salah!\n\nContoh:\n${usedPrefix + command} Dana|0855xxxx`
 }

 try {
 let { data } = await axios.get('https://api.nexray.eu.cc/information/check-rekening', {
 params: {
 number: number.trim(),
 bank: bank.trim()
 }
 })

 let result = data.result || {}

 let teks = `❏ Cek Rekening

❏ Bank : ${bank}
❏ Nomor : ${number}
❏ Status : ${result.success ? 'Valid' : 'Tidak Valid'}
❏ Pesan : ${result.error?.message || result.message || '-'}

❏ Response Time : ${data.response_time || '-'}`

 m.reply(teks)

 } catch (e) {
 console.error(e)
 m.reply('Gagal melakukan pengecekan rekening.')
 }
}

handler.command = ['cekrek', 'cekrekening']
handler.category = 'Tools'
handler.description = 'Cekrek'

export default handler