// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/tools/cmd-list.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: listcmd→listcmd2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .listcmd2

let handler = async (m, { conn }) => {
	conn.reply(
		m.chat,
		`
*DAFTAR CMD*
\`\`\`
${Object.entries(global.db.data.sticker)
	.map(([key, value], index) => `${index + 1}. ${value.locked ? `(Terkunci) ${key}` : key} : ${value.text}`)
	.join('\n')}
\`\`\`
`.trim(),
		null,
		{
			mentions: Object.values(global.db.data.sticker)
				.map((x) => x.mentionedJid)
				.reduce((a, b) => [...a, ...b], []),
		}
	);
};

handler.command = ['listcmd2']

export default handler;
handler.category = 'Tools'
handler.description = 'Cmd-list'

