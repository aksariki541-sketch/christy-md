import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'
import { brand, card, header, SYMBOL } from '../../lib/ui.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const thumbPath = path.join(__dirname, '../../media/thumb.jpg')

let handler = async (m, { conn }) => {
    const identity = brand()
    const pushname = m.pushName || 'No Name'

    const rules = [
        '⬡ dilarang keras menghapus credits, minimal taro di tqto',
        '⬡ dilarang memperjual belikan base ini karena 100% free',
        '⬡ boleh di jual dengan syarat sudah di tambah fitur',
        '⬡ dilarang mengklaim script ini 100%'
    ].join('\n')

    const body = [
        `*halo ${pushname}* — apakah kamu ingin base script ini?`,
        '',
        header(),
        '',
        card('Aturan pemakaian', rules),
        '',
        card('Credit', `Dikelola dan dikembangkan oleh *${identity.owner}*`)
    ].join('\n')

    try {
        const thumb = await sharp(thumbPath).resize(300, 300).jpeg({ quality: 80 }).toBuffer()

        const media = await prepareWAMessageMedia(
            { image: thumb, mimetype: 'image/jpeg' },
            { upload: conn.waUploadToServer }
        )

        const interactiveMsg = {
            body: { text: body },
            footer: {
                text: `${SYMBOL.mark} ${identity.name} · Created by ${identity.owner}`,
                hasMediaAttachment: false
            },
            header: {
                hasMediaAttachment: true,
                imageMessage: media.imageMessage
            },
            nativeFlowMessage: {
                // TODO: ganti tombol di bawah menjadi cta_url dengan `url` repository milikmu
                // setelah repo-nya dibuat. Selama belum ada, tombol ini hanya menyalin aturan
                // pemakaian (tidak memakai link milik pihak lain).
                buttons: [
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: `⌁ copy rules`,
                            id: 'copy_rules',
                            copy_code: rules
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '❖ Menu',
                            id: 'menu'
                        })
                    }
                ],
                messageParamsJson: '{}'
            }
        }

        const generatedMsg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: interactiveMsg
                }
            }
        }, { userJid: m.chat, upload: conn.waUploadToServer })

        await conn.relayMessage(m.chat, generatedMsg.message, { messageId: generatedMsg.key.id })
    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { text: `❌ Gagal kirim pesan: ${e.message}` }, { quoted: m })
    }
}

handler.command = ['sc', 'script', 'getsc']
handler.category = 'Main'
handler.description = 'Info script & aturan pemakaian'

export default handler
