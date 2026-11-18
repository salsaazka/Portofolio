# Rancangan — Portfolio Salsa (QA Engineer)

> Target: sangat ringan, pindah halaman tanpa loading (kayak SPA), penuh animasi, dan tiap section punya efek parallax waktu di-scroll.

## 0. Keputusan yang sudah diambil

| Topik | Keputusan |
|---|---|
| Framework | **Astro** (bukan SvelteKit). Detail di §3.1 |
| Pindah halaman | `<ClientRouter />` + prefetch. Browser **nggak reload**. Detail di §3.2 |
| Hosting | **Vercel (Hobby, gratis)**. Cadangannya Cloudflare Pages. Detail di §3.3 |
| Prototype desain | [`design/index.html`](design/index.html): HTML statis untuk mengunci visual & animasi. **Sudah dipindah ke Astro** (lihat [README.md](README.md)) |
| Status | Astro 7 jalan: home, `/projects`, `/projects/[slug]` (5 contoh), 404. JS ±60 KB gzip. Sisa: isi project asli, nomor WhatsApp, deploy |

---

## 1. Kenapa desain di zip kurang ngena

Bagian yang **dipertahankan**:
- Palet krem `#F4F1E8` + hijau tua `#10241A` + aksen lime `#DFF67E`. Hangat dan beda dari portfolio dev pada umumnya.
- Huruf "PORTFOLIO" yang berantakan/miring di hero. Ini bagus untuk parallax karena tiap huruf bisa jadi layer sendiri.
- Kartu ID yang tergantung lanyard. Cocok banget dibuat jadi elemen fisik yang bisa diayun.
- Pasangan font Geist + Newsreader italic + Poppins ExtraBold.

Bagian yang **bikin kurang suka** (dugaan):
- **About terlalu padat.** Experience, Education, Certification, What I Do, Contact, dan Tech Stack dijejalin jadi satu grid 3 kolom berisi teks kecil 12–14px. Nggak ada hierarki dan nggak ada momen yang diingat.
- **Projects cuma judul raksasa + angka 01–05**, belum ada isinya.
- **Statis.** Nggak ada gerak, padahal itu yang paling kamu mau.
- Belum punya identitas "QA". Sekarang kesannya masih portfolio generik.

---

## 2. Konsep: **"Test Run"**

Portfolio dibikin seperti **test suite yang lagi jalan**. Tiap section diperlakukan sebagai satu *spec*. Konsep ini nempel ke profesi QA tanpa jadi norak, asal dipakai tipis-tipis:

| Elemen | Perlakuan |
|---|---|
| Progress bar scroll (atas layar) | Bentuknya seperti test runner: `● about.spec  ✓ experience.spec  ○ projects.spec`. Spec yang sudah lewat jadi ✓ hijau. |
| Label section | `01 / ABOUT ME` disertai badge kecil `PASSED` yang muncul waktu section masuk viewport. |
| Transisi halaman | Tirai lime menyapu layar, ada centang ✓ di tengah sekitar 350ms, lalu halaman baru masuk. |
| Kursor (desktop) | Lingkaran kecil yang berubah jadi kaca pembesar 🔍 saat hover project ("inspect"). |
| Easter egg | Ketik `npx playwright test` atau tekan `T`, lalu semua section "di-test" ulang dengan animasi centang berurutan. Opsional dan seru. |
| 404 | `Expected: page — Received: undefined`. Tampil sebagai failed test dengan stack trace yang lucu. |

Ilustrasi berhijab (gambar yang kamu lampirkan) jadi **karakter utama** di hero. Background putihnya perlu dihapus dulu supaya jadi cutout transparan (AVIF/WebP).

---

## 3. Tech stack

