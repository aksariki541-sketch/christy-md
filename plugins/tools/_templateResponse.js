// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/anu/_templateResponse.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : (listener/customPrefix)
// Catatan    : listener murni -> handler.onMessage

import { proto, generateWAMessage, areJidsSameUser } from '../../lib/baileys.js';

async function all(m, chatUpdate) {
	if (m.isBaileys) return;
	if (!m.message) return;

	let id = '';

	try {
		const msg = m.message;

		if (msg.buttonsResponseMessage) {
			id = msg.buttonsResponseMessage.selectedButtonId;

		} else if (msg.listResponseMessage) {
			id = msg.listResponseMessage.singleSelectReply?.selectedRowId;

		} else if (msg.templateButtonReplyMessage) {
			id = msg.templateButtonReplyMessage.selectedId;

		} else if (msg.interactiveResponseMessage) {
			const data = msg.interactiveResponseMessage?.nativeFlowResponseMessage
				?? m.msg?.nativeFlowResponseMessage;

			if (data?.paramsJson) {
				try {
					const parsed = JSON.parse(data.paramsJson);
					id = parsed.id || parsed.rowId || '';
				} catch {
					id = data?.id || '';
				}
			} else {
				id = data?.id || '';
			}

		} else if (msg.pollUpdateMessage) {
			// poll update, skip atau handle sendiri kalau perlu
			return;

		} else {
			// bukan interactive message, skip
			return;
		}

	} catch (e) {
		console.log('Error parsing interactive:', e);
	}

	if (!id) return;

	let messages = await generateWAMessage(
		m.chat,
		{ text: id, mentions: m.mentionedJid },
		{
			userJid: this.user.jid,
			quoted: m.quoted && m.quoted.fakeObj,
		}
	);

	messages.key.remoteJid = m.chat;
	messages.key.fromMe = areJidsSameUser(m.sender, this.user.id);
	messages.key.id = m.key.id;
	messages.pushName = m.pushName;

	if (m.isGroup) {
		messages.key.participant = messages.participant = m.sender;
	}

	const upsertMsg = {
		...chatUpdate,
		messages: [proto.WebMessageInfo.create(messages)].map((v) => {
			v.conn = this;
			return v;
		}),
		type: 'append',
	};

	this.ev.emit('messages.upsert', upsertMsg);
}

// Dibungkus jadi plugin Christy MD: hook asli "handler.all" (dipanggil untuk
// setiap pesan di base lama) dipetakan ke hook "handler.onMessage".
const handler = async (m, ctx) => all(m, {
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
handler.description = 'TemplateResponse'

