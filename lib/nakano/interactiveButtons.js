// lib/nakano/interactiveButtons.js
// Shim untuk helper tombol interaktif gaya base lama (native flow WhatsApp).
// File asli tidak ikut di paket sumber, jadi dibuatkan ulang di sini dengan
// perilaku yang setara: kirim interactiveMessage lewat relayMessage.

import {
    generateWAMessageFromContent,
    proto
} from '../baileys.js'

// singleSelectButton(sections, title) — deskriptor tombol "pilih satu dari daftar"
export function singleSelectButton(sections = [], title = 'Pilih') {
    return {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({ title, sections })
    }
}

// quickButton(text, id) — deskriptor tombol balasan cepat
export function quickButton(displayText = 'OK', id = 'ok') {
    return {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text: displayText, id })
    }
}

// sendInteractiveButtons(conn, chat, { body, footer, header, buttons, quoted })
export async function sendInteractiveButtons(conn, chat,
    { body = '', footer = '', header = {}, buttons = [], quoted = null } = {}) {
    const list = Array.isArray(buttons) ? buttons : [buttons]
    const msg = {
        viewOnceMessage: {
            message: {
                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({ text: String(body) }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: String(footer) }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: header?.title || '',
                        subtitle: header?.subtitle || '',
                        hasMediaAttachment: false
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: list.filter(Boolean)
                    })
                })
            }
        }
    }
    return conn.relayMessage(chat, msg, {})
}

export default { singleSelectButton, quickButton, sendInteractiveButtons }