| Kebutuhan | Pilihan | Alasan |
|---|---|---|
| Framework | **Astro 5** (static output) | Defaultnya 0 KB JS. JS cuma dikirim untuk bagian yang butuh. Hasilnya HTML statis yang bisa di-host di mana saja. |
| Pindah halaman tanpa reload | **Astro `<ClientRouter />`** (View Transitions API) | Navigasi di-fetch lalu di-swap DOM-nya seperti SPA. Ada `transition:persist` untuk header/kursor/progress bar dan `transition:name` untuk morph elemen antar halaman (misalnya kartu project → hero detail). Link di-prefetch saat hover, jadi terasa instan. |
| Smooth scroll | **Lenis** (~4 KB gz) | Scroll terasa halus dan jadi dasar parallax yang konsisten. |
| Animasi scroll & parallax | **GSAP + ScrollTrigger** (~45 KB gz, sekarang gratis penuh) | Paling stabil untuk pin, scrub, stacking section, dan split text. Di-load sekali, lalu di-*persist* lewat navigasi. |
| Efek ringan | CSS murni (`@keyframes`, `animation-timeline: view()` sebagai progressive enhancement) | Reveal sederhana nggak perlu JS. |
| Styling | CSS biasa + custom properties (atau Tailwind v4 kalau lebih nyaman) | Nggak perlu runtime CSS-in-JS. |
| Konten | Astro Content Collections (Markdown/MDX) | Project dan experience ditulis sebagai file `.md`, nggak perlu CMS. |
| Hosting | **Vercel Hobby** (cadangan: Cloudflare Pages) | Gratis, CDN global. Lihat §3.3. |

### 3.1 Kenapa Astro, bukan SvelteKit

| Aspek | Astro | SvelteKit |
|---|---|---|
| JS yang dikirim | Bisa 0 KB, cuma ditambah GSAP/Lenis | Selalu ada runtime router + hydration |
| Pindah halaman | ClientRouter: fetch HTML lalu swap DOM. Rasanya SPA | SPA beneran, layout & state tetap hidup |
| Animasi komponen | GSAP manual + lifecycle `astro:page-load` / `astro:before-swap` | `transition:` / `spring` bawaan, cleanup otomatis |
| Konten project | Content Collections + Markdown bawaan | Perlu mdsvex / setup sendiri |
| Kurva belajar | HTML + sedikit JS | Perlu belajar Svelte 5 (runes) |

Situs ini kebanyakan konten, jadi Astro menang di ringan dan kemudahan konten. Komponen yang interaksinya berat (lanyard yang bisa di-drag, kursor) boleh ditulis sebagai **island Svelte di dalam Astro** kalau nanti GSAP biasa terasa ribet.

### 3.2 Gimana Astro bisa pindah halaman tanpa loading

1. Link diklik → ClientRouter menahan navigasi bawaan browser.
2. HTML halaman tujuan diambil lewat `fetch`. Biasanya **sudah di-prefetch** saat link di-hover atau terlihat (`prefetchAll`), jadi langsung tersedia.
3. Isi `<body>` ditukar, URL diganti lewat `history.pushState`, lalu animasi View Transition (tirai lime) diputar.
4. Elemen yang diberi `transition:persist` (header, kursor, test-runner bar) **nggak di-render ulang**.

Hasilnya: spinner tab nggak muter, nggak ada layar putih, back/forward juga tanpa reload. Kalau koneksi lambat dan prefetch belum selesai, halaman cuma diam sebentar (tetap tanpa reload), dan tirai transisi sekaligus jadi indikator loading. Browser tanpa View Transitions API tetap swap tanpa reload, cuma morph-nya diganti fade.

### 3.3 Hosting

- **Vercel Hobby**: gratis, setup paling gampang (import repo GitHub → Deploy, Astro terdeteksi otomatis). Syarat "non-komersial" aman untuk portfolio pribadi. Kuota bandwidth jauh di atas kebutuhan situs statis.
- **Cadangan, Cloudflare Pages**: bandwidth statis praktis unlimited, node CDN di Jakarta.
- **Domain**: `.my.id` (murah) atau `.com` / `.dev`. Tanpa domain dapat `*.vercel.app`.
- Alur: `git push` → auto deploy. Tiap PR dapat preview URL sendiri.

