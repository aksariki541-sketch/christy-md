import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Cari binary ffmpeg: pakai yang ada di PATH, kalau tidak ada pakai binary
// bawaan dependency @ffmpeg-installer/ffmpeg (tersedia lintas platform).
function resolveFfmpeg() {
    const fromEnv = process.env.FFMPEG_PATH
    if (fromEnv && fs.existsSync(fromEnv)) return fromEnv

    const candidates = ['/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/opt/homebrew/bin/ffmpeg', 'ffmpeg']
    for (const candidate of candidates) {
        if (candidate === 'ffmpeg') continue
        if (fs.existsSync(candidate)) return candidate
    }

    try {
        const installed = require('@ffmpeg-installer/ffmpeg')
        if (installed?.path && fs.existsSync(installed.path)) return installed.path
    } catch {
        // dependency tidak tersedia, fallback ke PATH
    }

    return 'ffmpeg'
}

const FFMPEG = resolveFfmpeg()

export function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
    return new Promise(async (resolve, reject) => {
        try {
            const tmpDir = path.join(__dirname, '../tmp')
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
            const tmp = path.join(tmpDir, `${Date.now()}.${ext}`)
            const out = `${tmp}.${ext2}`
            await fs.promises.writeFile(tmp, buffer)
            spawn(FFMPEG, ['-y', '-i', tmp, ...args, out])
                .on('error', reject)
                .on('close', async (code) => {
                    try {
                        await fs.promises.unlink(tmp)
                        if (code !== 0) return reject(code)
                        const data = await fs.promises.readFile(out)
                        await fs.promises.unlink(out)
                        resolve(data)
                    } catch (e) {
                        reject(e)
                    }
                })
        } catch (e) {
            reject(e)
        }
    })
}

export function toAudio(buffer, ext) {
    return ffmpeg(buffer, ['-vn', '-ac', '2', '-b:a', '128k', '-ar', '44100', '-f', 'mp3'], ext, 'mp3')
}

export function toPTT(buffer, ext) {
    return ffmpeg(buffer, ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on', '-compression_level', '10'], ext, 'opus')
}

export function toVideo(buffer, ext) {
    return ffmpeg(buffer, ['-c:v', 'libx264', '-c:a', 'aac', '-ab', '128k', '-ar', '44100', '-crf', '32', '-preset', 'slow'], ext, 'mp4')
}

export { FFMPEG }
