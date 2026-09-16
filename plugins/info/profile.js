// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/main/profile.js (paket plugin Drive)
// Catatan    : command bentrok dengan yang sudah ada, diganti: profile→profile2
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .profile2, .profil, .me

import { xpRange } from '../../lib/nakano/levelling.js'

let handler = async (m, { conn, isOwner, isPrems }) => {
  let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender

  let user = global.db.data.users[who]
  if (!user) return m.reply('User tidak ditemukan.')

  let {
    level = 0,
    exp = 0,
    money = 0,
    limit = 0,
    role = 'Newbie',
    registered = false,
    name = '',
    age = '-',

    pasangan = '',
    jadian = false,
    jadianTime = 0
  } = user

  let { min, xp } = xpRange(level, global.multiplier || 1)

  let username = registered
    ? name
    : await conn.getName(who)

  let bio = 'Tidak ada bio'
  try {
    bio = (await conn.fetchStatus(who))?.status || 'Tidak ada bio'
  } catch {}

  let pp
  try {
    pp = await conn.profilePictureUrl(who, 'image')
  } catch {
    pp = './src/avatar_contact.png'
  }

  let status =
    isOwner ? '👑 Owner' :
    isPrems ? '💎 Premium' :
    '🌱 Free User'

  let limitText = isPrems ? 'Unlimited' : limit

  let pasanganText = 'Tidak Ada'
  let lamaJadian = '-'
  let tanggalJadian = '-'

  if (jadian && pasangan) {
    let waktuJadian = Date.now() - jadianTime

    let hari = Math.floor(waktuJadian / 86400000)
    let jam = Math.floor(waktuJadian / 3600000) % 24

    pasanganText = `@${pasangan.split('@')[0]}`
    lamaJadian = `${hari} Hari ${jam} Jam`

    tanggalJadian = new Date(jadianTime).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  let txt = `
🌷 Profile User

❏ User Status : ${status}

❏ Nama : ${username}
❏ Umur : ${registered ? age : '-'}
❏ Role : ${role}
❏ Bio : ${bio}

🎮 RPG

❏ Level : ${level}
❏ XP : ${exp - min}/${xp}
❏ Money : ${money}
❏ Limit : ${limitText}

💞 Relationship

❏ Status : ${jadian ? 'Berpacaran' : 'Jomblo'}
❏ Pasangan : ${pasanganText}
❏ Sejak : ${tanggalJadian}
❏ Bersama : ${lamaJadian}
`.trim()

  await conn.sendFile(
    m.chat,
    pp,
    'profile.jpg',
    txt,
    m,
    false,
    {
      mentions: [who, ...(jadian && pasangan ? [pasangan] : [])]
    }
  )
}

handler.command = ['profile2', 'profil', 'me']

export default handler
handler.category = 'Main'
handler.description = 'Profile'