### Budget performa (wajib dijaga)
- JS total **≤ 60 KB gzip** (GSAP + ScrollTrigger + Lenis + kode sendiri).
- LCP < 1.5 detik di 4G, CLS = 0, Lighthouse ≥ 95.
- Gambar pakai `astro:assets` (AVIF + WebP, `srcset`, lazy). Ilustrasi hero diberi `fetchpriority="high"`.
- Font: self-host (subset Latin) + `font-display: swap` + preload hanya untuk 2 file (Geist 400/600). Poppins cuma dipakai di judul besar, jadi bisa diganti SVG path supaya nggak perlu load font.
- `prefers-reduced-motion`: parallax dan smooth scroll dimatikan, yang tersisa cuma fade.

---

## 4. Sitemap & routing

```
/                     Home (Hero → About → Experience → Projects preview → Skills → Contact)
/projects             Semua project (grid + filter: Automation / API / Performance / Dev)
/projects/[slug]      Case study per project
/about                Cerita lengkap + timeline + sertifikasi
/contact              Form sederhana (Formspree/Web3Forms) + link
/404
```

Semua pindah halaman lewat ClientRouter, jadi **nggak ada white flash dan nggak ada loading**. Elemen yang di-*persist* (tetap hidup antar halaman):
- Header / nav
- Kursor custom
- Progress bar "test runner"
- Instance Lenis + GSAP

Morph antar halaman (`transition:name`):
- Thumbnail kartu project di `/projects` → gambar hero di `/projects/[slug]` (gambar "terbang" ke posisi baru).
- Logo `Salsa.` tetap di tempat; nav underline geser ke item aktif.

---

## 5. Sistem animasi

### 5.1 Parallax antar section ("pindah section")
Ada tiga pola, dipakai bergantian supaya nggak monoton:

1. **Stacked cards.** Section berikutnya naik *menutupi* section sebelumnya. Section lama `position: sticky`, lalu mengecil ke `scale(.92)`, membulat (`border-radius: 32px`), dan meredup. Dipakai untuk **Hero → About**.
2. **Layer depth.** Di dalam section, tiap elemen punya kecepatan berbeda (`data-speed="0.8"`, `"1.2"`, dan seterusnya). Dipakai di **Hero**: 9 huruf PORTFOLIO bergerak dengan kecepatan dan rotasi masing-masing, ilustrasi bergerak paling lambat, teks nama paling cepat. Di desktop juga ikut sedikit gerak mouse (tilt ±8px).
3. **Horizontal pin.** Section di-*pin*, lalu scroll vertikal diubah jadi gerak horizontal. Dipakai di **Experience** (timeline berjalan ke samping seperti rel kereta) dan **Projects** (kartu lewat satu per satu, angka besar 01–05 bergerak berlawanan arah).

Pergantian warna background antar section (krem → hijau tua di Projects → krem lagi) di-*scrub* halus. Nggak ada potongan keras.

### 5.2 Reveal & micro-interaction
- Judul: split per kata/huruf, naik dari mask (`clip-path`) dengan stagger.
- Paragraf: fade + blur kecil ke tajam.
- Kartu ID lanyard: **bisa diayun**. Ada sedikit physics (spring) saat scroll dan bisa di-drag di desktop.
- Tombol magnetic (tombol "Say hello" agak menempel ke kursor).
- Chip tech stack: marquee 2 baris berlawanan arah. Saat hover, chip berhenti dan membesar.
- Angka (tahun pengalaman, jumlah test case, dll.): counter naik saat terlihat.

### 5.3 Transisi halaman
```
klik link → tirai lime masuk dari bawah (300ms) → ✓ pop → swap DOM → tirai keluar ke atas (300ms) → reveal halaman baru
```
Dibuat dengan `::view-transition-old/new(root)` + `astro:before-swap`. Untuk navigasi antar project yang punya morph, tirainya di-skip supaya morph-nya kelihatan.

