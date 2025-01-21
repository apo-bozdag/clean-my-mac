<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut, cubicOut } from 'svelte/easing';
  import { invoke } from '@tauri-apps/api/tauri';
  import { slide } from 'svelte/transition';

  let isScanning = false;
  let currentStep = 0;
  let scanComplete = false;
  let junkStats: any = null;
  let selectedCategory: any = null;
  let showReviewModal = false;
  let stepCompleted = [false];
  let isAnalyzing = false;
  let isCleanupScanning = false;
  let isProtectionScanning = false;
  let isPerformanceScanning = false;
  let isApplicationsScanning = false;
  let isClutterScanning = false;
  let showDeleteConfirmModal = false;
  let fileToDelete: { path: string; name: string } | null = null;
  let categoryToUpdate: any = null;
  let isDeleting = false;
  let deleteError: string | null = null;
  let deleteSuccess = false;
  let selectedFiles: Set<string> = new Set();
  
  // Boyut formatlamak için yardımcı fonksiyon
  function formatSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Dosya yolunu kısaltmak için yardımcı fonksiyon
  function truncatePath(path: string, maxLength: number = 60): string {
    if (path.length <= maxLength) return path;
    
    const fileName = path.split('/').pop() || path;
    const directory = path.slice(0, path.lastIndexOf('/'));
    
    if (fileName.length > maxLength / 2) {
        return `.../${fileName.slice(0, maxLength / 2)}...${fileName.slice(-maxLength / 4)}`;
    }
    
    const half = Math.floor((maxLength - fileName.length - 5) / 2);
    return `${directory.slice(0, half)}.../${fileName}`;
  }

  const steps = [
    { 
      id: 'cleanup', 
      title: 'System Cleanup', 
      description: '...',
      subtext: 'scanning...',
      icon: '🧹',
      color: 'from-emerald-400 to-emerald-600/50',
      categories: [
        {
          name: 'Cache Files',
          description: 'System and application cache files',
          icon: '📦'
        },
        {
          name: 'Trash Files',
          description: 'Files in your trash bin',
          icon: '🗑️'
        },
        {
          name: 'Old Downloads',
          description: 'Downloads older than 7 days',
          icon: '⬇️'
        },
        {
          name: 'User Cache Files',
          description: 'Application specific user cache files',
          icon: '👤'
        },
        {
          name: 'System Cache Files',
          description: 'System level cache files',
          icon: '⚙️'
        },
        {
          name: 'Xcode Junk',
          description: 'Unused Xcode files and caches',
          icon: '🛠️'
        },
        {
          name: 'Mail Downloads',
          description: 'Temporary mail attachments and caches',
          icon: '📧'
        },
        {
          name: 'Macintosh HD',
          description: 'System storage cleanup',
          icon: '💾'
        },
        {
          name: 'Broken Login Items',
          description: 'Broken or outdated login items',
          icon: '🔑'
        },
        {
          name: 'Broken Preferences',
          description: 'Corrupted or invalid preference files',
          icon: '⚙️'
        },
        {
          name: 'User Log Files',
          description: 'Application and system logs in user directory',
          icon: '📝'
        },
        {
          name: 'System Log Files',
          description: 'System-wide log files',
          icon: '📄'
        }
      ]
    },
    {
      id: 'protection',
      title: 'Protection',
      description: '...',
      subtext: 'scanning...',
      icon: '🛡️',
      color: 'from-red-400 to-red-600/50',
      categories: [
        {
          name: 'Generic.Trojan',
          description: 'Common trojan threats and malware',
          icon: '🦠'
        },
        {
          name: 'OSX.WildPressure',
          description: 'MacOS specific malware variant',
          icon: '⚠️'
        },
        {
          name: 'HiddenCode',
          description: 'Concealed malicious code detection',
          icon: '🔍'
        },
        {
          name: 'AdLoad',
          description: 'Adware and unwanted software',
          icon: '🚫'
        }
      ]
    },
    {
      id: 'performance',
      title: 'Performance',
      description: '...',
      subtext: 'scanning...',
      icon: '⚡',
      color: 'from-blue-400 to-blue-600/50',
      categories: [
        {
          name: 'Background Items',
          description: 'Apps and services running in the background',
          icon: '🔄'
        },
        {
          name: 'Login Items',
          description: 'Apps that start automatically at login',
          icon: '🔑'
        }
      ]
    },
    {
      id: 'applications',
      title: 'Applications',
      description: '...',
      subtext: 'scanning...',
      icon: '📱',
      color: 'from-orange-400 to-orange-600/50',
      categories: [
        {
          name: 'Updates Available',
          description: 'Applications that need to be updated',
          icon: '🔄'
        }
      ]
    },
    {
      id: 'clutter',
      title: 'My Clutter',
      description: '...',
      subtext: 'scanning...',
      icon: '🗂️',
      color: 'from-pink-400 to-pink-600/50',
      categories: [
        {
          name: 'Duplicate Downloads',
          description: 'Tekrarlanan indirme dosyaları',
          icon: '📥'
        }
      ]
    }
  ];

  let interval: NodeJS.Timeout;

  async function startScan() {
    isScanning = true;
    isCleanupScanning = true;
    isProtectionScanning = true;
    isPerformanceScanning = true;
    isApplicationsScanning = true;
    isClutterScanning = true;
    currentStep = 0;
    stepCompleted = [false];

    // Her taramayı bağımsız olarak başlat
    invoke('scan_junk_files')
        .then(cleanupResults => {
            const cleanupSizeGB = (cleanupResults.total_size / (1024 * 1024 * 1024)).toFixed(1);
            steps[0].description = `${cleanupSizeGB} GB to clean`;
            steps[0].subtext = `${cleanupResults.total_files} items found`;
            junkStats = { ...junkStats, ...cleanupResults };
            isCleanupScanning = false;
        })
        .catch(error => {
            console.error('Cleanup tarama hatası:', error);
            steps[0].description = 'Scan error';
            steps[0].subtext = 'please try again';
            isCleanupScanning = false;
        });

    invoke('scan_protection')
        .then(protectionResults => {
            const protectionSizeGB = (protectionResults.total_size / (1024 * 1024 * 1024)).toFixed(1);
            steps[1].description = `${protectionSizeGB} GB affected`;
            steps[1].subtext = `${protectionResults.total_files} threats found`;
            junkStats = { ...junkStats, protection: protectionResults };
            isProtectionScanning = false;
        })
        .catch(error => {
            console.error('Protection tarama hatası:', error);
            steps[1].description = 'Scan error';
            steps[1].subtext = 'please try again';
            isProtectionScanning = false;
        });

    invoke('scan_performance')
        .then(performanceResults => {
            const itemCount = performanceResults.total_files;
            steps[2].description = `${itemCount} items detected`;
            steps[2].subtext = 'affecting system performance';
            junkStats = { ...junkStats, performance: performanceResults };
            isPerformanceScanning = false;
        })
        .catch(error => {
            console.error('Performance tarama hatası:', error);
            steps[2].description = 'Scan error';
            steps[2].subtext = 'please try again';
            isPerformanceScanning = false;
        });

    invoke('scan_applications')
        .then(applicationsResults => {
            const updateCount = applicationsResults.total_files;
            steps[3].description = `${updateCount} updates available`;
            steps[3].subtext = 'apps need attention';
            junkStats = { ...junkStats, applications: applicationsResults };
            isApplicationsScanning = false;
        })
        .catch(error => {
            console.error('Applications tarama hatası:', error);
            steps[3].description = 'Scan error';
            steps[3].subtext = 'please try again';
            isApplicationsScanning = false;
        });

    invoke('scan_clutter')
        .then(clutterResults => {
            const itemCount = clutterResults.total_files;
            steps[4].description = `${itemCount} duplicate files`;
            steps[4].subtext = `${formatSize(clutterResults.total_size)} to clean`;
            junkStats = { ...junkStats, clutter: clutterResults };
            isClutterScanning = false;
        })
        .catch(error => {
            console.error('Clutter tarama hatası:', error);
            steps[4].description = 'Scan error';
            steps[4].subtext = 'please try again';
            isClutterScanning = false;
        });
  }

  function nextStep() {
    if (currentStep < steps.length - 1 && stepCompleted[currentStep]) {
      currentStep++;
    } else if (currentStep === steps.length - 1 && stepCompleted[currentStep]) {
      scanComplete = true;
    }
  }

  function completeCurrentStep() {
    stepCompleted[currentStep] = true;
  }

  function stopScan() {
    isScanning = false;
    scanComplete = false;
    currentStep = 0;
    junkStats = null;
    stepCompleted = [false];
  }

  function openReviewModal(category: any, stepIndex: number) {
    selectedCategory = {
        title: steps[stepIndex].title,
        description: steps[stepIndex].description,
        icon: steps[stepIndex].icon,
        size: stepIndex === 0 ? junkStats?.total_size :
              stepIndex === 1 ? junkStats?.protection?.total_size :
              stepIndex === 2 ? junkStats?.performance?.total_size :
              stepIndex === 3 ? junkStats?.applications?.total_size :
              junkStats?.clutter?.total_size,
        categories: (stepIndex === 0 ? junkStats?.categories :
                    stepIndex === 1 ? junkStats?.protection?.categories :
                    stepIndex === 2 ? junkStats?.performance?.categories :
                    stepIndex === 3 ? junkStats?.applications?.categories :
                    junkStats?.clutter?.categories)
                    ?.sort((a, b) => b.size - a.size)
                    ?.map(cat => ({
                        ...cat,
                        files: [...(cat.files || [])].sort((a, b) => b.size - a.size)
                    }))
    };
    showReviewModal = true;
  }

  // Kategorilerin açık/kapalı durumunu takip etmek için
  $: if (junkStats?.categories) {
    junkStats.categories = junkStats.categories.map(cat => ({
      ...cat,
      isOpen: false
    }));
  }

  async function deleteFile(path: string, category: any) {
    try {
        await invoke('delete_file', { path });
        // Dosyayı listeden kaldır
        category.files = category.files.filter((f: any) => f.path !== path);
        // Kategori boyutunu ve dosya sayısını güncelle
        category.size = category.files.reduce((total: number, f: any) => total + f.size, 0);
        category.file_count = category.files.length;

        // selectedCategory'yi güncelle
        if (selectedCategory) {
            selectedCategory.categories = selectedCategory.categories.map((cat: any) => {
                if (cat.name === category.name) {
                    return {
                        ...cat,
                        files: category.files,
                        size: category.size,
                        file_count: category.file_count
                    };
                }
                return cat;
            });
            // Toplam boyutu güncelle
            selectedCategory.size = selectedCategory.categories.reduce((total: number, cat: any) => total + cat.size, 0);
        }
    } catch (error) {
        console.error('Dosya silme hatası:', error);
    }
  }

  function toggleFileSelection(path: string) {
    if (selectedFiles.has(path)) {
        selectedFiles.delete(path);
    } else {
        selectedFiles.add(path);
    }
    selectedFiles = selectedFiles; // Trigger reactivity
  }

  function selectAllFiles(category: any) {
    if (selectedFiles.size === category.files.length) {
        // Deselect all
        selectedFiles.clear();
    } else {
        // Select all
        category.files.forEach((file: any) => selectedFiles.add(file.path));
    }
    selectedFiles = selectedFiles; // Trigger reactivity
  }

  async function deleteSelectedFiles(category: any) {
    const filesToDelete = [...selectedFiles];
    let deletedCount = 0;
    let errorCount = 0;

    for (const path of filesToDelete) {
        try {
            await deleteFile(path, category);
            deletedCount++;
        } catch (error) {
            console.error('Dosya silme hatası:', error);
            errorCount++;
        }
    }

    selectedFiles.clear();
    selectedFiles = selectedFiles; // Trigger reactivity

    if (errorCount > 0) {
        deleteError = `${errorCount} dosya silinemedi. ${deletedCount} dosya başarıyla silindi.`;
    } else if (deletedCount > 0) {
        deleteSuccess = true;
        setTimeout(() => {
            showDeleteConfirmModal = false;
            deleteSuccess = false;
        }, 1500);
    }
  }

  async function confirmDelete(path: string | null, category: any) {
    if (path) {
        fileToDelete = { path, name: path.split('/').pop() || path };
    } else {
        // Multiple files selected
        fileToDelete = { 
            path: 'multiple', 
            name: `${selectedFiles.size} files`
        };
    }
    categoryToUpdate = category;
    showDeleteConfirmModal = true;
  }

  async function handleDelete() {
    if (fileToDelete && categoryToUpdate) {
        isDeleting = true;
        deleteError = null;
        deleteSuccess = false;
        showDeleteConfirmModal = false; // Modalı hemen kapat
        
        try {
            if (fileToDelete.path === 'multiple') {
                await deleteSelectedFiles(categoryToUpdate);
            } else {
                await deleteFile(fileToDelete.path, categoryToUpdate);
                deleteSuccess = true;
                // Ana kartı güncelle
                if (steps[currentStep]) {
                    const updatedSize = (categoryToUpdate.size / (1024 * 1024 * 1024)).toFixed(1);
                    steps[currentStep].description = `${updatedSize} GB to clean`;
                    steps[currentStep].subtext = `${categoryToUpdate.file_count} items found`;
                }
                setTimeout(() => {
                    fileToDelete = null;
                    categoryToUpdate = null;
                    deleteSuccess = false;
                }, 2000);
            }
        } catch (error) {
            console.error('Dosya silme hatası:', error);
            deleteError = error as string;
            showDeleteConfirmModal = true; // Hata durumunda modalı tekrar göster
        } finally {
            isDeleting = false;
        }
    }
  }

  onMount(() => {
    return () => {
      if (interval) clearInterval(interval);
    };
  });
