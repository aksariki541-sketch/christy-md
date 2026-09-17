// plugins/main/creator.js
// OWNER CARD — Meta AI style rich response (image + entity card)
// ESM Plugin - Nakano Miku MD

'use strict'

import { randomUUID } from 'crypto'

/* =========================================================
 * KONFIGURASI
 * ========================================================= */

const OWNER_IMAGE = 'https://cdn.nekohime.site/file/xwshoujw.jpeg'
const OWNER_AVATAR_FALLBACK = 'https://cdn.nekohime.site/file/q4uvkma3.jpeg'

/* =========================================================
 * HELPERS
 * ========================================================= */

function getOwner() {
  const [number, name] = Array.isArray(global.owner?.[0])
    ? global.owner[0]
    : [global.nomorown, global.nameown]

  return {
    number: String(number || global.nomorown || ''),
    name: String(name || global.nameown || 'Owner'),
    botName: String(global.namebot || 'Bot')
  }
}

async function getAvatar(conn, jid) {
  try {
    return await conn.profilePictureUrl(jid, 'image')
  } catch {
    return OWNER_AVATAR_FALLBACK
  }
}

function buildUnifiedResponse({ name, number, botName, avatar }) {
  const payload = {
    response_id: randomUUID(),
    sections: [
      {
        view_model: {
          primitive: {
            media: {
              url: OWNER_IMAGE,
              mime_type: 'image/png',
              width: 1080,
              height: 369
            },
            imagine_type: 'IMAGE',
            status: { status: 'READY' },
            __typename: 'GenAIImaginePrimitive'
          },
          __typename: 'GenAISingleLayoutViewModel'
        }
      },
      {
        view_model: {
          primitive: {
            __typename: 'GenAICompactEntityPrimitive',
            title: name,
            subtitle: 'Owner Bot',
            secondary_subtitle: `Developer of ${botName}`,
            entity_id: Number(number.slice(-15)) || 1,
            entity_url: `https://wa.me/${number}`,
            entity_type: 'PAGE',
            action_type: 'FOLLOW',
            is_verified: true,
            image: {
              url: avatar,
              url_fallback: OWNER_AVATAR_FALLBACK
            }
          },
          __typename: 'GenAISingleLayoutViewModel'
        }
      }
    ]
  }

  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

/* =========================================================
 * HANDLER
 * ========================================================= */

let handler = async (m, { conn }) => {
  const owner = getOwner()
  const avatar = await getAvatar(conn, `${owner.number}@s.whatsapp.net`)

  try {
    await conn.relayMessage(
      m.chat,
      {
        botForwardedMessage: {
          message: {
            richResponseMessage: {
              messageType: 1,
              submessages: [
                {
                  messageType: 1,
                  gridImageMetadata: {
                    imageUrls: [
                      {
                        imagePreviewUrl: OWNER_IMAGE,
                        imageHighResUrl: OWNER_IMAGE,
                        sourceUrl: OWNER_IMAGE
                      }
                    ]
                  }
                },
                {
                  messageType: 2,
                  messageText: `${owner.name} • Owner of ${owner.botName}`
                }
              ],
              unifiedResponse: {
                data: buildUnifiedResponse({ ...owner, avatar })
              },
              contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardOrigin: 4
              }
            }
          }
        }
      },
      {}
    )
  } catch (e) {
    console.error('[creator] relayMessage gagal, fallback ke vcard:', e)

    // Fallback: kirim kontak biasa jika rich response tidak didukung
    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      `FN:${owner.name}\n` +
      `ORG:${owner.botName};\n` +
      `TEL;type=CELL;type=VOICE;waid=${owner.number}:+${owner.number}\n` +
      'END:VCARD'

    await conn.sendMessage(
      m.chat,
      { contacts: { displayName: owner.name, contacts: [{ vcard }] } },
      { quoted: m }
    )
  }
}

handler.help = ['owner', 'infoowner', 'creator']
handler.tags = ['main']
handler.command = /^(owner|infoowner|creator)$/i

export default handler