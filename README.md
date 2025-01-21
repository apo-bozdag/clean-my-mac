# Clean My Mac

Modern ve güçlü bir Mac temizleme ve optimizasyon uygulaması. Sisteminizi temiz ve performanslı tutmak için tasarlandı.

![Ana Ekran](ss1.png)

## 🚀 Özellikler

### 🧹 Smart Care
Sisteminizin genel durumunu tek bir yerden görüntüleyin ve yönetin.

![Smart Care](ss2.png)

- **System Cleanup**: Gereksiz dosyaları ve önbelleği temizleyin
- **Protection**: Sisteminizi tehditlere karşı koruyun
- **Performance**: Sistem performansını optimize edin
- **Applications**: Uygulamalarınızı güncel tutun
- **My Clutter**: Tekrarlanan ve gereksiz dosyaları bulun

### 🔍 Detaylı Sistem Analizi
Her bir kategori için detaylı analiz ve temizleme seçenekleri.

![Detaylı Analiz](ss3.png)

## 💻 Kurulum

1. En son sürümü [buradan](https://github.com/apo-bozdag/clean-my-mac/releases) indirin
2. DMG dosyasını açın
3. Clean My Mac uygulamasını Applications klasörüne sürükleyin
4. Uygulamayı başlatın

## 🔧 Kurulum Sorunları ve Çözümleri

### Geliştirici Kurulumu Sorunları

1. **SyntaxError: Unexpected token** hatası alıyorsanız:
   ```bash
   # Node.js'i güncelleyin (minimum v16 gerekli)
   brew install node@18
   
   # Tüm node_modules klasörünü temizleyin
   rm -rf node_modules
   rm package-lock.json
   
   # Bağımlılıkları yeniden yükleyin
   npm install
   
   # Rust toolchain'i güncelleyin
   rustup update
   ```

2. **Tauri Kurulum Gereksinimleri:**
   ```bash
   # macOS geliştirme araçlarını yükleyin
   xcode-select --install
   
   # Rust yükleyin
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Sistem yolunu güncelleyin
   source $HOME/.cargo/env
   ```

3. **Temiz Kurulum İçin:**
   ```bash
   # Projeyi klonlayın
   git clone https://github.com/apo-bozdag/clean-my-mac.git
   cd clean-my-mac
   
   # Node.js bağımlılıklarını yükleyin
   npm install
   
   # Geliştirme modunda çalıştırın
   npm run tauri dev
   ```

Not: Eğer hala sorun yaşıyorsanız, lütfen [issue açın](https://github.com/apo-bozdag/clean-my-mac/issues) ve hata mesajının tamamını paylaşın.

## 🦀 Rust Kurulumu

Tauri, Rust programlama dili üzerine kurulu olduğu için, geliştirme yapabilmek için Rust'ın yüklü olması gerekiyor.

### macOS için Rust Kurulumu:

1. **Terminal'i açın ve şu komutu çalıştırın:**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Kurulum sırasında:**
   - "1) Proceed with installation (default)" seçeneğini seçin
   - Kurulum tamamlandığında terminal'i yeniden başlatın veya şu komutu çalıştırın:
   ```bash
   source "$HOME/.cargo/env"
   ```

3. **Rust'ın doğru kurulduğunu kontrol edin:**
   ```bash
   rustc --version
   cargo --version
   ```

4. **Rust toolchain'i güncelleyin:**
   ```bash
   rustup update
   ```

### Olası Rust Sorunları:

1. **"command not found: cargo" hatası:**
   ```bash
   # Rust path'ini ekleyin
   echo 'source "$HOME/.cargo/env"' >> ~/.zshrc
   # veya bash kullanıyorsanız:
   echo 'source "$HOME/.cargo/env"' >> ~/.bashrc
   
   # Terminal'i yeniden başlatın veya:
   source ~/.zshrc  # veya source ~/.bashrc
   ```

2. **Rust kurulumu başarısız olursa:**
   - Xcode Command Line Tools'un yüklü olduğundan emin olun:
   ```bash
   xcode-select --install
   ```
   - Sonra Rust kurulumunu tekrar deneyin

3. **Rust bağımlılıkları güncellemek için:**
   ```bash
   rustup update
   cargo update
   ```

## 🛠️ Geliştirme

Bu proje [Tauri](https://tauri.app) + [Svelte](https://svelte.dev) + [TypeScript](https://www.typescriptlang.org/) kullanılarak geliştirilmiştir.

### Gereksinimler

- Node.js (v16 veya üzeri)
- Rust
- macOS için geliştirme araçları

### Geliştirme Ortamını Hazırlama

```bash
# Repository'yi klonlayın
git clone https://github.com/apo-bozdag/clean-my-mac.git
cd clean-my-mac

# Bağımlılıkları yükleyin
npm install

# Geliştirme modunda çalıştırın
npm run tauri dev

# Uygulamayı derleyin
npm run tauri build
```

## 📝 Lisans

MIT License. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Bu projeyi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 🔒 Güvenlik

Güvenlik açığı bulduysanız, lütfen issue açın veya doğrudan maintainer'lara ulaşın.

