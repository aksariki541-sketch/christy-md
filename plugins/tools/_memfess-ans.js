// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anu/_memfess-ans.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : (listener/customPrefix)
// Catatan    : listener murni -> handler.onMessage

const delay = time => new Promise(res => setTimeout(res, time))
async function before(m) {
	if (!m.chat.endsWith('@s.whatsapp.net')) return !0;
	this.menfess = this.menfess ? this.menfess : {}
	let mf = Object.values(this.menfess).find(v => v.status === false && v.penerima == m.sender)
	if (!mf) return !0
	console.log({ text: m.text, type: m.quoted?.mtype })
	if ((m.text === 'BALAS PESAN' || m.text === '') && m.quoted.mtype == 'extendedTextMessage') return m.reply("Silahkan kirim pesan balasan kamu.\nKetik pesan sesuatu lalu kirim, maka pesan otomatis masuk ke target balas pesan.");
	else {
		let txt = `Hai kak @${mf.dari.split('@')[0]}, kamu menerima balasan nih.\n\nPesan yang kamu kirim sebelumnya:\n${mf.pesan}\n\nPesan balasannya:\n${m.text}\n`.trim();
		await this.reply(mf.dari, txt, null).then(() => {
			m.reply('Berhasil Mengirim balasan.')
			delay(1500)
			delete this.menfess[mf.id]
			return !0
		})
	}
	return !0
}
/* Made By FokusDotId (Fokus ID)
 * https://github.com/FokusDotId
 * Ingin bikin fitur tapi tidak bisa coding?
 * hubungi: https://wa.me/6281320170984
*/

// Dibungkus jadi plugin Christy MD: hook asli "handler.before" (dipanggil untuk
// setiap pesan di base lama) dipetakan ke hook "handler.onMessage".
const handler = async (m, ctx) => before(m, {
    conn: ctx.conn, sock: ctx.sock, plugins: ctx.plugins,
    args: ctx.args, text: ctx.text, usedPrefix: ctx.usedPrefix,
    isAdmin: ctx.isAdmin, isBotAdmin: ctx.isBotAdmin,
    isOwner: ctx.isOwner, isCreator: ctx.isCreator, isPremium: ctx.isPremium, isPrems: ctx.isPrems,
    participants: ctx.participants, groupMetadata: ctx.groupMetadata,
    user: ctx.user
})
handler.onMessage = handler

export default handler
handler.category = 'Tools'
handler.description = 'Memfess-ans'

