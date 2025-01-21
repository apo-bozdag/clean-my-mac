import{c as h,a as r}from"../../chunks/ssr.js";import{w as d}from"../../chunks/index.js";import{e as n,p as c}from"../../chunks/stores.js";const g={purple:{from:"from-purple-900",to:"to-purple-800",accent:"bg-purple-600",glass:"bg-purple-950/30"},green:{from:"from-green-900",to:"to-green-800",accent:"bg-green-600",glass:"bg-green-950/30"},blue:{from:"from-blue-900",to:"to-blue-800",accent:"bg-blue-600",glass:"bg-blue-950/30"},orange:{from:"from-orange-900",to:"to-orange-800",accent:"bg-orange-600",glass:"bg-orange-950/30"}},A=d("purple"),m={code:"body{margin:0;padding:0;font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;-webkit-user-select:none;-moz-user-select:none;user-select:none;overflow:hidden}[data-tauri-drag-region].svelte-izpn4n{-webkit-app-region:drag}button.svelte-izpn4n{-webkit-app-region:no-drag}@keyframes svelte-izpn4n-drift{0%{transform:translate(0, 0) scale(1)}33%{transform:translate(2%, 2%) scale(1.02)}66%{transform:translate(-1%, 1%) scale(0.98)}100%{transform:translate(0, 0) scale(1)}}.animate-drift{animation:svelte-izpn4n-drift 20s ease-in-out infinite}",map:`{"version":3,"file":"+layout.svelte","sources":["+layout.svelte"],"sourcesContent":["<script lang=\\"ts\\">import \\"../app.css\\";\\nimport { currentTheme, themeConfigs } from \\"$lib/stores\\";\\nimport { browser } from \\"$app/environment\\";\\nimport { page } from \\"$app/stores\\";\\nimport { onMount } from \\"svelte\\";\\nlet appWindow;\\nif (browser) {\\n  import(\\"@tauri-apps/api/window\\").then((module) => {\\n    appWindow = module.appWindow;\\n  });\\n}\\nfunction changeTheme(theme2) {\\n  currentTheme.set(theme2);\\n}\\nasync function handleClose() {\\n  if (appWindow) {\\n    await appWindow.close();\\n  }\\n}\\nasync function handleMinimize() {\\n  if (appWindow) {\\n    await appWindow.minimize();\\n  }\\n}\\nasync function handleMaximize() {\\n  if (appWindow) {\\n    if (await appWindow.isMaximized()) {\\n      await appWindow.unmaximize();\\n    } else {\\n      await appWindow.maximize();\\n    }\\n  }\\n}\\n$: theme = themeConfigs[$currentTheme];\\n$: pageBackground = {\\n  \\"/\\": \\"from-purple-600 via-purple-900 to-purple-800\\",\\n  \\"/cleanup\\": \\"from-emerald-600 via-emerald-900 to-emerald-800\\",\\n  \\"/protection\\": \\"from-red-600 via-red-900 to-red-800\\",\\n  \\"/performance\\": \\"from-blue-600 via-blue-900 to-blue-800\\",\\n  \\"/applications\\": \\"from-orange-600 via-orange-900 to-orange-800\\",\\n  \\"/my-clutter\\": \\"from-pink-600 via-pink-900 to-pink-800\\",\\n  \\"/assistant\\": \\"from-indigo-600 via-indigo-900 to-indigo-800\\"\\n}[$page.url.pathname] || \\"from-gray-600 via-gray-900 to-gray-800\\";\\nlet contextMenu = {\\n  show: false,\\n  x: 0,\\n  y: 0\\n};\\nfunction handleContextMenu(event) {\\n  event.preventDefault();\\n  const menuWidth = 200;\\n  const menuHeight = 150;\\n  const padding = 10;\\n  let x = event.clientX;\\n  let y = event.clientY;\\n  if (x + menuWidth > window.innerWidth - padding) {\\n    x = window.innerWidth - menuWidth - padding;\\n  }\\n  if (y + menuHeight > window.innerHeight - padding) {\\n    y = window.innerHeight - menuHeight - padding;\\n  }\\n  if (x < padding) {\\n    x = padding;\\n  }\\n  if (y < padding) {\\n    y = padding;\\n  }\\n  contextMenu.show = true;\\n  contextMenu.x = x;\\n  contextMenu.y = y;\\n}\\nfunction hideContextMenu() {\\n  contextMenu.show = false;\\n}\\n<\/script>\\n\\n<svelte:window on:click={hideContextMenu} on:contextmenu={handleContextMenu} />\\n\\n<div class=\\"flex flex-col h-screen transition-all duration-500 overflow-hidden relative\\">\\n  <div class=\\"absolute inset-0 z-0\\">\\n    <div class=\\"absolute inset-0 bg-gradient-to-br {pageBackground} opacity-80\\"></div>\\n    <div class=\\"absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxmaWx0ZXIgaWQ9ImEiIHg9IjAlIiB5PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIuMDUiIG51bU9jdGF2ZXM9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giIHR5cGU9ImZyYWN0YWxOb2lzZSIvPjxmZUNvbG9yTWF0cml4IHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMC4xIDAiLz48L2ZpbHRlcj48L2RlZnM+PHJlY3QgZmlsdGVyPSJ1cmwoI2EpIiBoZWlnaHQ9IjEwMCUiIG9wYWNpdHk9IjEiIHdpZHRoPSIxMDAlIi8+PC9zdmc+')]\\"></div>\\n    <div class=\\"absolute inset-0 animate-pulse bg-gradient-to-br {pageBackground} opacity-30 blur-3xl\\"></div>\\n    <div class=\\"absolute inset-0 animate-drift bg-gradient-to-br {pageBackground} opacity-20 blur-2xl\\"></div>\\n  </div>\\n\\n  <!-- Header -->\\n  <div data-tauri-drag-region class=\\"h-8 flex items-center px-3 relative z-50\\">\\n    <div class=\\"flex items-center gap-2\\">\\n      <button \\n        on:click={handleClose}\\n        class=\\"w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors\\"\\n      ></button>\\n      <button \\n        on:click={handleMinimize}\\n        class=\\"w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors\\"\\n      ></button>\\n      <button \\n        on:click={handleMaximize}\\n        class=\\"w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors\\"\\n      ></button>\\n    </div>\\n    <h1 class=\\"absolute left-1/2 -translate-x-1/2 text-sm font-medium text-white/80\\">\\n      {#if $page.url.pathname === '/'}\\n        Smart Care\\n      {:else if $page.url.pathname === '/cleanup'}\\n        Cleanup\\n      {:else if $page.url.pathname === '/protection'}\\n        Protection\\n      {:else if $page.url.pathname === '/performance'}\\n        Performance\\n      {:else if $page.url.pathname === '/applications'}\\n        Applications\\n      {:else if $page.url.pathname === '/my-clutter'}\\n        My Clutter\\n      {:else if $page.url.pathname === '/assistant'}\\n        Assistant\\n      {:else}\\n        Clean My Mac\\n      {/if}\\n    </h1>\\n  </div>\\n\\n  <!-- Main Container -->\\n  <div class=\\"flex flex-1 overflow-hidden relative z-10\\">\\n    <!-- Sidebar -->\\n    <aside class=\\"w-[200px] flex flex-col relative z-50 bg-white/5\\">\\n      <!-- Navigation Items -->\\n      <nav class=\\"flex-1 flex flex-col py-6\\">\\n        <div class=\\"flex flex-col gap-2 px-3\\">\\n          <a \\n            href=\\"/\\"\\n            class=\\"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/' ? 'bg-white/10' : 'hover:bg-white/5'}\\"\\n          >\\n            <svg xmlns=\\"http://www.w3.org/2000/svg\\" class=\\"w-5 h-5 text-white\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\">\\n              <path d=\\"M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\\" />\\n            </svg>\\n            <span class=\\"text-sm text-white/80\\">Smart Care</span>\\n          </a>\\n\\n          <a \\n            href=\\"/cleanup\\"\\n            class=\\"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/cleanup' ? 'bg-white/10' : 'hover:bg-white/5'}\\"\\n          >\\n            <svg xmlns=\\"http://www.w3.org/2000/svg\\" class=\\"w-5 h-5 text-white\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\">\\n              <path d=\\"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\\" />\\n            </svg>\\n            <span class=\\"text-sm text-white/80\\">Cleanup</span>\\n          </a>\\n\\n          <a \\n            href=\\"/protection\\"\\n            class=\\"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/protection' ? 'bg-white/10' : 'hover:bg-white/5'}\\"\\n          >\\n            <svg xmlns=\\"http://www.w3.org/2000/svg\\" class=\\"w-5 h-5 text-white\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\">\\n              <path d=\\"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z\\" />\\n            </svg>\\n            <span class=\\"text-sm text-white/80\\">Protection</span>\\n          </a>\\n\\n          <a \\n            href=\\"/performance\\"\\n            class=\\"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/performance' ? 'bg-white/10' : 'hover:bg-white/5'}\\"\\n          >\\n            <svg xmlns=\\"http://www.w3.org/2000/svg\\" class=\\"w-5 h-5 text-white\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\">\\n              <path d=\\"M13 10V3L4 14h7v7l9-11h-7z\\" />\\n            </svg>\\n            <span class=\\"text-sm text-white/80\\">Performance</span>\\n          </a>\\n\\n          <a \\n            href=\\"/applications\\"\\n            class=\\"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/applications' ? 'bg-white/10' : 'hover:bg-white/5'}\\"\\n          >\\n            <svg xmlns=\\"http://www.w3.org/2000/svg\\" class=\\"w-5 h-5 text-white\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\">\\n              <path d=\\"M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4\\" />\\n            </svg>\\n            <span class=\\"text-sm text-white/80\\">Applications</span>\\n          </a>\\n\\n          <a \\n            href=\\"/my-clutter\\"\\n            class=\\"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/my-clutter' ? 'bg-white/10' : 'hover:bg-white/5'}\\"\\n          >\\n            <svg xmlns=\\"http://www.w3.org/2000/svg\\" class=\\"w-5 h-5 text-white\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\">\\n              <path d=\\"M4 6h16M4 10h16M4 14h16M4 18h16\\" />\\n            </svg>\\n            <span class=\\"text-sm text-white/80\\">My Clutter</span>\\n          </a>\\n        </div>\\n\\n        <div class=\\"mt-auto px-3\\">\\n          <a \\n            href=\\"/assistant\\"\\n            class=\\"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/assistant' ? 'bg-white/10' : 'hover:bg-white/5'}\\"\\n          >\\n            <svg xmlns=\\"http://www.w3.org/2000/svg\\" class=\\"w-5 h-5 text-white\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\">\\n              <path d=\\"M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z\\" />\\n            </svg>\\n            <span class=\\"text-sm text-white/80\\">Assistant</span>\\n          </a>\\n        </div>\\n      </nav>\\n    </aside>\\n\\n    <!-- Main Content -->\\n    <main class=\\"flex-1 overflow-hidden\\">\\n      <slot />\\n    </main>\\n  </div>\\n\\n  {#if contextMenu.show}\\n    <div \\n      class=\\"fixed z-[100] bg-black/90 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 py-1 min-w-[200px]\\"\\n      style=\\"left: {contextMenu.x}px; top: {contextMenu.y}px\\"\\n    >\\n      <button \\n        class=\\"w-full px-4 py-2 text-sm text-white/80 hover:bg-white/10 text-left flex items-center gap-3\\"\\n        on:click={() => {\\n          hideContextMenu();\\n          // Settings action\\n        }}\\n      >\\n        <svg xmlns=\\"http://www.w3.org/2000/svg\\" class=\\"w-4 h-4\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\">\\n          <path d=\\"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z\\" />\\n          <path d=\\"M15 12a3 3 0 11-6 0 3 3 0 016 0z\\" />\\n        </svg>\\n        Ayarlar\\n      </button>\\n\\n      <button \\n        class=\\"w-full px-4 py-2 text-sm text-white/80 hover:bg-white/10 text-left flex items-center gap-3\\"\\n        on:click={() => {\\n          hideContextMenu();\\n          // About action\\n        }}\\n      >\\n        <svg xmlns=\\"http://www.w3.org/2000/svg\\" class=\\"w-4 h-4\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\">\\n          <path d=\\"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z\\" />\\n        </svg>\\n        Hakkında\\n      </button>\\n\\n      <div class=\\"w-full h-[1px] bg-white/10 my-1\\"></div>\\n\\n      <button \\n        class=\\"w-full px-4 py-2 text-sm text-red-400 hover:bg-white/10 text-left flex items-center gap-3\\"\\n        on:click={() => {\\n          hideContextMenu();\\n          handleClose();\\n        }}\\n      >\\n        <svg xmlns=\\"http://www.w3.org/2000/svg\\" class=\\"w-4 h-4\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\">\\n          <path d=\\"M6 18L18 6M6 6l12 12\\" />\\n        </svg>\\n        Çıkış\\n      </button>\\n    </div>\\n  {/if}\\n</div>\\n\\n<style>\\n  :global(body) {\\n    margin: 0;\\n    padding: 0;\\n    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\\n    -webkit-user-select: none;\\n    -moz-user-select: none;\\n         user-select: none;\\n    overflow: hidden;\\n  }\\n\\n  [data-tauri-drag-region] {\\n    -webkit-app-region: drag;\\n  }\\n\\n  button {\\n    -webkit-app-region: no-drag;\\n  }\\n\\n  @keyframes drift {\\n    0% {\\n      transform: translate(0, 0) scale(1);\\n    }\\n    33% {\\n      transform: translate(2%, 2%) scale(1.02);\\n    }\\n    66% {\\n      transform: translate(-1%, 1%) scale(0.98);\\n    }\\n    100% {\\n      transform: translate(0, 0) scale(1);\\n    }\\n  }\\n\\n  :global(.animate-drift) {\\n    animation: drift 20s ease-in-out infinite;\\n  }\\n</style> "],"names":[],"mappings":"AAsQU,IAAM,CACZ,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,CAAC,CACV,WAAW,CAAE,SAAS,CAAC,CAAC,aAAa,CAAC,CAAC,kBAAkB,CAAC,CAAC,UAAU,CAAC,CAAC,MAAM,CAAC,CAAC,UAAU,CACzF,mBAAmB,CAAE,IAAI,CACzB,gBAAgB,CAAE,IAAI,CACjB,WAAW,CAAE,IAAI,CACtB,QAAQ,CAAE,MACZ,CAEA,CAAC,sBAAsB,eAAE,CACvB,kBAAkB,CAAE,IACtB,CAEA,oBAAO,CACL,kBAAkB,CAAE,OACtB,CAEA,WAAW,mBAAM,CACf,EAAG,CACD,SAAS,CAAE,UAAU,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CACpC,CACA,GAAI,CACF,SAAS,CAAE,UAAU,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,MAAM,IAAI,CACzC,CACA,GAAI,CACF,SAAS,CAAE,UAAU,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,MAAM,IAAI,CAC1C,CACA,IAAK,CACH,SAAS,CAAE,UAAU,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CACpC,CACF,CAEQ,cAAgB,CACtB,SAAS,CAAE,mBAAK,CAAC,GAAG,CAAC,WAAW,CAAC,QACnC"}`},f=h((p,w,u,s)=>{let t,e,i,l,o;return i=r(c,a=>e=a),o=r(A,a=>l=a),p.css.add(m),g[l],t={"/":"from-purple-600 via-purple-900 to-purple-800","/cleanup":"from-emerald-600 via-emerald-900 to-emerald-800","/protection":"from-red-600 via-red-900 to-red-800","/performance":"from-blue-600 via-blue-900 to-blue-800","/applications":"from-orange-600 via-orange-900 to-orange-800","/my-clutter":"from-pink-600 via-pink-900 to-pink-800","/assistant":"from-indigo-600 via-indigo-900 to-indigo-800"}[e.url.pathname]||"from-gray-600 via-gray-900 to-gray-800",i(),o(),` <div class="flex flex-col h-screen transition-all duration-500 overflow-hidden relative"><div class="absolute inset-0 z-0"><div class="${"absolute inset-0 bg-gradient-to-br "+n(t,!0)+" opacity-80"}"></div> <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxmaWx0ZXIgaWQ9ImEiIHg9IjAlIiB5PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIuMDUiIG51bU9jdGF2ZXM9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giIHR5cGU9ImZyYWN0YWxOb2lzZSIvPjxmZUNvbG9yTWF0cml4IHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMC4xIDAiLz48L2ZpbHRlcj48L2RlZnM+PHJlY3QgZmlsdGVyPSJ1cmwoI2EpIiBoZWlnaHQ9IjEwMCUiIG9wYWNpdHk9IjEiIHdpZHRoPSIxMDAlIi8+PC9zdmc+')]"></div> <div class="${"absolute inset-0 animate-pulse bg-gradient-to-br "+n(t,!0)+" opacity-30 blur-3xl"}"></div> <div class="${"absolute inset-0 animate-drift bg-gradient-to-br "+n(t,!0)+" opacity-20 blur-2xl"}"></div></div>  <div data-tauri-drag-region class="h-8 flex items-center px-3 relative z-50 svelte-izpn4n"><div class="flex items-center gap-2"><button class="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors svelte-izpn4n"></button> <button class="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors svelte-izpn4n"></button> <button class="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors svelte-izpn4n"></button></div> <h1 class="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-white/80">${e.url.pathname==="/"?"Smart Care":`${e.url.pathname==="/cleanup"?"Cleanup":`${e.url.pathname==="/protection"?"Protection":`${e.url.pathname==="/performance"?"Performance":`${e.url.pathname==="/applications"?"Applications":`${e.url.pathname==="/my-clutter"?"My Clutter":`${e.url.pathname==="/assistant"?"Assistant":"Clean My Mac"}`}`}`}`}`}`}</h1></div>  <div class="flex flex-1 overflow-hidden relative z-10"> <aside class="w-[200px] flex flex-col relative z-50 bg-white/5"> <nav class="flex-1 flex flex-col py-6"><div class="flex flex-col gap-2 px-3"><a href="/" class="${"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 "+n(e.url.pathname==="/"?"bg-white/10":"hover:bg-white/5",!0)}"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <span class="text-sm text-white/80" data-svelte-h="svelte-4d5yk5">Smart Care</span></a> <a href="/cleanup" class="${"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 "+n(e.url.pathname==="/cleanup"?"bg-white/10":"hover:bg-white/5",!0)}"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> <span class="text-sm text-white/80" data-svelte-h="svelte-1shb8o3">Cleanup</span></a> <a href="/protection" class="${"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 "+n(e.url.pathname==="/protection"?"bg-white/10":"hover:bg-white/5",!0)}"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> <span class="text-sm text-white/80" data-svelte-h="svelte-1ny0vyw">Protection</span></a> <a href="/performance" class="${"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 "+n(e.url.pathname==="/performance"?"bg-white/10":"hover:bg-white/5",!0)}"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> <span class="text-sm text-white/80" data-svelte-h="svelte-1pqzm0d">Performance</span></a> <a href="/applications" class="${"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 "+n(e.url.pathname==="/applications"?"bg-white/10":"hover:bg-white/5",!0)}"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg> <span class="text-sm text-white/80" data-svelte-h="svelte-13i0i9s">Applications</span></a> <a href="/my-clutter" class="${"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 "+n(e.url.pathname==="/my-clutter"?"bg-white/10":"hover:bg-white/5",!0)}"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg> <span class="text-sm text-white/80" data-svelte-h="svelte-n5coug">My Clutter</span></a></div> <div class="mt-auto px-3"><a href="/assistant" class="${"flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 "+n(e.url.pathname==="/assistant"?"bg-white/10":"hover:bg-white/5",!0)}"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg> <span class="text-sm text-white/80" data-svelte-h="svelte-91swtz">Assistant</span></a></div></nav></aside>  <main class="flex-1 overflow-hidden">${s.default?s.default({}):""}</main></div>  </div>`});export{f as default};
