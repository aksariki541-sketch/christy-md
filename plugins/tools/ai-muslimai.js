// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/ai/ai-muslimai.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .muslim-ai

let handler = async (m, {
    conn,
    text
}) => {
    try {
        const res = await fetch(`https://api.ootaizumi.web.id/ai/muslim-ai?text=${text ? text : "assalamualaikum"}`);

        const response = await res.json();
        if (!response?.message) return m.reply("❌ Gomene gada response message!");

        m.reply(response?.message);
    } catch (e) {
        m.reply("❌ Gomene Error Mungkin lu kebanyakan request!");
    }
}

handler.command = ['muslim-ai']

export default handler;
handler.category = 'Tools'
handler.description = 'Ai-muslimai'

