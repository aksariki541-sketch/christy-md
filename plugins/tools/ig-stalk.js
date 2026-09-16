// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/stalk/ig.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .igstalk, .instagramstalk

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:\n${usedPrefix + command} riki_ackerman`)
  }

  try {
    await m.react('🕒')

    const res = await fetch(
      API('theresav', '/stalk/ig', {
        username: text.trim()
      }, 'apikey')
    )

    const json = await res.json()

    if (!json.status) throw 'Username tidak ditemukan.'

    const d = json.result

    await conn.sendMessage(m.chat, {
      image: { url: d.profilePicUrl },
      caption: `
*\`Instagram Stalk\`*

✿ *\`Username\`* : ${d.username}
✿ *\`Full Name\`* : ${d.fullName || '-'}
✿ *\`Followers\`* : ${Number(d.followedCount).toLocaleString('id-ID')}
✿ *\`Following\`* : ${Number(d.followCount).toLocaleString('id-ID')}
✿ *\`Posts\`* : ${Number(d.postsCount).toLocaleString('id-ID')}
✿ *\`Verified\`* : ${d.isVerified ? 'Yes ✅' : 'No ❌'}
✿ *\`Private\`* : ${d.isPrivate ? 'Yes 🔒' : 'No 🌍'}
✿ *\`Biography\`* : ${d.biography || '-'}
`.trim()
    }, {
      quoted: m
    })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(typeof e === 'string' ? e : '❌ Gagal mengambil data Instagram.')
  }
}

handler.command = ['igstalk', 'instagramstalk']

export default handler
handler.category = 'Tools'
handler.description = 'Ig'

