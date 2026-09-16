// lib/nakano/config.js
// Pengganti side-effect config.js base lama (dipakai plugin panel).
// Kredensial panel diambil dari environment variable agar tidak tertanam
// di dalam kode: set PANEL_DOMAIN, PANEL_APIKEY (plta), PANEL_CAPIKEY (pltc),
// PANEL_EGG, PANEL_LOCATION, PANEL_NAMA, PANEL_SERVERIP di file .env Anda.

global.domain ??= process.env.PANEL_DOMAIN || '-'
global.apikey ??= process.env.PANEL_APIKEY || '-'
global.capikey ??= process.env.PANEL_CAPIKEY || '-'
global.eggsnya ??= process.env.PANEL_EGG || '-'
global.location ??= process.env.PANEL_LOCATION || '1'
global.namaPanel ??= process.env.PANEL_NAMA || 'Panel'
global.serverip ??= process.env.PANEL_SERVERIP || '-'
global.panelkey ??= process.env.PANEL_APIKEY || global.apikey

export default {}
