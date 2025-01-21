

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/applications/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.DqiNn2p0.js","_app/immutable/chunks/s0MuPmz5.js","_app/immutable/chunks/nUB58RNh.js","_app/immutable/chunks/CAslKUfh.js"];
export const stylesheets = [];
export const fonts = [];