### 5.4 Wajib supaya nggak bug di SPA mode
- Semua ScrollTrigger di-`kill()` di event `astro:before-swap`, lalu dibuat ulang di `astro:page-load`.
- Lenis jangan dibuat ulang; cukup `lenis.scrollTo(0, { immediate: true })` setelah swap.
- Back/forward browser harus balik ke posisi scroll sebelumnya.

---

## 6. Detail section — Home

| # | Section | Isi | Animasi utama |
|---|---|---|---|
| 0 | **Intro loader** (sekali per sesi, ±4 detik; tambah `?intro` di URL untuk memutar ulang) | Command `npx playwright test portfolio.spec.ts` diketik, 8 spec berubah dari spinner ke ✓, counter 0→100% + progress bar, lalu layar lime dengan centang "all specs passed" | Loader tergulung ke atas. Hero intro tetap diputar tiap kali halaman dibuka: zoom-out, huruf PORTFOLIO jatuh memantul, ilustrasi naik dari blur, garis scan lime menyapu hero ("✓ 0 bugs found"), tagline per kata, header/badge/runner masuk |
| 1 | **Hero** | Huruf PORTFOLIO berantakan, "QA" di pojok, ilustrasi Salsa, nama, 1 kalimat: *"I break things so your users don't."* | Layer depth + mouse tilt. Saat scroll keluar, hero mengecil (stacked) |
| 2 | **About** | Kartu ID lanyard (foto asli) + "Hi, I'm *Salsa*" + 3 kalimat cerita dev → QA | Kartu berayun, teks split reveal |
| 3 | **What I do** | 3 kartu besar: Test Automation (Playwright), API & Performance (k6), Manual (Regression/UAT). Tiap kartu punya mini-animasi: browser yang diklik otomatis, grafik load k6, checklist | Kartu masuk bergiliran, ikon beranimasi saat terlihat |
| 4 | **Experience** | Timeline horizontal 6 posisi. Transisi Dev → QA ditandai jelas sebagai "plot twist" | Horizontal pin + garis progres yang tergambar |
| 5 | **Projects** | Background hijau tua. 4–5 project unggulan, tiap kartu memuat judul, peran, tools, dan hasil terukur (misalnya "−40% bug lolos ke prod") | Horizontal pin, angka besar parallax, hover kursor 🔍 |
| 6 | **Skills / Tech stack** | Marquee chip + kategori | Marquee scroll-velocity (makin cepat scroll, makin cepat marquee) |
| 7 | **Education & Certification** | Ringkas, 2 kolom | Fade sederhana. Jangan semua section heboh |
| 8 | **Contact / Footer** | Teks raksasa "Let's ship *bug-free*." + email (klik untuk copy) + LinkedIn | Teks muncul dari bawah, footer "terungkap" (curtain reveal) |

---

## 7. Design tokens

```css
:root {
  /* warna */
  --cream: #F4F1E8;   --paper: #FFFFFF;   --line: #E2DDD0;
  --ink: #10241A;     --ink-soft: #4F4E48; --muted: #5C5B55;
  --olive: #4E6B0E;   --sand: #8E7A5C;    --sand-soft: #DCCFBA;
  --accent: #DFF67E;  /* lime: CTA, tirai transisi, highlight */
  --pass: #3BA55C;    /* centang ✓ */

  /* font */
  --font-sans: "Geist", system-ui, sans-serif;
  --font-serif: "Newsreader", Georgia, serif;       /* italic, aksen */
  --font-display: "Poppins", var(--font-sans);      /* 800, judul raksasa */

  /* skala */
  --step-0: clamp(1rem, .95rem + .2vw, 1.125rem);
  --step-3: clamp(2.4rem, 1.8rem + 3vw, 3.5rem);
  --step-6: clamp(5rem, 3rem + 12vw, 16rem);

  /* gerak */
  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --ease-in-out: cubic-bezier(.77, 0, .18, 1);
  --dur-fast: 200ms; --dur: 500ms; --dur-slow: 900ms;
}
```
Mode gelap opsional. Section Projects sudah gelap (`--ink` sebagai background), jadi kontrasnya sudah dapat tanpa perlu theme toggle.