</script>

<div class="h-full flex flex-col relative">
  <!-- Animasyonlu Arka Plan -->
  <div class="fixed inset-0 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-800 to-purple-800"></div>
    <div class="absolute inset-0 opacity-40">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,0,200,0.3),rgba(120,0,200,0))] animate-pulse"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,0,200,0.3),rgba(120,0,200,0))] animate-pulse" style="animation-delay: -2s;"></div>
      <div class="absolute w-full h-[200%] -top-full animate-aurora">
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"></div>
      </div>
    </div>
  </div>

  <!-- İçerik -->
  <div class="relative flex-1 flex flex-col items-center justify-center p-8">
    {#if !isScanning}
      <div class="text-center mb-32" in:fade>
        <h1 class="text-5xl font-bold text-white mb-4">Welcome to CleanMyMac</h1>
        <p class="text-xl text-white/70">Start with a quick and extensive scan of your Mac.</p>
      </div>
      <button 
        on:click={startScan}
        class="relative w-32 h-32 bg-white/10 hover:bg-white/20 transition-all duration-300 rounded-full flex items-center justify-center shadow-2xl group backdrop-blur-xl"
      >
        <div class="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"></div>
        <span class="text-2xl font-semibold text-white group-hover:scale-110 transition-transform duration-300">Scan</span>
      </button>
    {:else}
      <div class="w-full max-w-6xl space-y-6" in:fade={{ duration: 300 }}>
        <h2 class="text-4xl font-bold text-white text-center mb-12">Smart Care</h2>
        <div class="grid grid-cols-2 gap-6">
          <!-- Temporary Files Card -->
          <div class="relative rounded-3xl overflow-hidden backdrop-blur-sm bg-white/5">
            {#if isCleanupScanning}
              <!-- Loading State -->
              <div class="p-8">
                <div class="flex flex-col items-center justify-center">
                  <div class="relative">
                    <div class="w-16 h-16 border-4 border-purple-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                    <div class="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-[spin_2s_linear_infinite] absolute inset-0"></div>
                    <div class="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500/50 rounded-full animate-[spin_1s_linear_infinite] absolute inset-0"></div>
                    
                    <!-- Merkez İkon -->
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-0.5">
                        <div class="w-full h-full rounded-lg bg-black/20 backdrop-blur-xl flex items-center justify-center">
                          <span class="text-xl animate-pulse">🧹</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Yükleniyor Yazısı -->
                  <div class="mt-4 text-center">
                    <h3 class="text-base font-medium text-white mb-1">Scanning Files</h3>
                    <div class="flex items-center justify-center gap-1 text-purple-300/70">
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0s;"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.2s;"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.4s;"></div>
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <!-- Result State -->
              <div class="relative h-full p-6">
                <div class="absolute inset-0 bg-gradient-to-br {steps[0].color} opacity-20"></div>
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <div class="w-3 h-3 rounded-full bg-white"></div>
                      </div>
                      <h3 class="text-lg font-medium text-white/90">{steps[0].title}</h3>
                    </div>
                    <div class="space-y-1">
                      <p class="text-2xl font-bold text-white">{steps[0].description}</p>
                      <p class="text-sm text-white/50">{steps[0].subtext}</p>
                    </div>
                  </div>
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br {steps[0].color} p-0.5">
                    <div class="w-full h-full rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center">
                      <span class="text-2xl">{steps[0].icon}</span>
                    </div>
                  </div>
                </div>
                <button 
                  class="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs backdrop-blur-sm transition-all duration-300 flex items-center gap-1.5 group"
                  on:click={() => openReviewModal(junkStats?.categories[0], 0)}
                >
                  <span>Review</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-0.5" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            {/if}
          </div>

          <!-- Protection Card -->
          <div class="relative rounded-3xl overflow-hidden backdrop-blur-sm bg-white/5">
            {#if isProtectionScanning}
              <!-- Loading State -->
              <div class="p-8">
                <div class="flex flex-col items-center justify-center">
                  <div class="relative">
                    <div class="w-16 h-16 border-4 border-red-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                    <div class="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-[spin_2s_linear_infinite] absolute inset-0"></div>
                    <div class="w-16 h-16 border-4 border-red-500/20 border-t-red-500/50 rounded-full animate-[spin_1s_linear_infinite] absolute inset-0"></div>
                    
                    <!-- Merkez İkon -->
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-0.5">
                        <div class="w-full h-full rounded-lg bg-black/20 backdrop-blur-xl flex items-center justify-center">
                          <span class="text-xl animate-pulse">🛡️</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Yükleniyor Yazısı -->
                  <div class="mt-4 text-center">
                    <h3 class="text-base font-medium text-white mb-1">Scanning Threats</h3>
                    <div class="flex items-center justify-center gap-1 text-red-300/70">
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0s;"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.2s;"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.4s;"></div>
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <!-- Result State -->
              <div class="relative h-full p-6">
                <div class="absolute inset-0 bg-gradient-to-br {steps[1].color} opacity-20"></div>
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <div class="w-3 h-3 rounded-full bg-white"></div>
                      </div>
                      <h3 class="text-lg font-medium text-white/90">{steps[1].title}</h3>
                    </div>
                    <div class="space-y-1">
                      <p class="text-2xl font-bold text-white">{steps[1].description}</p>
                      <p class="text-sm text-white/50">{steps[1].subtext}</p>
                    </div>
                  </div>
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br {steps[1].color} p-0.5">
                    <div class="w-full h-full rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center">
                      <span class="text-2xl">{steps[1].icon}</span>
                    </div>
                  </div>
                </div>
                <button 
                  class="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs backdrop-blur-sm transition-all duration-300 flex items-center gap-1.5 group"
                  on:click={() => openReviewModal(junkStats?.protection?.categories[0], 1)}
                >
                  <span>Review</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-0.5" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            {/if}
          </div>

          <!-- Performance Card -->
          <div class="relative rounded-3xl overflow-hidden backdrop-blur-sm bg-white/5">
            {#if isPerformanceScanning}
              <!-- Loading State -->
              <div class="p-8">
                <div class="flex flex-col items-center justify-center">
                  <div class="relative">
                    <div class="w-16 h-16 border-4 border-blue-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                    <div class="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-[spin_2s_linear_infinite] absolute inset-0"></div>
                    <div class="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500/50 rounded-full animate-[spin_1s_linear_infinite] absolute inset-0"></div>
                    
                    <!-- Merkez İkon -->
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-0.5">
                        <div class="w-full h-full rounded-lg bg-black/20 backdrop-blur-xl flex items-center justify-center">
                          <span class="text-xl animate-pulse">⚡</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Yükleniyor Yazısı -->
                  <div class="mt-4 text-center">
                    <h3 class="text-base font-medium text-white mb-1">Scanning Performance</h3>
                    <div class="flex items-center justify-center gap-1 text-blue-300/70">
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0s;"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.2s;"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.4s;"></div>
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <!-- Result State -->
              <div class="relative h-full p-6">
                <div class="absolute inset-0 bg-gradient-to-br {steps[2].color} opacity-20"></div>
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <div class="w-3 h-3 rounded-full bg-white"></div>
                      </div>
                      <h3 class="text-lg font-medium text-white/90">{steps[2].title}</h3>
                    </div>
                    <div class="space-y-1">
                      <p class="text-2xl font-bold text-white">{steps[2].description}</p>
                      <p class="text-sm text-white/50">{steps[2].subtext}</p>
                    </div>
                  </div>
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br {steps[2].color} p-0.5">
                    <div class="w-full h-full rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center">
                      <span class="text-2xl">{steps[2].icon}</span>
                    </div>
                  </div>
                </div>
                <button 
                  class="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs backdrop-blur-sm transition-all duration-300 flex items-center gap-1.5 group"
                  on:click={() => openReviewModal(junkStats?.performance?.categories[0], 2)}
                >
                  <span>Review</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-0.5" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            {/if}
          </div>

          <!-- Applications Card -->
          <div class="relative rounded-3xl overflow-hidden backdrop-blur-sm bg-white/5">
            {#if isApplicationsScanning}
              <!-- Loading State -->
              <div class="p-8">
                <div class="flex flex-col items-center justify-center">
                  <div class="relative">
                    <div class="w-16 h-16 border-4 border-orange-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                    <div class="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-[spin_2s_linear_infinite] absolute inset-0"></div>
                    <div class="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500/50 rounded-full animate-[spin_1s_linear_infinite] absolute inset-0"></div>
                    
                    <!-- Merkez İkon -->
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-0.5">
                        <div class="w-full h-full rounded-lg bg-black/20 backdrop-blur-xl flex items-center justify-center">
                          <span class="text-xl animate-pulse">📱</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Yükleniyor Yazısı -->
                  <div class="mt-4 text-center">
                    <h3 class="text-base font-medium text-white mb-1">Scanning Applications</h3>
                    <div class="flex items-center justify-center gap-1 text-orange-300/70">
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0s;"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.2s;"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.4s;"></div>
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <!-- Result State -->
              <div class="relative h-full p-6">
                <div class="absolute inset-0 bg-gradient-to-br {steps[3].color} opacity-20"></div>
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <div class="w-3 h-3 rounded-full bg-white"></div>
                      </div>
                      <h3 class="text-lg font-medium text-white/90">{steps[3].title}</h3>
                    </div>
                    <div class="space-y-1">
                      <p class="text-2xl font-bold text-white">{steps[3].description}</p>
                      <p class="text-sm text-white/50">{steps[3].subtext}</p>
                    </div>
                  </div>
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br {steps[3].color} p-0.5">
                    <div class="w-full h-full rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center">
                      <span class="text-2xl">{steps[3].icon}</span>
                    </div>
                  </div>
                </div>
                <button 
                  class="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs backdrop-blur-sm transition-all duration-300 flex items-center gap-1.5 group"
                  on:click={() => openReviewModal(junkStats?.applications?.categories[0], 3)}
                >
                  <span>Review</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-0.5" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            {/if}
          </div>

          <!-- My Clutter Card -->
          <div class="relative rounded-3xl overflow-hidden backdrop-blur-sm bg-white/5 col-span-2">
            {#if isClutterScanning}
              <!-- Loading State -->
              <div class="p-8">
                <div class="flex flex-col items-center justify-center">
                  <div class="relative">
                    <div class="w-16 h-16 border-4 border-pink-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                    <div class="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-[spin_2s_linear_infinite] absolute inset-0"></div>
                    <div class="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500/50 rounded-full animate-[spin_1s_linear_infinite] absolute inset-0"></div>
                    
                    <!-- Merkez İkon -->
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 p-0.5">
                        <div class="w-full h-full rounded-lg bg-black/20 backdrop-blur-xl flex items-center justify-center">
                          <span class="text-xl animate-pulse">🗂️</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Yükleniyor Yazısı -->
                  <div class="mt-4 text-center">
                    <h3 class="text-base font-medium text-white mb-1">Scanning My Clutter</h3>
                    <div class="flex items-center justify-center gap-1 text-pink-300/70">
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0s;"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.2s;"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.4s;"></div>
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <!-- Result State -->
              <div class="relative h-full p-6">
                <div class="absolute inset-0 bg-gradient-to-br {steps[4].color} opacity-20"></div>
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <div class="w-3 h-3 rounded-full bg-white"></div>
                      </div>
                      <h3 class="text-lg font-medium text-white/90">{steps[4].title}</h3>
                    </div>
                    <div class="space-y-1">
                      <p class="text-2xl font-bold text-white">{steps[4].description}</p>
                      <p class="text-sm text-white/50">{steps[4].subtext}</p>
                    </div>
                  </div>
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br {steps[4].color} p-0.5">
                    <div class="w-full h-full rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center">
                      <span class="text-2xl">{steps[4].icon}</span>
                    </div>
                  </div>
                </div>
                <button 
                  class="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs backdrop-blur-sm transition-all duration-300 flex items-center gap-1.5 group"
                  on:click={() => openReviewModal(junkStats?.clutter?.categories[0], 4)}
                >
                  <span>Review</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-0.5" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Loading State -->
{#if isScanning}
  <div class="w-full max-w-6xl space-y-6" in:fade={{ duration: 300 }}>
    <h2 class="text-4xl font-bold text-white text-center mb-12">Smart Care</h2>
    <div class="grid grid-cols-2 gap-6">
      <!-- Temporary Files Card -->
      <div class="relative rounded-3xl overflow-hidden backdrop-blur-sm bg-white/5">
        {#if isCleanupScanning}
          <!-- Loading State -->
          <div class="p-8">
            <div class="flex flex-col items-center justify-center">
              <div class="relative">
                <div class="w-16 h-16 border-4 border-purple-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                <div class="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-[spin_2s_linear_infinite] absolute inset-0"></div>
                <div class="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500/50 rounded-full animate-[spin_1s_linear_infinite] absolute inset-0"></div>
                
                <!-- Merkez İkon -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-0.5">
                    <div class="w-full h-full rounded-lg bg-black/20 backdrop-blur-xl flex items-center justify-center">
                      <span class="text-xl animate-pulse">🧹</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Yükleniyor Yazısı -->
              <div class="mt-4 text-center">
                <h3 class="text-base font-medium text-white mb-1">Scanning Files</h3>
                <div class="flex items-center justify-center gap-1 text-purple-300/70">
                  <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0s;"></div>
                  <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.2s;"></div>
                  <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.4s;"></div>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <!-- Result State -->
          <div class="relative h-full p-6">
            <div class="absolute inset-0 bg-gradient-to-br {steps[0].color} opacity-20"></div>
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div class="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                  <h3 class="text-lg font-medium text-white/90">{steps[0].title}</h3>
                </div>
                <div class="space-y-1">
                  <p class="text-2xl font-bold text-white">{steps[0].description}</p>
                  <p class="text-sm text-white/50">{steps[0].subtext}</p>
                </div>
              </div>
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br {steps[0].color} p-0.5">
                <div class="w-full h-full rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center">
                  <span class="text-2xl">{steps[0].icon}</span>
                </div>
              </div>
            </div>
            <button 
              class="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs backdrop-blur-sm transition-all duration-300 flex items-center gap-1.5 group"
              on:click={() => openReviewModal(junkStats?.categories[0], 0)}
            >
              <span>Review</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-0.5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        {/if}
      </div>

      <!-- Protection Card -->
      <div class="relative rounded-3xl overflow-hidden backdrop-blur-sm bg-white/5">
        {#if isProtectionScanning}
          <!-- Loading State -->
          <div class="p-8">
            <div class="flex flex-col items-center justify-center">
              <div class="relative">
                <div class="w-16 h-16 border-4 border-red-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                <div class="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-[spin_2s_linear_infinite] absolute inset-0"></div>
                <div class="w-16 h-16 border-4 border-red-500/20 border-t-red-500/50 rounded-full animate-[spin_1s_linear_infinite] absolute inset-0"></div>
                
                <!-- Merkez İkon -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-0.5">
                    <div class="w-full h-full rounded-lg bg-black/20 backdrop-blur-xl flex items-center justify-center">
                      <span class="text-xl animate-pulse">🛡️</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Yükleniyor Yazısı -->
              <div class="mt-4 text-center">
                <h3 class="text-base font-medium text-white mb-1">Scanning Threats</h3>
                <div class="flex items-center justify-center gap-1 text-red-300/70">
                  <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0s;"></div>
                  <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.2s;"></div>
                  <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.4s;"></div>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <!-- Result State -->
          <div class="relative h-full p-6">
            <div class="absolute inset-0 bg-gradient-to-br {steps[1].color} opacity-20"></div>
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div class="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                  <h3 class="text-lg font-medium text-white/90">{steps[1].title}</h3>
                </div>
                <div class="space-y-1">
                  <p class="text-2xl font-bold text-white">{steps[1].description}</p>
                  <p class="text-sm text-white/50">{steps[1].subtext}</p>
                </div>
              </div>
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br {steps[1].color} p-0.5">
                <div class="w-full h-full rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center">
                  <span class="text-2xl">{steps[1].icon}</span>
                </div>
              </div>
            </div>
            <button 
              class="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs backdrop-blur-sm transition-all duration-300 flex items-center gap-1.5 group"
              on:click={() => openReviewModal(junkStats?.protection?.categories[0], 1)}
            >
              <span>Review</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-0.5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        {/if}
      </div>

      <!-- Performance Card -->
      <div class="relative rounded-3xl overflow-hidden backdrop-blur-sm bg-white/5">
        {#if isPerformanceScanning}
          <!-- Loading State -->
          <div class="p-8">
            <div class="flex flex-col items-center justify-center">
              <div class="relative">
                <div class="w-16 h-16 border-4 border-blue-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                <div class="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-[spin_2s_linear_infinite] absolute inset-0"></div>
                <div class="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500/50 rounded-full animate-[spin_1s_linear_infinite] absolute inset-0"></div>
                
                <!-- Merkez İkon -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-0.5">
                    <div class="w-full h-full rounded-lg bg-black/20 backdrop-blur-xl flex items-center justify-center">
                      <span class="text-xl animate-pulse">⚡</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Yükleniyor Yazısı -->
              <div class="mt-4 text-center">
                <h3 class="text-base font-medium text-white mb-1">Scanning Performance</h3>
                <div class="flex items-center justify-center gap-1 text-blue-300/70">
                  <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0s;"></div>
                  <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.2s;"></div>
                  <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.4s;"></div>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <!-- Result State -->
          <div class="relative h-full p-6">
            <div class="absolute inset-0 bg-gradient-to-br {steps[2].color} opacity-20"></div>
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div class="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                  <h3 class="text-lg font-medium text-white/90">{steps[2].title}</h3>
                </div>
                <div class="space-y-1">
                  <p class="text-2xl font-bold text-white">{steps[2].description}</p>
                  <p class="text-sm text-white/50">{steps[2].subtext}</p>
                </div>
              </div>
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br {steps[2].color} p-0.5">
                <div class="w-full h-full rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center">
                  <span class="text-2xl">{steps[2].icon}</span>
                </div>
              </div>
            </div>
            <button 
              class="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs backdrop-blur-sm transition-all duration-300 flex items-center gap-1.5 group"
              on:click={() => openReviewModal(junkStats?.performance?.categories[0], 2)}
            >
              <span>Review</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-0.5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        {/if}
      </div>

      <!-- Applications Card -->
      <div class="relative rounded-3xl overflow-hidden backdrop-blur-sm bg-white/5">
        {#if isApplicationsScanning}
          <!-- Loading State -->
          <div class="p-8">
            <div class="flex flex-col items-center justify-center">
              <div class="relative">
                <div class="w-16 h-16 border-4 border-orange-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                <div class="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-[spin_2s_linear_infinite] absolute inset-0"></div>
                <div class="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500/50 rounded-full animate-[spin_1s_linear_infinite] absolute inset-0"></div>
                
                <!-- Merkez İkon -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-0.5">
                    <div class="w-full h-full rounded-lg bg-black/20 backdrop-blur-xl flex items-center justify-center">
                      <span class="text-xl animate-pulse">📱</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Yükleniyor Yazısı -->
              <div class="mt-4 text-center">
                <h3 class="text-base font-medium text-white mb-1">Scanning Applications</h3>
                <div class="flex items-center justify-center gap-1 text-orange-300/70">
                  <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0s;"></div>
                  <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.2s;"></div>
                  <div class="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_1s_infinite]" style="animation-delay: 0.4s;"></div>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <!-- Result State -->
          <div class="relative h-full p-6">
            <div class="absolute inset-0 bg-gradient-to-br {steps[3].color} opacity-20"></div>
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div class="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                  <h3 class="text-lg font-medium text-white/90">{steps[3].title}</h3>
                </div>
                <div class="space-y-1">
                  <p class="text-2xl font-bold text-white">{steps[3].description}</p>
                  <p class="text-sm text-white/50">{steps[3].subtext}</p>
                </div>
              </div>
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br {steps[3].color} p-0.5">
                <div class="w-full h-full rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center">
                  <span class="text-2xl">{steps[3].icon}</span>
                </div>
              </div>
            </div>
            <button 
              class="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs backdrop-blur-sm transition-all duration-300 flex items-center gap-1.5 group"
              on:click={() => openReviewModal(junkStats?.applications?.categories[0], 3)}
            >
              <span>Review</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-0.5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Review Modal -->
{#if showReviewModal}
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
    transition:fade={{ duration: 200 }}
    on:click|self={() => showReviewModal = false}
  >
    <div 
      class="bg-white/10 backdrop-blur-xl rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl"
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <!-- Modal Header -->
      <div class="p-6 border-b border-white/10 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br {selectedCategory?.color} p-0.5">
            <div class="w-full h-full rounded-xl bg-black/20 backdrop-blur-xl flex items-center justify-center">
              <span class="text-2xl">{selectedCategory?.icon}</span>
            </div>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">{selectedCategory?.title}</h3>
            <p class="text-white/50">Total size: {formatSize(selectedCategory?.size || 0)}</p>
          </div>
        </div>
        <button 
          class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
          on:click={() => showReviewModal = false}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
        <div class="space-y-4">
          {#if selectedCategory?.categories}
            <div class="space-y-4">
                {#each selectedCategory.categories as category}
                    <div class="bg-white/5 rounded-xl overflow-hidden">
                        <button class="w-full flex items-center justify-between p-4" on:click={() => category.isOpen = !category.isOpen}>
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                    <span class="text-xl">{category.icon}</span>
                                </div>
                                <div class="text-left">
                                    <h4 class="text-lg font-medium text-white">{category.name}</h4>
                                    <p class="text-sm text-white/50">{category.description}</p>
                                </div>
          </div>
                            <div class="flex items-center gap-4">
          <div class="text-right">
                                    <p class="text-sm font-medium text-white">{formatSize(category.size)}</p>
                                    <p class="text-xs text-white/50">{category.file_count} items</p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white/50 transition-transform duration-300" class:rotate-180={category.isOpen} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>
                        {#if category.isOpen}
                            <div class="border-t border-white/5" transition:slide>
                                <div class="p-4 space-y-2">
                                    <div class="flex items-center justify-between py-2 px-4">
                                        <label class="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                class="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500/20"
                                                checked={selectedFiles.size === category.files.length}
                                                on:change={() => selectAllFiles(category)}
                                            />
                                            <span class="text-sm text-white/70">Select All</span>
                                        </label>
                                        {#if selectedFiles.size > 0}
                                            <button 
                                                class="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 text-sm transition-all duration-300 flex items-center gap-2"
                                                on:click={() => confirmDelete(null, category)}
                                            >
                                                <span>Delete Selected ({selectedFiles.size})</span>
                                            </button>
                                        {/if}
                                    </div>
                                    {#each category.files as file}
                                        <div class="flex items-center justify-between py-2 px-4 rounded-lg hover:bg-white/5" transition:fly={{ y: 10 }}>
                                            <div class="flex items-center gap-3 flex-1 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    class="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500/20"
                                                    checked={selectedFiles.has(file.path)}
                                                    on:change={() => toggleFileSelection(file.path)}
                                                />
                                                <div class="flex-1 min-w-0">
                                                    <p class="text-sm text-white/90 truncate" title={file.path}>{truncatePath(file.path)}</p>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-3 shrink-0">
                                                <p class="text-sm text-white/50 whitespace-nowrap">{formatSize(file.size)}</p>
                                                <button 
                                                    class="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-sm transition-all duration-300"
                                                    on:click={() => confirmDelete(file.path, category)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="py-5 px-6 border-t border-white/10">
        <div class="flex justify-between items-center">
          <p class="text-white/50 text-base">{selectedCategory?.file_count || 0} items found</p>
          <div class="flex gap-4">
            <button 
              class="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-300"
              on:click={() => showReviewModal = false}
            >
              Close
            </button>
            <button 
              class="px-6 py-2 rounded-xl bg-gradient-to-r {selectedCategory?.color} hover:opacity-90 text-white font-medium transition-all duration-300"
              on:click={() => {
                showReviewModal = false;
                if (selectedCategory?.files?.length > 0) {
                  completeCurrentStep();
                }
              }}
            >
              Clean
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirmModal}
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center" transition:fade>
        <div class="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4" transition:fly={{ y: 20 }}>
            <div in:fly={{ y: 20 }} out:fade>
                <h3 class="text-xl font-bold text-white mb-2">Delete File</h3>
                <p class="text-white/70 mb-2">Are you sure you want to delete this file?</p>
                <p class="text-white/50 text-sm mb-6 break-all">{fileToDelete?.name}</p>
                {#if deleteError}
                    <div class="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20" transition:slide>
                        <p class="text-red-500 text-sm">{deleteError}</p>
                    </div>
                {/if}
                <div class="flex items-center justify-end gap-3">
                    <button 
                        class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 transition-all duration-300"
                        on:click={() => {
                            showDeleteConfirmModal = false;
                            deleteError = null;
                        }}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button 
                        class="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-all duration-300 relative"
                        on:click={handleDelete}
                        disabled={isDeleting}
                    >
                        {#if isDeleting}
                            <div class="absolute inset-0 rounded-xl bg-red-500/20 animate-pulse"></div>
                            <div class="relative flex items-center gap-2">
                                <div class="w-4 h-4 border-2 border-red-500/50 border-t-red-500 rounded-full animate-spin"></div>
                                <span>Deleting...</span>
                            </div>
                        {:else}
                            Delete
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Toast Notification -->
{#if deleteSuccess}
    <div 
        class="fixed top-4 right-4 bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-xl rounded-xl p-4 shadow-lg z-[90] flex items-center gap-3"
        transition:fly={{ x: 20, duration: 300 }}
    >
        <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 6L9 17l-5-5" />
            </svg>
        </div>
        <div>
            <p class="text-white font-medium">File Deleted</p>
            <p class="text-white/70 text-sm">The file has been successfully deleted.</p>
        </div>
    </div>
{/if}

<!-- Remove Run Button -->
{#if isScanning && !scanComplete && !isCleanupScanning && !isProtectionScanning}
  <div class="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-[55]" in:fade={{ delay: 500 }}>
    <button 
      on:click={stopScan}
      class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-all duration-300 flex items-center justify-center backdrop-blur-xl group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
</div>
{/if}

<style>
  @keyframes aurora {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(100%);
    }
  }

  .animate-aurora {
    animation: aurora 8s linear infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.8;
    }
  }

  .animate-pulse {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>
