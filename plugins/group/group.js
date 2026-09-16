import { SYMBOL, card } from '../../lib/ui.js'
import { getGroupAdmins } from '../../lib/myfunc.js'

const GROUP_ONLY = 'Perintah ini hanya bisa dipakai di dalam grup.'
const ADMIN_ONLY = 'Perintah ini hanya untuk admin grup.'
const BOT_ADMIN = 'Bot harus jadi admin grup untuk menjalankan perintah ini.'

const cleanNumber = (text) => String(text || '').replace(/[^0-9]/g, '')
const mention = (jid) => `@${String(jid).split('@')[0]}`

let handler = async (m, { conn, args, command, text, notifReply }) => {
    if (!m.isGroup) return notifReply(GROUP_ONLY, 'Perintah Grup')

    const supports = (name) => typeof conn[name] === 'function'
    const meta = await conn.groupMetadata(m.chat).catch(() => null)
    if (!meta) return notifReply('Gagal mengambil data grup.', 'Perintah Grup')

    const admins = getGroupAdmins(meta.participants)
    const botJid = conn.decodeJid(conn.user.id)
    const isAdmin = admins.includes(m.sender) || m.isCreator
    const botIsAdmin = admins.includes(botJid)

    const target = (() => {
        const mentioned = m.mentionedJid?.[0] || (m.msg?.contextInfo?.mentionedJid || [])[0]
        if (mentioned) return mentioned
        if (m.quoted?.sender) return m.quoted.sender
        if (args[0]) {
            const number = cleanNumber(args[0])
            if (number.length >= 8) return `${number}@s.whatsapp.net`
        }
        return null
    })()

    const requireAdmin = () => {
        if (isAdmin) return false
        notifReply(ADMIN_ONLY, 'Akses Ditolak')
        return true
    }
    const requireBotAdmin = () => {
        if (botIsAdmin) return false
        notifReply(BOT_ADMIN, 'Akses Ditolak')
        return true
    }
    const requireTarget = () => {
        if (target) return false
        notifReply('Tentukan target: mention, reply pesan, atau tulis nomornya.', 'Target Kosong')
        return true
    }

    switch (command) {
        case 'groupinfo':
        case 'gc info': {
            const owner = meta.owner ? mention(conn.decodeJid(meta.owner)) : 'tidak diketahui'
            return notifReply([
                `Nama     : ${meta.subject}`,
                `ID       : ${meta.id}`,
                `Dibuat   : ${meta.creation ? new Date(meta.creation * 1000).toLocaleString('id-ID') : 'tidak diketahui'}`,
                `Owner    : ${owner}`,
                `Anggota  : ${meta.participants.length}`,
                `Admin    : ${admins.length}`,
                `Mode     : ${meta.announce ? '🔒 Hanya admin' : '🌐 Semua anggota'}`,
                `Deskripsi: ${meta.desc ? `${meta.desc.slice(0, 200)}${meta.desc.length > 200 ? '...' : ''}` : '(kosong)'}`
            ].join('\n'), 'Info Grup')
        }

        case 'listadmin':
        case 'adminlist': {
            const rows = admins.map((jid, i) => `${i + 1}. ${mention(jid)}${jid.includes(botJid.split('@')[0]) ? ' (bot)' : ''}`)
            return notifReply(rows.join('\n') || 'Tidak ada admin.', 'Daftar Admin')
        }

        case 'listmember':
        case 'anggota': {
            const rows = meta.participants.map((p, i) => `${i + 1}. ${mention(p.id)}${p.admin ? ' 👑' : ''}`)
            const chunks = []
            for (let i = 0; i < rows.length; i += 50) chunks.push(rows.slice(i, i + 50).join('\n'))
            return notifReply(chunks[0] + (chunks.length > 1 ? `\n\n...dan ${rows.length - 50} anggota lain` : ''), `Anggota (${rows.length})`)
        }

        case 'tagall': {
            if (requireAdmin()) return
            const reason = text || 'Panggilan untuk semua anggota'
            const list = meta.participants.map(p => `⬡ ${mention(p.id)}`).join('\n')
            await conn.sendMessage(m.chat, {
                text: `${card('Tag All', `${reason}\n\n${list}`)}`,
                mentions: meta.participants.map(p => p.id)
            }, { quoted: m })
            return
        }

        case 'hidetag': {
            if (requireAdmin()) return
            await conn.sendMessage(m.chat, {
                text: text || 'Pesan untuk semua anggota',
                mentions: meta.participants.map(p => p.id)
            }, { quoted: m })
            return
        }

        case 'linkgc':
        case 'gclink': {
            if (!supports('groupInviteCode')) return notifReply('Fitur ini tidak didukung library yang dipakai.', 'Link Grup')
            if (!botIsAdmin) return notifReply(BOT_ADMIN, 'Akses Ditolak')
            const code = await conn.groupInviteCode(m.chat)
            return notifReply(`https://chat.whatsapp.com/${code}`, 'Link Grup')
        }

        case 'revoke':
        case 'resetlink': {
            if (requireAdmin()) return
            if (!supports('groupRevokeInvite')) return notifReply('Fitur ini tidak didukung library yang dipakai.', 'Revoke Link')
            if (!botIsAdmin) return notifReply(BOT_ADMIN, 'Akses Ditolak')
            const code = await conn.groupRevokeInvite(m.chat)
            return notifReply(`Link lama sudah direset.\n\nLink baru:\nhttps://chat.whatsapp.com/${code}`, 'Revoke Link')
        }

        case 'promote': {
            if (requireAdmin()) return
            if (requireTarget()) return
            if (!supports('groupParticipantsUpdate')) return notifReply('Fitur ini tidak didukung library yang dipakai.', 'Promote')
            await conn.groupParticipantsUpdate(m.chat, [target], 'promote')
            return notifReply(`${mention(target)} sekarang menjadi *admin*.`, 'Promote')
        }

        case 'demote': {
            if (requireAdmin()) return
            if (requireTarget()) return
            if (!supports('groupParticipantsUpdate')) return notifReply('Fitur ini tidak didukung library yang dipakai.', 'Demote')
            await conn.groupParticipantsUpdate(m.chat, [target], 'demote')
            return notifReply(`${mention(target)} sudah bukan admin.`, 'Demote')
        }

        case 'kick':
        case 'remove': {
            if (requireAdmin()) return
            if (requireTarget()) return
            if (!supports('groupParticipantsUpdate')) return notifReply('Fitur ini tidak didukung library yang dipakai.', 'Kick')
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
            return notifReply(`${mention(target)} dikeluarkan dari grup.`, 'Kick')
        }

        case 'adduser':
        case 'addmember': {
            if (requireAdmin()) return
            const number = cleanNumber(args[0])
            if (number.length < 8) return notifReply('Format:\n.adduser 628xxx', 'Tambah Anggota')
            if (!supports('groupParticipantsUpdate')) return notifReply('Fitur ini tidak didukung library yang dipakai.', 'Tambah Anggota')

            const jid = `${number}@s.whatsapp.net`
            const result = await conn.groupParticipantsUpdate(m.chat, [jid], 'add')
            const status = result?.[0]?.status
            const notes = {
                '200': 'berhasil ditambahkan',
                '403': 'gagal — privasi user menolak undangan',
                '408': 'gagal — user baru keluar grup terlalu sering',
                '409': 'gagal — user sudah ada di grup',
                '500': 'gagal — grup penuh'
            }
            return notifReply(`${jid} ${notes[status] || `status ${status}`}`, 'Tambah Anggota')
        }

        case 'leave':
        case 'keluar': {
            if (!isAdmin && !m.isCreator) return notifReply(ADMIN_ONLY, 'Akses Ditolak')
            await notifReply('Bot akan keluar dari grup ini.', 'Keluar Grup')
            if (!supports('groupLeave')) return notifReply('Fitur ini tidak didukung library yang dipakai.', 'Keluar Grup')
            return await conn.groupLeave(m.chat)
        }

        case 'groupname':
        case 'setgcname': {
            if (requireAdmin()) return
            if (!text) return notifReply(`Nama grup sekarang: *${meta.subject}*\n\nFormat:\n.setgcname <nama baru>`, 'Nama Grup')
            if (!supports('groupUpdateSubject')) return notifReply('Fitur ini tidak didukung library yang dipakai.', 'Nama Grup')
            await conn.groupUpdateSubject(m.chat, text.slice(0, 100))
            return notifReply(`Nama grup diubah menjadi *${text.slice(0, 100)}*`, 'Nama Grup')
        }

        case 'groupdesc':
        case 'setdesc': {
            if (requireAdmin()) return
            if (!text) return notifReply('Format:\n.setdesc <deskripsi baru>', 'Deskripsi Grup')
            if (!supports('groupUpdateDescription')) return notifReply('Fitur ini tidak didukung library yang dipakai.', 'Deskripsi Grup')
            await conn.groupUpdateDescription(m.chat, text.slice(0, 500))
            return notifReply('Deskripsi grup berhasil diubah.', 'Deskripsi Grup')
        }

        case 'open':
        case 'groupopen': {
            if (requireAdmin()) return
            if (!supports('groupSettingUpdate')) return notifReply('Fitur ini tidak didukung library yang dipakai.', 'Buka Grup')
            await conn.groupSettingUpdate(m.chat, 'not_announcement')
            return notifReply('Grup dibuka — semua anggota bisa mengirim pesan.', 'Buka Grup')
        }

        case 'close':
        case 'groupclose': {
            if (requireAdmin()) return
            if (!supports('groupSettingUpdate')) return notifReply('Fitur ini tidak didukung library yang dipakai.', 'Tutup Grup')
            await conn.groupSettingUpdate(m.chat, 'announcement')
            return notifReply('Grup ditutup — hanya admin yang bisa mengirim pesan.', 'Tutup Grup')
        }

        case 'setppgc':
        case 'groupicon': {
            if (requireAdmin()) return
            if (!supports('updateProfilePicture')) return notifReply('Fitur ini tidak didukung library yang dipakai.', 'Foto Grup')
            const { imageBuffer } = await import('../../lib/media.js')
            const buffer = await imageBuffer(m).catch(() => null)
            if (!buffer) return notifReply('Balas sebuah gambar dengan perintah ini.', 'Foto Grup')
            await conn.updateProfilePicture(m.chat, buffer)
            return notifReply('Foto profil grup diperbarui.', 'Foto Grup')
        }

        case 'groupstats': {
            const totalSize = meta.participants.length
            const adminRatio = ((admins.length / totalSize) * 100).toFixed(1)
            return notifReply([
                `Anggota     : ${totalSize}`,
                `Admin       : ${admins.length} (${adminRatio}%)`,
                `Member biasa: ${totalSize - admins.length}`,
                `Mode        : ${meta.announce ? 'Tertutup' : 'Terbuka'}`,
                `ID          : ${meta.id}`
            ].join('\n'), 'Statistik Grup')
        }

        default:
            return
    }
}

handler.command = ['groupinfo', 'listadmin', 'adminlist', 'listmember', 'anggota', 'tagall', 'hidetag',
    'linkgc', 'gclink', 'revoke', 'resetlink', 'promote', 'demote', 'kick', 'remove',
    'adduser', 'addmember', 'leave', 'keluar', 'groupname', 'setgcname', 'groupdesc', 'setdesc',
    'open', 'groupopen', 'close', 'groupclose', 'setppgc', 'groupicon', 'groupstats']
handler.category = 'Group'
handler.description = 'Manajemen grup (info, admin, tag, kick, setting)'

export default handler