---

## 8. Struktur folder

```
porto-salsa/
├─ public/              favicon, og-image, fonts/
├─ src/
│  ├─ assets/           salsa-illustration.avif, foto, screenshot project
│  ├─ content/
│  │  ├─ projects/      01-baitullah-e2e.md, 02-k6-load-test.md, ...
│  │  └─ experience/    treetan.md, baitullah-qa.md, ...
│  ├─ components/
│  │  ├─ Header.astro  Cursor.astro  TestRunnerBar.astro  Curtain.astro
│  │  ├─ HeroLetters.astro  IdCard.astro  Marquee.astro  ProjectCard.astro
│  ├─ layouts/Base.astro          ← <ClientRouter/>, persist elements
│  ├─ pages/  index.astro  about.astro  contact.astro  404.astro
│  │          projects/index.astro  projects/[slug].astro
│  ├─ scripts/
│  │  ├─ motion.ts      init Lenis + GSAP, lifecycle astro:page-load / before-swap
│  │  ├─ parallax.ts    [data-speed], stacked sections, horizontal pin
│  │  ├─ reveal.ts      split text, fade
│  │  └─ cursor.ts  magnetic.ts  lanyard.ts
│  └─ styles/  tokens.css  base.css
└─ astro.config.mjs     prefetch: { prefetchAll: true, defaultStrategy: 'hover' }
```

---

## 9. Konten yang perlu disiapkan

- [ ] Ilustrasi hero dengan background transparan (dari gambar yang dilampirkan) dalam resolusi besar.
- [ ] Foto asli untuk kartu ID.
- [ ] **4–5 project** dengan format: konteks → masalah → yang kamu lakukan → tools → hasil (pakai angka kalau ada) → screenshot. Ini bagian yang paling penting buat recruiter.
- [ ] 1 kalimat tagline (kandidat: *"I break things so your users don't."*).
- [ ] CV PDF untuk tombol download.
- [ ] OG image untuk preview link di LinkedIn/WhatsApp.

---

## 10. Tahapan kerja

0. **Prototype desain** (`design/index.html`). Kunci visual, urutan section, dan gaya animasi di satu file HTML statis. Kalau sudah oke, potong jadi komponen Astro.
1. **Fondasi.** Setup Astro, tokens, font, layout Base + ClientRouter, halaman kosong yang sudah bisa saling pindah dengan tirai transisi.
2. **Motion core.** Lenis + GSAP lifecycle yang aman untuk SPA, util `[data-speed]`, reveal, kursor, progress bar test runner.
3. **Home.** Hero (layer huruf + ilustrasi) → About + lanyard → What I do → Experience horizontal → Projects → Skills → Contact.
4. **Halaman lain.** `/projects` + `[slug]` dengan morph gambar, `/about`, `/contact`, 404.
5. **Polish.** Mobile (parallax dikurangi, horizontal pin jadi swipe), reduced-motion, a11y (fokus keyboard, alt text, kontras), Lighthouse ≥ 95.
6. **Deploy.** Vercel + domain, OG image, sitemap.

---

## 11. Yang perlu kamu putuskan

1. **Konsep "Test Run"**: setuju, atau mau yang lebih kalem (cukup editorial + parallax tanpa tema QA)?
2. **Bahasa situs**: English saja, atau English + Indonesia (toggle)?
3. **Intro loader** di kunjungan pertama: mau atau nggak? Lebih "wah", tapi menambah sekitar 1 detik.
4. **Project mana saja** yang ditampilkan?
