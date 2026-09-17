const handler = async (m, { text, participants, groupMetadata, command, conn }) => {
	const target =
		m.quoted
			? m.quoted.sender
			: m.mentionedJid && m.mentionedJid[0]
				? m.mentionedJid[0]
				: text
					? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
					: null;

	const cmd = ['add', 'kick', 'promote', 'demote'];

	if (cmd.includes(command) && !target) {
		throw 'Reply/tag siapa yang ingin di proses.';
	}

	const inGc = participants.some(
		(v) =>
			v.jid == target ||
			v.id === target ||
			v.phoneNumber === target
	);

	switch (command) {
		case 'add': {
			if (inGc) {
				throw 'User sudah ada didalam grup!';
			}

			const response = await conn.groupParticipantsUpdate(
				m.chat,
				[target],
				'add'
			);

			/*
			 * Ambil foto profil grup secara aman.
			 *
			 * profilePictureUrl() bisa mengalami timeout
			 * dari server WhatsApp. Karena thumbnail hanya
			 * tambahan untuk invite, kegagalan mengambil foto
			 * tidak boleh membuat proses add gagal.
			 */
			let jpegThumbnail = null;

			try {
				jpegThumbnail = await conn.profilePictureUrl(
					m.chat,
					'image'
				);
			} catch (e) {
				console.log(
					'[GROUP ADD] Profile picture timeout:',
					e?.message || e
				);
			}

			for (const participant of response) {
				const jid =
					participant?.content?.attrs?.phone_number ||
					participant?.content?.attrs?.jid ||
					target;

				const status = participant.status;

				/*
				 * 408 = user tidak bisa langsung ditambahkan
				 */
				if (status === '408') {
					await m.reply(
						`Tidak dapat menambahkan @${jid.split('@')[0]}!\n` +
						`Mungkin @${jid.split('@')[0]} baru keluar dari grup ini atau dikick`,
						null,
						{
							mentions: [jid]
						}
					);

					continue;
				}

				/*
				 * 403 = WhatsApp memberikan invite
				 */
				if (status === '403') {
					const content = participant?.content?.content;

					if (!content?.[0]?.attrs) {
						await m.reply(
							`Gagal mengundang @${jid.split('@')[0]} karena data invite tidak tersedia.`,
							null,
							{
								mentions: [jid]
							}
						);

						continue;
					}

					const inviteCode = content[0].attrs.code;
					const inviteExp = content[0].attrs.expiration;

					await m.reply(
						`Mengundang @${jid.split('@')[0]} menggunakan invite...`,
						null,
						{
							mentions: [jid]
						}
					);

					try {
						await conn.sendGroupV4Invite(
							m.chat,
							jid,
							inviteCode,
							inviteExp,
							groupMetadata.subject,
							'Undangan untuk bergabung ke grup WhatsApp saya',
							jpegThumbnail || undefined
						);
					} catch (e) {
						console.log(
							'[GROUP INVITE]',
							e?.message || e
						);

						await m.reply(
							`Gagal mengirim undangan ke @${jid.split('@')[0]}.`,
							null,
							{
								mentions: [jid]
							}
						);
					}

					continue;
				}
			}

			break;
		}

		case 'kick': {
			if (!inGc) {
				throw 'User tidak ada dalam grup.';
			}

			await conn.groupParticipantsUpdate(
				m.chat,
				[target],
				'remove'
			);

			await m.reply(
				`Berhasil kick: @${target.split('@')[0]}`,
				null,
				{
					mentions: [target]
				}
			);

			break;
		}

		case 'promote': {
			if (!inGc) {
				throw 'User tidak berada dalam grup!';
			}

			await conn.groupParticipantsUpdate(
				m.chat,
				[target],
				'promote'
			);

			await m.reply(
				`Promote: @${target.split('@')[0]}`,
				null,
				{
					mentions: [target]
				}
			);

			break;
		}

		case 'demote': {
			if (!inGc) {
				throw 'User tidak berada dalam grup!';
			}

			await conn.groupParticipantsUpdate(
				m.chat,
				[target],
				'demote'
			);

			await m.reply(
				`Demote: @${target.split('@')[0]}`,
				null,
				{
					mentions: [target]
				}
			);

			break;
		}

		case 'closegc':
		case 'mute': {
			await conn.groupSettingUpdate(
				m.chat,
				'announcement'
			);

			await m.reply(
				'Grup berhasil ditutup (hanya admin yang bisa chat).'
			);

			break;
		}

		case 'opengc':
		case 'unmute': {
			await conn.groupSettingUpdate(
				m.chat,
				'not_announcement'
			);

			await m.reply(
				'Grup berhasil dibuka (semua member bisa chat).'
			);

			break;
		}

		default: {
			return m.reply('Perintah tidak dikenal.');
		}
	}
};

handler.help = [
	'add',
	'kick',
	'promote',
	'demote',
	'opengc',
	'closegc'
];

handler.tags = ['group'];

handler.command =
	/^(add|kick|promote|demote|mute|unmute|opengc|closegc)$/i;

handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;