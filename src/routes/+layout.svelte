<script lang="ts">
  import '../app.css';
  import { currentTheme, themeConfigs, type Theme } from '$lib/stores';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  let appWindow: any;

  if (browser) {
    import('@tauri-apps/api/window').then(module => {
      appWindow = module.appWindow;
    });
  }

  function changeTheme(theme: Theme) {
    currentTheme.set(theme);
  }

  async function handleClose() {
    if (appWindow) {
      await appWindow.close();
    }
  }

  async function handleMinimize() {
    if (appWindow) {
      await appWindow.minimize();
    }
  }

  async function handleMaximize() {
    if (appWindow) {
      if (await appWindow.isMaximized()) {
        await appWindow.unmaximize();
      } else {
        await appWindow.maximize();
      }
    }
  }

  $: theme = themeConfigs[$currentTheme];

  $: pageBackground = {
    '/': 'from-purple-600 via-purple-900 to-purple-800',
    '/cleanup': 'from-emerald-600 via-emerald-900 to-emerald-800',
    '/protection': 'from-red-600 via-red-900 to-red-800',
    '/performance': 'from-blue-600 via-blue-900 to-blue-800',
    '/applications': 'from-orange-600 via-orange-900 to-orange-800',
    '/my-clutter': 'from-pink-600 via-pink-900 to-pink-800',
    '/assistant': 'from-indigo-600 via-indigo-900 to-indigo-800'
  }[$page.url.pathname] || 'from-gray-600 via-gray-900 to-gray-800';

  let contextMenu = {
    show: false,
    x: 0,
    y: 0
  };

  function handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    
    const menuWidth = 200; // min-w-[200px] değeri
    const menuHeight = 150; // yaklaşık menü yüksekliği
    const padding = 10; // kenarlardan uzaklık
    
    let x = event.clientX;
    let y = event.clientY;
    
    // Sağ kenar kontrolü
    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }
    
    // Alt kenar kontrolü
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }
    
    // Sol kenar kontrolü
    if (x < padding) {
      x = padding;
    }
    
    // Üst kenar kontrolü
    if (y < padding) {
      y = padding;
    }

    contextMenu.show = true;
    contextMenu.x = x;
    contextMenu.y = y;
  }

  function hideContextMenu() {
    contextMenu.show = false;
  }
</script>

<svelte:window on:click={hideContextMenu} on:contextmenu={handleContextMenu} />

<div class="flex flex-col h-screen transition-all duration-500 overflow-hidden relative">
  <div class="absolute inset-0 z-0">
    <div class="absolute inset-0 bg-gradient-to-br {pageBackground} opacity-80"></div>
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxmaWx0ZXIgaWQ9ImEiIHg9IjAlIiB5PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIuMDUiIG51bU9jdGF2ZXM9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giIHR5cGU9ImZyYWN0YWxOb2lzZSIvPjxmZUNvbG9yTWF0cml4IHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMC4xIDAiLz48L2ZpbHRlcj48L2RlZnM+PHJlY3QgZmlsdGVyPSJ1cmwoI2EpIiBoZWlnaHQ9IjEwMCUiIG9wYWNpdHk9IjEiIHdpZHRoPSIxMDAlIi8+PC9zdmc+')]"></div>
    <div class="absolute inset-0 animate-pulse bg-gradient-to-br {pageBackground} opacity-30 blur-3xl"></div>
    <div class="absolute inset-0 animate-drift bg-gradient-to-br {pageBackground} opacity-20 blur-2xl"></div>
  </div>

  <!-- Header -->
  <div data-tauri-drag-region class="h-8 flex items-center px-3 relative z-50">
    <div class="flex items-center gap-2">
      <button 
        on:click={handleClose}
        class="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
      ></button>
      <button 
        on:click={handleMinimize}
        class="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
      ></button>
      <button 
        on:click={handleMaximize}
        class="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
      ></button>
    </div>
    <h1 class="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-white/80">
      {#if $page.url.pathname === '/'}
        Smart Care
      {:else if $page.url.pathname === '/cleanup'}
        Cleanup
      {:else if $page.url.pathname === '/protection'}
        Protection
      {:else if $page.url.pathname === '/performance'}
        Performance
      {:else if $page.url.pathname === '/applications'}
        Applications
      {:else if $page.url.pathname === '/my-clutter'}
        My Clutter
      {:else if $page.url.pathname === '/assistant'}
        Assistant
      {:else}
        Clean My Mac
      {/if}
    </h1>
  </div>

  <!-- Main Container -->
  <div class="flex flex-1 overflow-hidden relative z-10">
    <!-- Sidebar -->
    <aside class="w-[200px] flex flex-col relative z-50 bg-white/5">
      <!-- Navigation Items -->
      <nav class="flex-1 flex flex-col py-6">
        <div class="flex flex-col gap-2 px-3">
          <a 
            href="/"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/' ? 'bg-white/10' : 'hover:bg-white/5'}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-sm text-white/80">Smart Care</span>
          </a>

          <a 
            href="/cleanup"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/cleanup' ? 'bg-white/10' : 'hover:bg-white/5'}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span class="text-sm text-white/80">Cleanup</span>
          </a>

          <a 
            href="/protection"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/protection' ? 'bg-white/10' : 'hover:bg-white/5'}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span class="text-sm text-white/80">Protection</span>
          </a>

          <a 
            href="/performance"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/performance' ? 'bg-white/10' : 'hover:bg-white/5'}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="text-sm text-white/80">Performance</span>
          </a>

          <a 
            href="/applications"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/applications' ? 'bg-white/10' : 'hover:bg-white/5'}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span class="text-sm text-white/80">Applications</span>
          </a>

          <a 
            href="/my-clutter"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/my-clutter' ? 'bg-white/10' : 'hover:bg-white/5'}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span class="text-sm text-white/80">My Clutter</span>
          </a>
        </div>

        <div class="mt-auto px-3">
          <a 
            href="/assistant"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 {$page.url.pathname === '/assistant' ? 'bg-white/10' : 'hover:bg-white/5'}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span class="text-sm text-white/80">Assistant</span>
          </a>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden">
      <slot />
    </main>
  </div>

  {#if contextMenu.show}
    <div 
      class="fixed z-[100] bg-black/90 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 py-1 min-w-[200px]"
      style="left: {contextMenu.x}px; top: {contextMenu.y}px"
    >
      <button 
        class="w-full px-4 py-2 text-sm text-white/80 hover:bg-white/10 text-left flex items-center gap-3"
        on:click={() => {
          hideContextMenu();
          // Settings action
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Ayarlar
      </button>

      <button 
        class="w-full px-4 py-2 text-sm text-white/80 hover:bg-white/10 text-left flex items-center gap-3"
        on:click={() => {
          hideContextMenu();
          // About action
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Hakkında
      </button>

      <div class="w-full h-[1px] bg-white/10 my-1"></div>

      <button 
        class="w-full px-4 py-2 text-sm text-red-400 hover:bg-white/10 text-left flex items-center gap-3"
        on:click={() => {
          hideContextMenu();
          handleClose();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
        Çıkış
      </button>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-user-select: none;
    user-select: none;
    overflow: hidden;
  }

  [data-tauri-drag-region] {
    -webkit-app-region: drag;
  }

  button {
    -webkit-app-region: no-drag;
  }

  @keyframes drift {
    0% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(2%, 2%) scale(1.02);
    }
    66% {
      transform: translate(-1%, 1%) scale(0.98);
    }
    100% {
      transform: translate(0, 0) scale(1);
    }
  }

  :global(.animate-drift) {
    animation: drift 20s ease-in-out infinite;
  }
</style> 