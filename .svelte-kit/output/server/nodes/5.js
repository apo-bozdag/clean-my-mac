

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/cleanup/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.Bq6Qwi_5.js","_app/immutable/chunks/s0MuPmz5.js","_app/immutable/chunks/nUB58RNh.js","_app/immutable/chunks/CAslKUfh.js"];
export const stylesheets = [];
export const fonts = [];
