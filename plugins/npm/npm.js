import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { brand, card, header, SYMBOL } from '../../lib/ui.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'))

const deps = pkg.dependencies || {}
const coreDeps = ['@whiskeysockets/baileys', '@hapi/boom', 'pino', 'jimp', 'sharp', 'fflate']
    .filter(name => deps[name])

const copyOf = name => `"${name}": "${deps[name]}"`
const snippet = coreDeps.map(copyOf).join(',\n    ')

let handler = async (m, { conn }) => {
    const identity = brand()
    const pushname = m.pushName || 'No Name'

    const body = [
        `*haloo ${pushname}* — ini stack library yang dipakai *${identity.name}*`,
        '',
        header(),
        '',
        card('Baileys', copyOf('@whiskeysockets/baileys')),
        '',
        card('Contoh package.json', [
            `"@whiskeysockets/baileys": "${deps['@whiskeysockets/baileys'] || ''}",`,
            '',
            '{',
            '  "dependencies": {',
            ...snippet.split('\n').map(l => `    ${l.trim()}`),
            '  }',
            '}'
        ].join('\n')),
        '',
        card('Highlight', [
            '⬡ Support AiRich',
            '⬡ Support HTML',
            '⬡ Support table A2UI',
            '⬡ Tidak logout pengirim',
            '⬡ Update proto terbaru',
            '⬡ Support semua tipe button',
            '⬡ Support custom pairing',
            '⬡ Support script CJS & ESM'
        ].join('\n')),
        '',
        `📦 Lengkapnya ada di ${'`package.json`'} project ini`
    ].join('\n')

    try {
        const interactiveMsg = {
            body: { text: body },
            footer: {
                text: `${SYMBOL.mark} ${identity.name} · Created by ${identity.owner}`,
                hasMediaAttachment: false
            },
            header: { hasMediaAttachment: false },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: `⌁ copy baileys`,
                            id: 'copy_baileys',
                            copy_code: copyOf('@whiskeysockets/baileys')
                        })
                    },
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: '⌁ copy dependencies',
                            id: 'copy_dependencies',
                            copy_code: snippet
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '▰ Statistik',
                            id: 'stats'
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
    }
}

handler.customPrefix = /\b(bail|baileys|npm|bails)\b/i
handler.category = 'System'
handler.description = 'Info dependency Baileys'
handler.hidden = true

export default handler
