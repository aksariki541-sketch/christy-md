import fs from 'fs'
import path from 'path'
import os from 'os'
import { downloadMedia, findMedia, formatBytes } from '../../lib/media.js'
import { toAudio, toVideo, FFMPEG } from '../../lib/converter.js'
import { SYMBOL } from '../../lib/ui.js'
import { spawn } from 'child_process'

// Konversi video/gambar → GIF memakai ffmpeg (palette dua tahap agar warnanya bagus)
function toGif(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const filter = 'fps=12,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse'
        spawn(FFMPEG, ['-y', '-i', inputPath, '-vf', filter, outputPath])
            .on('error', reject)
            .on('close', (code) => (code === 0 ? resolve(outputPath) : reject(new Error(`ffmpeg exit ${code}`))))
    })
}

let handler = async (m, { conn, args, command, notifReply }) => {
    const found = findMedia(m)
    if (!found) {
        return notifReply(
            'Kirim/bales video, audio, atau gambar dengan perintah ini.\n\nContoh:\n1. Kirim video\n2. Bales videonya dengan .toaudio',
            'Butuh Media'
        )
    }

    await notifReply('⏳ Sedang diproses, mohon tunggu...', 'Media')

    try {
        const { buffer, kind } = await downloadMedia(m)

        switch (command) {
            case 'toaudio':
            case 'tomp3': {
                const result = await toAudio(buffer, kind === 'video' ? 'mp4' : 'mp4')
                await conn.sendMessage(m.chat, {
                    audio: result,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: `audio-${Date.now()}.mp3`
                }, { quoted: m })
                return
            }

            case 'tovideo':
            case 'tomp4': {
                const result = await toVideo(buffer, 'mp4')
                await conn.sendMessage(m.chat, {
                    video: result,
                    mimetype: 'video/mp4',
                    caption: `${SYMBOL.mark} Dikonversi ke MP4 · ${formatBytes(result.length)}`
                }, { quoted: m })
                return
            }

            case 'tovoice':
            case 'todoc':
            case 'tofile': {
                const ext = {
                    image: 'jpg', video: 'mp4', audio: 'mp3', document: 'bin', sticker: 'webp'
                }[kind] || 'bin'
                await conn.sendMessage(m.chat, {
                    document: buffer,
                    mimetype: 'application/octet-stream',
                    fileName: `${command === 'tovoice' ? 'voice' : 'file'}-${Date.now()}.${ext}`,
                    caption: `${SYMBOL.mark} File ${ext.toUpperCase()} · ${formatBytes(buffer.length)}`
                }, { quoted: m })
                return
            }

            case 'togif': {
                const tmp = os.tmpdir()
                const input = path.join(tmp, `christy-in-${Date.now()}.${kind === 'video' ? 'mp4' : 'jpg'}`)
                const output = path.join(tmp, `christy-out-${Date.now()}.gif`)
                fs.writeFileSync(input, buffer)
                await toGif(input, output)
                const gif = await fs.promises.readFile(output)
                await conn.sendMessage(m.chat, {
                    video: gif,
                    mimetype: 'image/gif',
                    gifPlayback: true,
                    caption: `${SYMBOL.mark} GIF siap · ${formatBytes(gif.length)}`
                }, { quoted: m })
                fs.promises.unlink(input).catch(() => {})
                fs.promises.unlink(output).catch(() => {})
                return
            }

            case 'mediaframe': {
                if (kind !== 'video') return notifReply('Perintah ini butuh video.', 'Media Frame')
                const tmp = os.tmpdir()
                const input = path.join(tmp, `christy-vid-${Date.now()}.mp4`)
                const output = path.join(tmp, `christy-frame-${Date.now()}.jpg`)
                fs.writeFileSync(input, buffer)

                const at = args[0] || '00:00:01'
                await new Promise((resolve, reject) => {
                    spawn(FFMPEG, ['-y', '-ss', String(at), '-i', input, '-frames:v', '1', output])
                        .on('error', reject)
                        .on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))))
                })

                const frame = await fs.promises.readFile(output)
                await conn.sendMessage(m.chat, {
                    image: frame,
                    caption: `${SYMBOL.mark} Frame di detik ${at}`
                }, { quoted: m })
                fs.promises.unlink(input).catch(() => {})
                fs.promises.unlink(output).catch(() => {})
                return
            }

            case 'mediainfo': {
                const lines = [
                    `Tipe   : ${kind}`,
                    `Ukuran : ${formatBytes(buffer.length)}`
                ]
                if (found.node.mimetype) lines.push(`MIME   : ${found.node.mimetype}`)
                if (found.node.fileName || found.node.fileSha256) {
                    lines.push(`Nama   : ${found.node.fileName || '-'}`)
                }
                if (found.node.seconds) lines.push(`Durasi : ${found.node.seconds}s`)
                if (found.node.width) lines.push(`Dimensi: ${found.node.width}x${found.node.height}`)
                if (found.node.pages) lines.push(`Halaman: ${found.node.pages}`)
                return notifReply(lines.join('\n'), 'Info Media')
            }

            default:
                return
        }
    } catch (e) {
        await notifReply(`Gagal memproses media.\n${e.message}`, 'Error Media')
    }
}

handler.command = ['toaudio', 'tomp3', 'tovideo', 'tomp4', 'tovoice', 'todoc', 'tofile',
    'togif', 'mediaframe', 'mediainfo']
handler.category = 'Media'
handler.description = 'Konversi audio/video/GIF & info media (butuh ffmpeg)'

export default handler
