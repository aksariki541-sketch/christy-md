// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/downloader/gitclone.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .gitclone

const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
var handler = async (m, { args, usedPrefix, command }) => {
 if (!args[0]) throw `Example user ${usedPrefix}${command} https://github.com/ImYanXiao/Elaina-MultiDevice`
 if (!regex.test(args[0])) throw 'Url Tidak Valid! '
 let [_, user, repo] = args[0].match(regex) || []
 repo = repo.replace(/.git$/, '')
 let url = `https://api.github.com/repos/${user}/${repo}/zipball`
 let filename = (await fetch(url, { method: 'HEAD' })).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
 m.reply(`D o w n l o a d i n g. . .`)
 conn.sendFile(m.chat, url, filename, null, m)
}
handler.command = ['gitclone']

handler.category = 'Media'
handler.description = 'Gitclone'

export default handler
