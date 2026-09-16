// Plugin adaptasi dari paket plugin Nakano-Miku-MD (GPL-3.0) yang dikirim pengguna.
// Asal       : plugins/fun/tool-morse.js (paket plugin Drive)
// Penyesuaian: handler.command jadi array, properti handler.* yang tidak didukung dibuang,
//              kategori/deskripsi ditambahkan, branding base lama dibersihkan.
// Command    : .demorse

/*
Jangan Hapus Wm Bang 

*Morse,Demorse Kode Plugins Esm*

Mungkin Anak Pramuka Butuh Entahlah 

*[Sumber]*
https://

*[Original Source]*

https:///121
*/

const morseDict = {
 'a': '•–', 'b': '–•••', 'c': '–•–•', 'd': '–••', 'e': '•',
 'f': '••–•', 'g': '––•', 'h': '••••', 'i': '••', 'j': '•–––',
 'k': '–•–', 'l': '•–••', 'm': '––', 'n': '–•', 'o': '–––',
 'p': '•––•', 'q': '––•–', 'r': '•–•', 's': '•••', 't': '–',
 'u': '••–', 'v': '•••–', 'w': '•––', 'x': '–••–', 'y': '–•––',
 'z': '––••', '1': '•––––', '2': '••–––', '3': '•••––', '4': '••••–',
 '5': '•••••', '6': '–••••', '7': '––•••', '8': '–––••', '9': '––––•',
 '0': '–––––', ' ': '/'
};

const reverseMorseDict = Object.fromEntries(
 Object.entries(morseDict).map(([key, value]) => [value, key])
);

const textToMorse = (text) => {
 return text.toLowerCase().split('').map(char => {
 return morseDict[char] || char;
 }).join(' ');
};

const morseToText = (morse) => {
 return morse.split(/\/|\s/).map(word => {
 return word.split(' ').map(char => reverseMorseDict[char] || char).join('');
 }).join(' ');
};

let handler = async (m, { text, command, usedPrefix }) => {
 const isEncode = command === 'morse';
 const inputText = text || (m.quoted && m.quoted.text) || '';
 
 if (!inputText) {
 const example = isEncode ? 'hello world' : '•– / –••• / –•–• / –•• / •';
 return m.reply(`Masukkan ${isEncode ? 'teks' : 'kode morse'}!\n\nContoh:\n${usedPrefix}${command} ${example}`);
 }

 try {
 const result = isEncode ? textToMorse(inputText) : morseToText(inputText);
 m.reply(result);
 } catch (e) {
 m.reply('Terjadi kesalahan dalam konversi');
 }
};

handler.command = ['demorse'];
handler.category = 'Fun'
handler.description = 'Morse'

export default handler;