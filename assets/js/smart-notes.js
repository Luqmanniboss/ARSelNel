/**
 * ARSelNel - Smart Notes & Interactive Slide Annotation Engine (smart-notes.js)
 * Manages Teacher Slide Management, Multi-Format Slide Rendering (PDF/PPTX/Google Slides/Interactive),
 * and Student Vector Digital Annotations (Pen, Eraser, Highlighter, Text, Shapes) with Supabase + Local persistence.
 */

(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    NOTES: 'arselnel_smart_notes',
    ANNOTATIONS_PREFIX: 'arselnel_annotations_',
    PROGRESS_PREFIX: 'arselnel_note_progress_',
    PENDING_ANNO: 'arselnel_pending_annotations'
  };

  // Seed Data: Form 1 Science (KSSM) Interactive Slide Decks
  const SEED_SLIDES = [
    {
      id: 'slide_aktiviti_lukis',
      title: 'Bab 2: Lembaran Aktiviti Melukis & Melabel Sel (Ujian Anotasi)',
      chapter: 'Bab 2: Sel Sebagai Unit Asas Hidupan',
      description: 'Lembaran aktiviti interaktif khas untuk murid: Label struktur sel haiwan, sambungkan organel dengan fungsinya, serlahkan fakta sains, dan lakar sel bebas!',
      contentType: 'interactive',
      sourceUrl: '',
      storagePath: '',
      slideCount: 4,
      publicationStatus: 'published',
      createdAt: '2026-03-20',
      updatedAt: '2026-03-20',
      slides: [
        {
          pageNumber: 1,
          title: 'Aktiviti 1: Labelkan Struktur Sel Haiwan',
          subtitle: 'Tuliskan Nama Organel Menggunakan Pen atau Teks',
          badge: 'Aktiviti 1',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-5 sm:p-7 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden select-none">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 rounded-lg bg-teal-600 text-white font-extrabold flex items-center justify-center text-xs">1</span>
                  <div>
                    <h3 class="font-headline font-extrabold text-lg sm:text-xl text-slate-900 leading-none">Aktiviti 1: Labelkan Struktur Sel Haiwan</h3>
                    <span class="text-[11px] text-teal-700 font-semibold">Tugasan Murid: Tuliskan nama organel menggunakan Pen atau Teks</span>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Sel Haiwan</span>
              </div>

              <!-- Word Bank -->
              <div class="py-2 px-3 bg-teal-50/70 border border-teal-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <span class="font-bold text-teal-900 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">inventory_2</span> Pilihan Jawapan:
                </span>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1 bg-white rounded-xl border border-teal-300 font-bold text-slate-800 shadow-xs">Nukleus</span>
                  <span class="px-3 py-1 bg-white rounded-xl border border-teal-300 font-bold text-slate-800 shadow-xs">Membran Sel</span>
                  <span class="px-3 py-1 bg-white rounded-xl border border-teal-300 font-bold text-slate-800 shadow-xs">Sitoplasma</span>
                  <span class="px-3 py-1 bg-white rounded-xl border border-teal-300 font-bold text-slate-800 shadow-xs">Mitokondria</span>
                </div>
              </div>

              <!-- Center diagram with 4 callouts -->
              <div class="relative flex-1 min-h-[260px] flex items-center justify-center my-1 bg-slate-50/50 rounded-2xl border border-slate-100">
                <svg viewBox="0 0 600 320" class="w-full h-full max-h-[300px]">
                  <!-- Animal Cell Graphic -->
                  <path d="M 180,160 Q 190,70 300,60 Q 420,50 440,150 Q 460,250 340,270 Q 200,280 180,160 Z" fill="#fff1f2" stroke="#f43f5e" stroke-width="3.5"/>
                  <circle cx="310" cy="155" r="48" fill="#fda4af" stroke="#e11d48" stroke-width="2.5"/>
                  <circle cx="300" cy="150" r="18" fill="#be123c"/>
                  <!-- Mitochondria -->
                  <g transform="translate(390, 110) rotate(30)">
                    <ellipse cx="0" cy="0" rx="26" ry="13" fill="#fde68a" stroke="#d97706" stroke-width="2"/>
                    <path d="M -16,0 Q -8,-6 0,0 Q 8,6 16,0" stroke="#b45309" fill="none" stroke-width="1.8"/>
                  </g>
                  <!-- Small vacuole -->
                  <circle cx="370" cy="210" r="16" fill="#bae6fd" stroke="#0284c7" stroke-width="2"/>

                  <!-- CALLOUT 1: Membran Sel (Top Left) -->
                  <line x1="210" y1="95" x2="110" y2="50" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,4"/>
                  <circle cx="210" cy="95" r="4" fill="#0284c7"/>
                  <!-- CALLOUT 2: Nukleus (Bottom Left) -->
                  <line x1="280" y1="165" x2="110" y2="240" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,4"/>
                  <circle cx="280" cy="165" r="4" fill="#0284c7"/>
                  <!-- CALLOUT 3: Mitokondria (Top Right) -->
                  <line x1="410" y1="110" x2="500" y2="60" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,4"/>
                  <circle cx="410" cy="110" r="4" fill="#0284c7"/>
                  <!-- CALLOUT 4: Sitoplasma (Bottom Right) -->
                  <line x1="330" y1="230" x2="500" y2="245" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,4"/>
                  <circle cx="330" cy="230" r="4" fill="#0284c7"/>
                </svg>

                <!-- Overlay HTML Box 1 (Membran Sel) -->
                <div class="absolute left-4 top-4 p-2.5 bg-white border-2 border-dashed border-sky-400 rounded-xl shadow-md text-center min-w-[140px]">
                  <span class="text-[10px] font-bold text-sky-600 block">KOTAK A:</span>
                  <span class="text-xs font-extrabold text-slate-400 italic">Tulis di sini...</span>
                </div>

                <!-- Overlay HTML Box 2 (Nukleus) -->
                <div class="absolute left-4 bottom-4 p-2.5 bg-white border-2 border-dashed border-sky-400 rounded-xl shadow-md text-center min-w-[140px]">
                  <span class="text-[10px] font-bold text-sky-600 block">KOTAK B:</span>
                  <span class="text-xs font-extrabold text-slate-400 italic">Tulis di sini...</span>
                </div>

                <!-- Overlay HTML Box 3 (Mitokondria) -->
                <div class="absolute right-4 top-4 p-2.5 bg-white border-2 border-dashed border-sky-400 rounded-xl shadow-md text-center min-w-[140px]">
                  <span class="text-[10px] font-bold text-sky-600 block">KOTAK C:</span>
                  <span class="text-xs font-extrabold text-slate-400 italic">Tulis di sini...</span>
                </div>

                <!-- Overlay HTML Box 4 (Sitoplasma) -->
                <div class="absolute right-4 bottom-4 p-2.5 bg-white border-2 border-dashed border-sky-400 rounded-xl shadow-md text-center min-w-[140px]">
                  <span class="text-[10px] font-bold text-sky-600 block">KOTAK D:</span>
                  <span class="text-xs font-extrabold text-slate-400 italic">Tulis di sini...</span>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span class="font-medium">💡 Gunakan Pen Biru atau Hitam untuk melabel terus di atas skrin!</span>
                <span class="font-bold text-teal-700">Slaid 1 / 4</span>
              </div>
            </div>
          `
        },
        {
          pageNumber: 2,
          title: 'Aktiviti 2: Garisan Padanan Organel & Fungsi',
          subtitle: 'Sambungkan Titik Organel dengan Fungsi yang Betul',
          badge: 'Aktiviti 2',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-5 sm:p-7 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden select-none">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 rounded-lg bg-teal-600 text-white font-extrabold flex items-center justify-center text-xs">2</span>
                  <div>
                    <h3 class="font-headline font-extrabold text-lg sm:text-xl text-slate-900 leading-none">Aktiviti 2: Garisan Padanan Organel & Fungsi</h3>
                    <span class="text-[11px] text-teal-700 font-semibold">Tugasan Murid: Sambungkan titik organel (Kiri) ke fungsi yang sepadan (Kanan)</span>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">Padanan Garisan</span>
              </div>

              <!-- Matching Columns Grid -->
              <div class="grid grid-cols-12 gap-3 my-auto py-2">
                <!-- Left Column: Organelles -->
                <div class="col-span-5 space-y-3">
                  <div class="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between shadow-xs">
                    <span class="font-bold text-xs sm:text-sm text-red-950">1. Nukleus</span>
                    <span class="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">●</span>
                  </div>
                  <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-xs">
                    <span class="font-bold text-xs sm:text-sm text-emerald-950">2. Kloroplas</span>
                    <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">●</span>
                  </div>
                  <div class="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs">
                    <span class="font-bold text-xs sm:text-sm text-amber-950">3. Mitokondria</span>
                    <span class="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">●</span>
                  </div>
                  <div class="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between shadow-xs">
                    <span class="font-bold text-xs sm:text-sm text-purple-950">4. Dinding Sel</span>
                    <span class="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">●</span>
                  </div>
                  <div class="p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between shadow-xs">
                    <span class="font-bold text-xs sm:text-sm text-sky-950">5. Vakuol Sentral</span>
                    <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">●</span>
                  </div>
                </div>

                <!-- Center Space for Drawing Lines -->
                <div class="col-span-2 flex items-center justify-center text-slate-300">
                  <span class="material-symbols-outlined text-4xl opacity-30">drag_handle</span>
                </div>

                <!-- Right Column: Functions (Scrambled) -->
                <div class="col-span-5 space-y-3">
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 shadow-xs">
                    <span class="w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0">○</span>
                    <span class="text-xs text-slate-700 font-medium">Menyerap cahaya bagi sintesis glukosa (fotosintesis).</span>
                  </div>
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 shadow-xs">
                    <span class="w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0">○</span>
                    <span class="text-xs text-slate-700 font-medium">Memberikan bentuk tetap dan sokongan selulosa tegar.</span>
                  </div>
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 shadow-xs">
                    <span class="w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0">○</span>
                    <span class="text-xs text-slate-700 font-medium">Pusat kawalan sel & mengandungi maklumat genetik (DNA).</span>
                  </div>
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 shadow-xs">
                    <span class="w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0">○</span>
                    <span class="text-xs text-slate-700 font-medium">Menyimpan sap sel dan mengekalkan kesegahan (turgiditi).</span>
                  </div>
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 shadow-xs">
                    <span class="w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold shrink-0">○</span>
                    <span class="text-xs text-slate-700 font-medium">Stesen janakuasa sel yang menghasilkan tenaga (ATP).</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span class="font-medium">✏️ Petua: Pilih alat Bentuk (Garis/Anak Panah) atau Pen untuk menyambung garisan kemas!</span>
                <span class="font-bold text-teal-700">Slaid 2 / 4</span>
              </div>
            </div>
          `
        },
        {
          pageNumber: 3,
          title: 'Aktiviti 3: Cabaran Penyerlah Sains (Highlighter)',
          subtitle: 'Serlahkan Fakta & Pilihan Jawapan yang Betul',
          badge: 'Aktiviti 3',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-5 sm:p-7 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden select-none">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 rounded-lg bg-teal-600 text-white font-extrabold flex items-center justify-center text-xs">3</span>
                  <div>
                    <h3 class="font-headline font-extrabold text-lg sm:text-xl text-slate-900 leading-none">Aktiviti 3: Cabaran Penyerlah Sains (Highlighter)</h3>
                    <span class="text-[11px] text-teal-700 font-semibold">Tugasan Murid: Serlahkan pilihan jawapan yang tepat menggunakan Penyerlah Kuning</span>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Highlighter Tool</span>
              </div>

              <div class="space-y-4 my-auto py-2">
                <!-- Question 1 -->
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <p class="font-bold text-xs sm:text-sm text-slate-900 mb-2.5">
                    1. Organel manakah yang dikenali sebagai "stesen janakuasa sel" kerana menghasilkan tenaga ATP?
                  </p>
                  <div class="flex flex-wrap gap-3">
                    <span class="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">A) Ribosom</span>
                    <span class="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">B) Mitokondria</span>
                    <span class="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">C) Jasad Golgi</span>
                  </div>
                </div>

                <!-- Question 2 -->
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <p class="font-bold text-xs sm:text-sm text-slate-900 mb-2.5">
                    2. Struktur yang HANYA terdapat pada sel tumbuhan dan TIDAK wujud pada sel haiwan:
                  </p>
                  <div class="flex flex-wrap gap-3">
                    <span class="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">A) Membran Plasma</span>
                    <span class="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">B) Dinding Sel Selulosa</span>
                    <span class="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">C) Sitoplasma</span>
                  </div>
                </div>

                <!-- Question 3 -->
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <p class="font-bold text-xs sm:text-sm text-slate-900 mb-2.5">
                    3. Pewarna makmal yang digunakan bagi mewarnakan sel pipi manusia di bawah mikroskop:
                  </p>
                  <div class="flex flex-wrap gap-3">
                    <span class="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">A) Larutan Iodin</span>
                    <span class="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">B) Metilena Biru</span>
                    <span class="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">C) Larutan Benedict</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span class="font-medium">🖍️ Pilih Penyerlah Kuning di atas bar alatan dan sapukan di atas kotak jawapan!</span>
                <span class="font-bold text-teal-700">Slaid 3 / 4</span>
              </div>
            </div>
          `
        },
        {
          pageNumber: 4,
          title: 'Aktiviti 4: Kanvas Lakaran Bebas Sains',
          subtitle: 'Kertas Grid Sains untuk Lukisan Sel Unisel',
          badge: 'Aktiviti 4',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-5 sm:p-7 bg-[#fdfbf7] text-slate-800 rounded-3xl border border-amber-200 shadow-sm relative overflow-hidden select-none" style="background-image: radial-gradient(#d1d5db 1px, transparent 1px); background-size: 20px 20px;">
              <div class="flex items-center justify-between border-b border-amber-200/80 pb-2.5 bg-white/80 backdrop-blur rounded-xl p-2 px-3">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 rounded-lg bg-teal-600 text-white font-extrabold flex items-center justify-center text-xs">4</span>
                  <div>
                    <h3 class="font-headline font-extrabold text-lg sm:text-xl text-slate-900 leading-none">Aktiviti 4: Kanvas Lakaran Bebas Sains</h3>
                    <span class="text-[11px] text-teal-700 font-semibold">Tugasan Murid: Lakar satu organisma unisel (Amoeba sp.) dan tandakan pseudopodium!</span>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Kertas Grid Sains</span>
              </div>

              <div class="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div class="p-4 bg-white/70 border border-dashed border-slate-300 rounded-2xl max-w-md shadow-xs pointer-events-none">
                  <span class="material-symbols-outlined text-4xl text-teal-600 mb-1">palette</span>
                  <h4 class="font-bold text-sm text-slate-800">Ruang Lukisan & Contengan Bebas</h4>
                  <p class="text-xs text-slate-500 mt-1">
                    Gunakan alat <strong>Pen</strong>, <strong>Bentuk</strong> (Bulatan/Segi empat), dan <strong>Penyerlah</strong> untuk melakar idea anda secara bebas. Semua lukisan akan disimpan secara automatik!
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-amber-200/80 bg-white/80 backdrop-blur rounded-xl p-2 px-3">
                <span class="font-medium">🎉 Tahniah! Anda boleh menekan butang <strong>Eksport</strong> di atas untuk memuat turun PDF hasil kerja anda!</span>
                <span class="font-bold text-teal-700">Slaid 4 / 4</span>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: 'slide_sel_1',
      title: 'Bab 2: Struktur Sel Haiwan & Sel Tumbuhan',
      chapter: 'Bab 2: Sel Sebagai Unit Asas Hidupan',
      description: 'Eksplorasi mendalam struktur mikroskopik sel haiwan vs sel tumbuhan. Dilengkapi gambar rajah organel berlabel untuk contengan dan nota peribadi.',
      contentType: 'interactive',
      sourceUrl: '',
      storagePath: '',
      slideCount: 6,
      publicationStatus: 'published',
      createdAt: '2026-03-01',
      updatedAt: '2026-03-15',
      slides: [
        {
          pageNumber: 1,
          title: 'Pengenalan: Sel Sebagai Unit Asas Kehidupan',
          subtitle: 'Sains Tingkatan 1 KSSM • Bab 2.1',
          badge: 'Pengenalan',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-10 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl relative overflow-hidden select-none">
              <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div class="space-y-4">
                <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-400/20 text-teal-200 text-xs font-bold border border-teal-400/30">
                  <span class="material-symbols-outlined text-sm">science</span>
                  BAB 2: SEL SEBAGAI UNIT ASAS HIDUPAN
                </div>
                <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight font-headline text-white leading-tight">
                  Struktur Sel Haiwan &<br/><span class="text-teal-300">Sel Tumbuhan</span>
                </h1>
                <p class="text-slate-200 text-base sm:text-lg max-w-2xl leading-relaxed">
                  Semua organisma hidup terbentuk daripada unit asas yang dipanggil <strong>sel</strong>. Sel menjalankan semua fungsi penting seperti respirasi, sintesis protein, dan perkumuhan.
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                <div class="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                  <span class="text-teal-300 text-xs font-bold block mb-1">1665</span>
                  <h4 class="font-bold text-sm text-white">Robert Hooke</h4>
                  <p class="text-xs text-slate-300 mt-1">Menemui sel gabus pertama kali menggunakan mikroskop ringkas ciptaannya.</p>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                  <span class="text-teal-300 text-xs font-bold block mb-1">1838 - 1839</span>
                  <h4 class="font-bold text-sm text-white">Teori Sel</h4>
                  <p class="text-xs text-slate-300 mt-1">Schleiden & Schwann mengemukakan bahawa semua tumbuhan dan haiwan terbina daripada sel.</p>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                  <span class="text-teal-300 text-xs font-bold block mb-1">Anotasi Murid</span>
                  <h4 class="font-bold text-sm text-white">Ruang Catatan Pintar</h4>
                  <p class="text-xs text-slate-300 mt-1">Gunakan alat pen dan penyerlah di atas untuk mencatat istilah penting terus di sini!</p>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs text-teal-200/80 pt-4 border-t border-white/10">
                <span>Modul Interaktif ARSelNel</span>
                <span>Slaid 1 daripada 6</span>
              </div>
            </div>
          `
        },
        {
          pageNumber: 2,
          title: 'Anatomi Struktur Sel Haiwan',
          subtitle: 'Organel & Komponen Utama',
          badge: 'Sel Haiwan',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-8 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden select-none">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <h3 class="font-headline font-extrabold text-xl sm:text-2xl text-slate-900">Anatomi Sel Haiwan</h3>
                </div>
                <span class="text-xs font-bold px-3 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-200">Bentuk Tidak Tetap</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-4">
                <div class="md:col-span-6 flex flex-col items-center justify-center p-4 bg-rose-50/40 rounded-2xl border border-rose-100/70">
                  <svg viewBox="0 0 400 300" class="w-full max-h-[220px]">
                    <!-- Animal Cell Shape -->
                    <path d="M 50,150 Q 60,60 180,50 Q 320,40 350,140 Q 380,240 240,260 Q 100,280 50,150 Z" fill="#ffe4e6" stroke="#f43f5e" stroke-width="3" stroke-dasharray="none"/>
                    <!-- Cytoplasm label -->
                    <circle cx="200" cy="150" r="110" fill="#fff1f2" opacity="0.6"/>
                    <!-- Nucleus -->
                    <circle cx="160" cy="140" r="42" fill="#fda4af" stroke="#e11d48" stroke-width="2.5"/>
                    <circle cx="150" cy="135" r="18" fill="#9f1239"/>
                    <text x="135" y="140" fill="#fff" font-size="11" font-weight="bold">Nukleus</text>
                    <!-- Mitochondria -->
                    <g transform="translate(260, 100) rotate(25)">
                      <ellipse cx="0" cy="0" rx="28" ry="14" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
                      <path d="M -18,0 Q -10,-8 -5,0 Q 5,8 18,0" stroke="#b45309" fill="none" stroke-width="1.8"/>
                    </g>
                    <!-- Small Vacuole -->
                    <circle cx="240" cy="200" r="16" fill="#bae6fd" stroke="#0284c7" stroke-width="2"/>
                    <text x="225" y="204" fill="#0369a1" font-size="9" font-weight="bold">Vakuol</text>
                    <!-- Ribosomes dots -->
                    <circle cx="100" cy="100" r="3" fill="#64748b"/>
                    <circle cx="115" cy="110" r="3" fill="#64748b"/>
                    <circle cx="110" cy="180" r="3" fill="#64748b"/>
                    <circle cx="270" cy="160" r="3" fill="#64748b"/>
                  </svg>
                  <span class="text-[11px] text-slate-500 font-medium mt-1">Rajah Sel Haiwan (Tiada Dinding Sel & Kloroplas)</span>
                </div>

                <div class="md:col-span-6 space-y-2.5">
                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <span class="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                    <div>
                      <strong class="text-xs font-bold text-slate-900 block">Membran Sel</strong>
                      <p class="text-[11px] text-slate-600">Lapisan luar separa telap yang mengawal pergerakan bahan masuk dan keluar sel.</p>
                    </div>
                  </div>
                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <span class="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                    <div>
                      <strong class="text-xs font-bold text-slate-900 block">Sitoplasma</strong>
                      <p class="text-[11px] text-slate-600">Bahan seperti jeli tempat berlakunya kebanyakan tindak balas biokimia sel.</p>
                    </div>
                  </div>
                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <span class="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                    <div>
                      <strong class="text-xs font-bold text-slate-900 block">Nukleus</strong>
                      <p class="text-[11px] text-slate-600">Pusat kawalan sel yang mengandungi maklumat genetik (kromosom & DNA).</p>
                    </div>
                  </div>
                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <span class="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
                    <div>
                      <strong class="text-xs font-bold text-slate-900 block">Mitokondria</strong>
                      <p class="text-[11px] text-slate-600">Stesen janakuasa sel yang menghasilkan tenaga (ATP) melalui respirasi aerob.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                <span class="material-symbols-outlined text-amber-600 text-xl">lightbulb</span>
                <p class="text-xs text-amber-900 font-medium">
                  <strong>Tugasan Pelajar:</strong> Bulatkan <em>Nukleus</em> dengan pen merah dan gariskan fungsi <em>Mitokondria</em> dengan penyerlah kuning!
                </p>
              </div>
            </div>
          `
        },
        {
          pageNumber: 3,
          title: 'Anatomi Struktur Sel Tumbuhan',
          subtitle: 'Dinding Sel, Kloroplas & Vakuol Sentral',
          badge: 'Sel Tumbuhan',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-8 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden select-none">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <h3 class="font-headline font-extrabold text-xl sm:text-2xl text-slate-900">Anatomi Sel Tumbuhan</h3>
                </div>
                <span class="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">Bentuk Tetap / Bersegi</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-4">
                <div class="md:col-span-6 flex flex-col items-center justify-center p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/70">
                  <svg viewBox="0 0 400 300" class="w-full max-h-[220px]">
                    <!-- Outer Cell Wall -->
                    <polygon points="50,40 350,40 370,260 30,260" fill="#dcfce7" stroke="#16a34a" stroke-width="5"/>
                    <!-- Cell Membrane -->
                    <polygon points="58,48 342,48 360,252 40,252" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
                    <!-- Large Central Vacuole -->
                    <path d="M 120,90 Q 220,70 280,110 Q 300,190 220,230 Q 130,220 120,90 Z" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="2.5"/>
                    <text x="180" y="160" fill="#0284c7" font-size="12" font-weight="bold">Vakuol Besar</text>
                    <!-- Nucleus (Pushed to side) -->
                    <circle cx="85" cy="180" r="26" fill="#fda4af" stroke="#e11d48" stroke-width="2"/>
                    <circle cx="85" cy="180" r="10" fill="#9f1239"/>
                    <!-- Chloroplasts -->
                    <g transform="translate(110, 65)">
                      <ellipse cx="0" cy="0" rx="18" ry="10" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
                      <circle cx="-5" cy="0" r="2" fill="#86efac"/>
                      <circle cx="3" cy="0" r="2" fill="#86efac"/>
                    </g>
                    <g transform="translate(300, 80)">
                      <ellipse cx="0" cy="0" rx="18" ry="10" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
                    </g>
                    <g transform="translate(310, 200)">
                      <ellipse cx="0" cy="0" rx="18" ry="10" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
                    </g>
                  </svg>
                  <span class="text-[11px] text-slate-500 font-medium mt-1">Rajah Sel Tumbuhan dengan Dinding Selulosa & Kloroplas</span>
                </div>

                <div class="md:col-span-6 space-y-2.5">
                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <span class="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                    <div>
                      <strong class="text-xs font-bold text-slate-900 block">Dinding Sel (Selulosa)</strong>
                      <p class="text-[11px] text-slate-600">Memberi sokongan mekanikal, perlindungan, dan bentuk yang tetap kepada sel.</p>
                    </div>
                  </div>
                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <span class="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                    <div>
                      <strong class="text-xs font-bold text-slate-900 block">Kloroplas & Klorofil</strong>
                      <p class="text-[11px] text-slate-600">Menyerap tenaga cahaya matahari untuk menghasilkan glukosa melalui fotosintesis.</p>
                    </div>
                  </div>
                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <span class="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                    <div>
                      <strong class="text-xs font-bold text-slate-900 block">Vakuol Sentral Besar</strong>
                      <p class="text-[11px] text-slate-600">Mengandungi sap sel untuk mengekalkan kesegahan sel tumbuhan (turgid).</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                <span class="material-symbols-outlined text-emerald-600 text-xl">draw</span>
                <p class="text-xs text-emerald-900 font-medium">
                  <strong>Anotasi Sains:</strong> Gunakan anak panah untuk menunjukkan arah tekanan vakuol terhadap dinding sel!
                </p>
              </div>
            </div>
          `
        },
        {
          pageNumber: 4,
          title: 'Jadual Perbandingan Sel Haiwan & Sel Tumbuhan',
          subtitle: 'Persamaan & Perbezaan Utama KSSM',
          badge: 'Jadual Perbandingan',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-8 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden select-none">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 class="font-headline font-extrabold text-xl sm:text-2xl text-slate-900">Jadual Perbandingan Sel</h3>
                <span class="text-xs font-bold px-3 py-1 bg-teal-50 text-primary rounded-full border border-teal-200">Fokus Soalan Peperiksaan</span>
              </div>

              <div class="my-4 overflow-x-auto">
                <table class="w-full text-xs sm:text-sm border-collapse text-left">
                  <thead>
                    <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th class="p-3 rounded-l-xl">Ciri / Organel</th>
                      <th class="p-3 text-rose-700 bg-rose-50/60">Sel Haiwan</th>
                      <th class="p-3 text-emerald-700 bg-emerald-50/60 rounded-r-xl">Sel Tumbuhan</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr>
                      <td class="p-2.5 font-semibold text-slate-900">Bentuk Sel</td>
                      <td class="p-2.5 text-slate-600">Tidak tetap / fleksibel</td>
                      <td class="p-2.5 text-slate-600">Tetap (bersegi)</td>
                    </tr>
                    <tr>
                      <td class="p-2.5 font-semibold text-slate-900">Dinding Sel</td>
                      <td class="p-2.5 text-rose-600 font-bold">Tiada</td>
                      <td class="p-2.5 text-emerald-600 font-bold">Ada (Selulosa)</td>
                    </tr>
                    <tr>
                      <td class="p-2.5 font-semibold text-slate-900">Kloroplas</td>
                      <td class="p-2.5 text-rose-600 font-bold">Tiada</td>
                      <td class="p-2.5 text-emerald-600 font-bold">Ada (Fotosintesis)</td>
                    </tr>
                    <tr>
                      <td class="p-2.5 font-semibold text-slate-900">Vakuol</td>
                      <td class="p-2.5 text-slate-600">Tiada atau bersaiz kecil</td>
                      <td class="p-2.5 text-slate-600">Vakuol sentral bersaiz besar</td>
                    </tr>
                    <tr>
                      <td class="p-2.5 font-semibold text-slate-900">Nukleus & Mitokondria</td>
                      <td class="p-2.5 text-emerald-600 font-bold">Ada</td>
                      <td class="p-2.5 text-emerald-600 font-bold">Ada</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed">
                <strong>💡 Tip Menghafal Ringkas:</strong> Ingat perkataan <strong>D-K-V</strong> (Dinding sel, Kloroplas, Vakuol besar) — hanya ada pada <strong>Sel Tumbuhan</strong>!
              </div>
            </div>
          `
        },
        {
          pageNumber: 5,
          title: 'Organisasi Sel: Dari Sel Ke Organisma',
          subtitle: 'Hierarki Tingkatan 1 KSSM',
          badge: 'Hierarki Sel',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-8 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden select-none">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 class="font-headline font-extrabold text-xl sm:text-2xl text-slate-900">Hierarki Organisasi Sel</h3>
                <span class="text-xs font-bold px-3 py-1 bg-sky-50 text-sky-700 rounded-full border border-sky-200">Urutan Kompleksiti</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-5 gap-3 my-4">
                <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center">
                  <span class="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs mb-2">1</span>
                  <h4 class="font-bold text-xs text-slate-900">SEL</h4>
                  <p class="text-[10px] text-slate-500 mt-1">Unit asas hidupan (Cth: Sel otot, sel saraf)</p>
                </div>
                <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center">
                  <span class="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs mb-2">2</span>
                  <h4 class="font-bold text-xs text-slate-900">TISU</h4>
                  <p class="text-[10px] text-slate-500 mt-1">Sekumpulan sel serupa yang bekerjasama (Cth: Tisu otot)</p>
                </div>
                <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center">
                  <span class="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs mb-2">3</span>
                  <h4 class="font-bold text-xs text-slate-900">ORGAN</h4>
                  <p class="text-[10px] text-slate-500 mt-1">Tisu berbeza bergabung menjalankan fungsi khas (Cth: Jantung, Daun)</p>
                </div>
                <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center">
                  <span class="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs mb-2">4</span>
                  <h4 class="font-bold text-xs text-slate-900">SISTEM</h4>
                  <p class="text-[10px] text-slate-500 mt-1">Beberapa organ bekerja bersama (Cth: Sistem Peredaran Darah)</p>
                </div>
                <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center">
                  <span class="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs mb-2">5</span>
                  <h4 class="font-bold text-xs text-slate-900">ORGANISMA</h4>
                  <p class="text-[10px] text-slate-500 mt-1">Gabungan semua sistem membentuk hidupan lengkap (Cth: Manusia, Pokok)</p>
                </div>
              </div>

              <div class="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center gap-3">
                <span class="material-symbols-outlined text-sky-600 text-xl">edit_note</span>
                <p class="text-xs text-sky-900 font-medium">
                  Lukis garis alir (arah panah) dari Sel hingga Organisma dan tulis satu contoh sistem tubuh manusia kegemaran anda!
                </p>
              </div>
            </div>
          `
        },
        {
          pageNumber: 6,
          title: 'Latihan Pengukuhan Interaktif',
          subtitle: 'Uji Kefahaman & Catat Jawapan Anda',
          badge: 'Kuiz / Latihan',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-8 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden select-none">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 class="font-headline font-extrabold text-xl sm:text-2xl text-slate-900">Ruang Latihan Pelajar</h3>
                <span class="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">Tulis Terus Atas Slaid</span>
              </div>

              <div class="space-y-4 my-4">
                <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p class="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                    1. Nyatakan fungsi utama klorofil dalam kloroplas sel tumbuhan.
                  </p>
                  <div class="h-10 border-b-2 border-dashed border-slate-300 flex items-center text-xs text-slate-400 italic">
                    [Tuliskan jawapan anda di sini menggunakan alat Pen atau Teks...]
                  </div>
                </div>

                <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p class="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                    2. Mengapakah sel haiwan boleh meletup apabila menyerap terlalu banyak air, manakala sel tumbuhan tidak?
                  </p>
                  <div class="h-12 border-b-2 border-dashed border-slate-300 flex items-center text-xs text-slate-400 italic">
                    [Catatkan kata kunci: Dinding sel / tekanan kesegahan...]
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                <span>Nota ini disimpan secara automatik ke akaun anda.</span>
                <span class="font-bold text-primary">Tamat Slaid Bab 2 🎉</span>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: 'slide_sel_2',
      title: 'Bab 2: Fungsi Organel Sel & Penggunaan Mikroskop Cahaya',
      chapter: 'Bab 2: Sel Sebagai Unit Asas Hidupan',
      description: 'Panduan amali penyediaan slaid basah sel pipi dan sel epidermis bawang serta fungsi setiap bahagian mikroskop cahaya.',
      contentType: 'interactive',
      sourceUrl: '',
      storagePath: '',
      slideCount: 4,
      publicationStatus: 'published',
      createdAt: '2026-03-05',
      updatedAt: '2026-03-12',
      slides: [
        {
          pageNumber: 1,
          title: 'Penggunaan Mikroskop Cahaya Makmal',
          subtitle: 'Amali Sains KSSM Tingkatan 1',
          badge: 'Amali Makmal',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-10 bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 text-white rounded-3xl relative overflow-hidden select-none">
              <div class="space-y-3">
                <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">AMALI MIKROSKOP</span>
                <h1 class="text-3xl sm:text-4xl font-extrabold text-white font-headline">Kaedah Menggunakan Mikroskop Cahaya</h1>
                <p class="text-sm text-slate-300 max-w-xl">Ketahui komponen kanta mata, kanta objek, pelaras kasar dan pelaras halus untuk mendapatkan fokus spesimen biologi yang tajam.</p>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div class="p-3 bg-white/10 rounded-2xl border border-white/10 text-center"><strong class="text-xs text-indigo-300 block">Kanta Mata</strong><span class="text-[11px] text-slate-300">Membesar imej (4x / 10x)</span></div>
                <div class="p-3 bg-white/10 rounded-2xl border border-white/10 text-center"><strong class="text-xs text-indigo-300 block">Pelaras Kasar</strong><span class="text-[11px] text-slate-300">Gerak pentas dengan cepat</span></div>
                <div class="p-3 bg-white/10 rounded-2xl border border-white/10 text-center"><strong class="text-xs text-indigo-300 block">Pelaras Halus</strong><span class="text-[11px] text-slate-300">Fokus imej dengan tajam</span></div>
                <div class="p-3 bg-white/10 rounded-2xl border border-white/10 text-center"><strong class="text-xs text-indigo-300 block">Diafragma</strong><span class="text-[11px] text-slate-300">Kawal jumlah cahaya masuk</span></div>
              </div>
              <div class="text-xs text-indigo-200">Gunakan ruang ini untuk menandakan kedudukan komponen mikroskop.</div>
            </div>
          `
        },
        {
          pageNumber: 2,
          title: 'Penyediaan Slaid Sel Epidermis Bawang',
          subtitle: 'Pewarnaan dengan Larutan Iodin',
          badge: 'Sel Tumbuhan',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-8 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative select-none">
              <h3 class="font-headline font-bold text-xl text-slate-900 border-b pb-2">Langkah Penyediaan Slaid Sel Bawang</h3>
              <ol class="space-y-2.5 text-xs sm:text-sm text-slate-700 my-4 list-decimal list-inside">
                <li>Kopek lapisan epidermis lut cahaya daripada sebelah dalam daun sisik bawang merah.</li>
                <li>Letakkan titisan air di tengah slaid kaca bersih dan ratakan epidermis bawang.</li>
                <li>Titiskan setitik <strong>larutan iodin</strong> untuk mewarnakan nukleus dan dinding sel.</li>
                <li>Turunkan kaca penutup secara perlahan bersudut 45° menggunakan jarum tenggek untuk mengelakkan <em>gelembung udara</em>.</li>
              </ol>
              <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
                <strong>Catatan Penting:</strong> Gelembung udara kelihatan berbentuk bulat dengan sempadan hitam tebal di bawah mikroskop.
              </div>
            </div>
          `
        },
        {
          pageNumber: 3,
          title: 'Penyediaan Slaid Sel Pipi Manusia',
          subtitle: 'Pewarnaan dengan Metilena Biru',
          badge: 'Sel Haiwan',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-8 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative select-none">
              <h3 class="font-headline font-bold text-xl text-slate-900 border-b pb-2">Langkah Penyediaan Slaid Sel Pipi</h3>
              <ol class="space-y-2.5 text-xs sm:text-sm text-slate-700 my-4 list-decimal list-inside">
                <li>Gunakan pencungkil gigi tumpul bersih dan kikis bahagian dalam pipi dengan lembut.</li>
                <li>Letakkan kikisan pipi di atas setitik air pada slaid kaca.</li>
                <li>Titiskan setitik <strong>larutan metilena biru</strong> bagi mewarnakan sitoplasma dan nukleus sel haiwan.</li>
                <li>Tutup dengan kaca penutup perlahan-lahan dan serap cecair berlebihan menggunakan kertas turas.</li>
              </ol>
              <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                <strong>Peringatan Keselamatan:</strong> Buang pencungkil gigi terpakai ke dalam bikar berisi pembasmi kuman sebaik sahaja selesai.
              </div>
            </div>
          `
        },
        {
          pageNumber: 4,
          title: 'Rumusan & Semakan Kendiri',
          subtitle: 'Lengkapkan Notatan Anda',
          badge: 'Rumusan',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-8 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative select-none">
              <h3 class="font-headline font-bold text-xl text-slate-900 border-b pb-2">Soalan Pengukuhan Amali</h3>
              <div class="space-y-4 my-4">
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <strong>Apakah pewarna yang digunakan untuk sel tumbuhan dan sel haiwan?</strong>
                  <p class="mt-1 text-slate-500">Sel Tumbuhan: ________ | Sel Haiwan: ________</p>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <strong>Bagaimanakah cara mengelakkan gelembung udara semasa meletakkan kaca penutup?</strong>
                  <p class="mt-1 text-slate-500">[Tuliskan jawapan di atas garisan ini...]</p>
                </div>
              </div>
              <div class="text-xs text-slate-400">Tahniah! Anda telah melengkapkan modul amali mikroskop sains.</div>
            </div>
          `
        }
      ]
    },
    {
      id: 'slide_sel_3',
      title: 'Bab 3: Koordinasi & Gerak Balas Organisma (Homeostasis)',
      chapter: 'Bab 3: Koordinasi dan Gerak Balas',
      description: 'Kawal atur homeostasis suhu badan dan kandungan air dalam manusia, serta kawalan transpirasi dalam tumbuhan.',
      contentType: 'google_slides',
      sourceUrl: 'https://docs.google.com/presentation/d/1Zt3oK2bX8c9L4mN_arselnel_demo/preview',
      storagePath: '',
      slideCount: 4,
      publicationStatus: 'published',
      createdAt: '2026-03-08',
      updatedAt: '2026-03-16',
      slides: [
        {
          pageNumber: 1,
          title: 'Konsep Asas Homeostasis',
          subtitle: 'Mengekalkan Keseimbangan Persekitaran Dalaman',
          badge: 'Google Slides',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-10 bg-gradient-to-br from-blue-900 via-sky-800 to-slate-900 text-white rounded-3xl relative overflow-hidden select-none">
              <div class="space-y-3">
                <span class="px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 text-xs font-bold border border-sky-400/30">BAB 3: HOMEOSTASIS</span>
                <h1 class="text-3xl sm:text-5xl font-extrabold text-white font-headline">Kawal Atur Persekitaran Dalam Organisma</h1>
                <p class="text-slate-200 text-base max-w-xl">Homeostasis ialah proses pengekalan persekitaran dalam badan organisma supaya sentiasa berada dalam keadaan seimbang dan optimum.</p>
              </div>
              <div class="grid grid-cols-2 gap-4 my-4">
                <div class="p-4 bg-white/10 rounded-2xl border border-white/10"><h4 class="font-bold text-sm text-sky-200">Kawal Atur Suhu</h4><p class="text-xs text-slate-300 mt-1">Suhu optimum badan manusia ialah kira-kira 37°C.</p></div>
                <div class="p-4 bg-white/10 rounded-2xl border border-white/10"><h4 class="font-bold text-sm text-sky-200">Kawal Atur Air</h4><p class="text-xs text-slate-300 mt-1">Ginjal mengawal isi padu air dan kepekatan darah.</p></div>
              </div>
              <div class="text-xs text-sky-200/80">Slaid Pautan Google Slides KSSM</div>
            </div>
          `
        },
        {
          pageNumber: 2,
          title: 'Kawal Atur Suhu Badan pada Hari Panas',
          subtitle: 'Tindak Balas Fisiologi Manusia',
          badge: 'Suhu Panas',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-8 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative select-none">
              <h3 class="font-headline font-bold text-xl text-slate-900 border-b pb-2">Tindak Balas Badan Apabila Suhu Meningkat</h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center"><strong class="text-xs text-amber-900 block">Kelenjar Peluh</strong><span class="text-[11px] text-slate-600">Menghasilkan lebih banyak peluh untuk menyejukkan kulit melalui penyejatan.</span></div>
                <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center"><strong class="text-xs text-amber-900 block">Salur Darah</strong><span class="text-[11px] text-slate-600">Mengembang (pemvasodilatan) supaya lebih banyak haba dapat dibebaskan ke udara.</span></div>
                <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center"><strong class="text-xs text-amber-900 block">Bulu Roma</strong><span class="text-[11px] text-slate-600">Condong rapat ke kulit untuk mengurangkan udara terperangkap.</span></div>
              </div>
              <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
                Gunakan pen untuk melukis aliran haba yang keluar daripada salur darah ke permukaan kulit!
              </div>
            </div>
          `
        },
        {
          pageNumber: 3,
          title: 'Kawal Atur Suhu Badan pada Hari Sejuk',
          subtitle: 'Mengekalkan Suhu Teras 37°C',
          badge: 'Suhu Sejuk',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-8 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative select-none">
              <h3 class="font-headline font-bold text-xl text-slate-900 border-b pb-2">Tindak Balas Badan Apabila Suhu Menurun</h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div class="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center"><strong class="text-xs text-sky-900 block">Otot Rangka</strong><span class="text-[11px] text-slate-600">Mengecut dan mengendur dengan cepat (menggigil) untuk menjana haba.</span></div>
                <div class="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center"><strong class="text-xs text-sky-900 block">Salur Darah</strong><span class="text-[11px] text-slate-600">Mencerut (pemvasocencerutan) untuk mengurangkan kehilangan haba ke persekitaran.</span></div>
                <div class="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center"><strong class="text-xs text-sky-900 block">Bulu Roma</strong><span class="text-[11px] text-slate-600">Menegak untuk memerangkap lapisan udara sebagai penebat haba.</span></div>
              </div>
              <div class="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900">
                Tuliskan nota ringkas: Mengapakah kita kerap kencing pada hari sejuk?
              </div>
            </div>
          `
        },
        {
          pageNumber: 4,
          title: 'Homeostasis Dalam Tumbuhan (Transpirasi)',
          subtitle: 'Peranan Liang Stoma & Sel Pengawal',
          badge: 'Tumbuhan',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-6 sm:p-8 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-sm relative select-none">
              <h3 class="font-headline font-bold text-xl text-slate-900 border-b pb-2">Transpirasi Tumbuhan</h3>
              <p class="text-xs sm:text-sm text-slate-600 my-3 leading-relaxed">
                Tumbuhan mengawal kehilangan air melalui proses <strong>transpirasi</strong> pada liang stoma daun. Pada hari panas terik, sel pengawal menutup stoma untuk mengelakkan tumbuhan daripada layu akibat kehilangan air berlebihan.
              </p>
              <div class="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950">
                <strong>Eksperimen KSSM:</strong> Penggunaan fotometer untuk mengukur kadar penyerapan air oleh pucuk tumbuhan.
              </div>
              <div class="text-xs text-slate-400 mt-4">Tamat Bab 3 Homeostasis. Sila eksport nota anda sebagai rujukan!</div>
            </div>
          `
        }
      ]
    }
  ];

  class SmartNotesManager {
    constructor() {
      this.initStore();
    }

    initStore() {
      try {
        if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
          localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(SEED_SLIDES));
        }
      } catch (e) {
        console.warn('SmartNotes: Gagal menginisialisasi storan tempatan', e);
      }
    }

    getCurrentUserId() {
      try {
        if (global.AuthGuard && typeof global.AuthGuard.getUser === 'function') {
          const u = global.AuthGuard.getUser();
          if (u && u.id) return u.id;
        }
        if (global.Auth && typeof global.Auth.getCurrentUser === 'function') {
          const u = global.Auth.getCurrentUser();
          if (u && u.id) return u.id;
        }
        const raw = sessionStorage.getItem('arselnel_current_user') || localStorage.getItem('arselnel_current_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.id) return parsed.id;
        }
      } catch (_) {}
      return 'guest_student_local';
    }

    isTeacher() {
      try {
        if (global.AuthGuard && typeof global.AuthGuard.isAdmin === 'function') {
          return global.AuthGuard.isAdmin();
        }
        if (global.Auth && typeof global.Auth.isAdmin === 'function') {
          return global.Auth.isAdmin();
        }
      } catch (_) {}
      return false;
    }

    // -------------------------------------------------------------------------
    // TEACHER SLIDE MANAGEMENT (CRUD)
    // -------------------------------------------------------------------------
    async getNotes(filters = {}) {
      let list = [];
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
        if (stored) {
          const parsed = JSON.parse(stored);
          const existingIds = new Set(parsed.map(x => x.id));
          // Prepend missing seed slides so new activities are always accessible
          SEED_SLIDES.forEach(seed => {
            if (!existingIds.has(seed.id)) {
              parsed.unshift(seed);
              existingIds.add(seed.id);
            }
          });
          list = parsed;
        } else {
          list = SEED_SLIDES.slice();
        }
      } catch (_) {
        list = SEED_SLIDES.slice();
      }

      // If Supabase is connected and online, attempt to fetch remote published notes
      try {
        if (global.ARSupabase && typeof global.ARSupabase.getClient === 'function') {
          const client = await global.ARSupabase.getClient();
          if (client) {
            const { data, error } = await client
              .from('learning_notes')
              .select('*')
              .order('created_at', { ascending: false });

            if (!error && Array.isArray(data) && data.length > 0) {
              const remoteMap = new Map();
              data.forEach(item => {
                remoteMap.set(item.id, {
                  id: item.id,
                  title: item.title,
                  chapter: item.chapter,
                  description: item.description,
                  contentType: item.content_type,
                  sourceUrl: item.source_url,
                  storagePath: item.storage_path,
                  slideCount: item.slide_count,
                  slides: Array.isArray(item.slide_data) ? item.slide_data : [],
                  publicationStatus: item.publication_status,
                  createdAt: item.created_at,
                  updatedAt: item.updated_at
                });
              });
              // Merge local + remote
              list.forEach(item => {
                if (!remoteMap.has(item.id)) remoteMap.set(item.id, item);
              });
              list = Array.from(remoteMap.values());
            }
          }
        }
      } catch (err) {
        console.warn('SmartNotes: Menggunakan sandaran nota tempatan', err);
      }

      // Filter by chapter, status, search
      if (filters.chapter && filters.chapter !== 'all') {
        list = list.filter(n => n.chapter === filters.chapter || n.chapter.includes(filters.chapter));
      }
      if (filters.status && filters.status !== 'all') {
        list = list.filter(n => n.publicationStatus === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(n =>
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.description && n.description.toLowerCase().includes(q)) ||
          (n.chapter && n.chapter.toLowerCase().includes(q))
        );
      }
      return list;
    }

    getPublishedNotes() {
      return this.getNotes({ status: 'published' });
    }

    async getNoteById(id) {
      const all = await this.getNotes();
      const found = all.find(n => n.id === id);
      if (found) return found;
      return SEED_SLIDES.find(s => s.id === id) || null;
    }

    async saveNote(noteData) {
      if (!noteData.title || !noteData.chapter) {
        throw new Error('Tajuk nota dan Bab / Topik adalah wajib diisi.');
      }

      let list = [];
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
        list = stored ? JSON.parse(stored) : SEED_SLIDES.slice();
      } catch (_) {
        list = SEED_SLIDES.slice();
      }

      const id = noteData.id || `slide_${Date.now()}`;
      const now = new Date().toISOString();

      const normalized = {
        id,
        title: String(noteData.title).trim(),
        chapter: String(noteData.chapter).trim(),
        description: String(noteData.description || '').trim(),
        contentType: noteData.contentType || 'interactive', // 'pdf' | 'pptx' | 'google_slides' | 'embed' | 'interactive'
        sourceUrl: String(noteData.sourceUrl || '').trim(),
        storagePath: String(noteData.storagePath || '').trim(),
        slideCount: Number(noteData.slideCount) || (noteData.slides ? noteData.slides.length : 1),
        slides: Array.isArray(noteData.slides) && noteData.slides.length > 0 ? noteData.slides : this.generateDefaultSlides(noteData.title, noteData.chapter),
        publicationStatus: noteData.publicationStatus === 'draft' ? 'draft' : 'published',
        createdAt: noteData.createdAt || now,
        updatedAt: now
      };

      const existingIndex = list.findIndex(n => n.id === id);
      if (existingIndex >= 0) {
        list[existingIndex] = { ...list[existingIndex], ...normalized };
      } else {
        list.unshift(normalized);
      }

      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(list));

      // Attempt Supabase sync
      try {
        if (global.ARSupabase && typeof global.ARSupabase.getClient === 'function') {
          const client = await global.ARSupabase.getClient();
          if (client) {
            const { error } = await client.from('learning_notes').upsert({
              id: normalized.id,
              title: normalized.title,
              chapter: normalized.chapter,
              description: normalized.description,
              content_type: normalized.contentType,
              source_url: normalized.sourceUrl,
              storage_path: normalized.storagePath,
              slide_count: normalized.slideCount,
              slide_data: normalized.slides,
              publication_status: normalized.publicationStatus,
              updated_at: normalized.updatedAt
            }, { onConflict: 'id' });

            if (error) {
              console.warn('SmartNotes: Supabase upsert error', error);
              if (error.code === 'PGRST205' || (error.message && error.message.includes('learning_notes'))) {
                throw new Error('Jadual "learning_notes" belum wujud di Supabase. Sila jalankan migrasi SQL di Supabase SQL Editor.');
              }
              throw new Error(`Gagal menyimpan ke Supabase: ${error.message || 'Ralat pangkalan data'}`);
            }
          }
        }
      } catch (e) {
        throw e;
      }

      return normalized;
    }

    async deleteNote(id) {
      let list = [];
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
        list = stored ? JSON.parse(stored) : SEED_SLIDES.slice();
      } catch (_) {
        list = SEED_SLIDES.slice();
      }
      list = list.filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(list));

      try {
        if (global.ARSupabase && typeof global.ARSupabase.getClient === 'function') {
          const client = await global.ARSupabase.getClient();
          if (client) {
            await client.from('learning_notes').delete().eq('id', id);
          }
        }
      } catch (_) {}
      return true;
    }

    async togglePublishStatus(id) {
      const note = await this.getNoteById(id);
      if (!note) return null;
      note.publicationStatus = note.publicationStatus === 'published' ? 'draft' : 'published';
      return await this.saveNote(note);
    }

    generateDefaultSlides(title, chapter) {
      return [
        {
          pageNumber: 1,
          title: title,
          subtitle: `${chapter} • Bahan Slaid Interaktif`,
          badge: 'Slaid 1',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-8 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl relative overflow-hidden select-none">
              <div>
                <span class="px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-teal-200 uppercase">${chapter}</span>
                <h1 class="text-3xl sm:text-4xl font-extrabold mt-4 font-headline text-white">${title}</h1>
                <p class="text-sm text-slate-200 mt-2 max-w-lg">Slaid pembelajaran interaktif disediakan oleh Guru Sains ARSelNel.</p>
              </div>
              <div class="p-4 bg-white/10 rounded-2xl border border-white/10 text-xs text-teal-200">
                Gunakan alat pen dan penyerlah di bar atas untuk membuat anotasi terus di sini.
              </div>
            </div>
          `
        },
        {
          pageNumber: 2,
          title: 'Isi Kandungan & Nota Utama',
          subtitle: 'Fokus Pembelajaran KSSM',
          badge: 'Slaid 2',
          contentHtml: `
            <div class="h-full flex flex-col justify-between p-8 bg-white text-slate-800 rounded-3xl border border-slate-200 select-none">
              <h3 class="font-headline font-bold text-2xl text-slate-900 border-b pb-3">Ringkasan Konsep Utama</h3>
              <div class="space-y-3 my-4 text-sm text-slate-600">
                <p>• Fahami konsep dan istilah utama dalam bab ini.</p>
                <p>• Catatkan pemerhatian dan lakaran rajah berlabel pada ruang kosong ini.</p>
              </div>
              <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-primary font-bold">
                Ruang Anotasi Murid ARSelNel
              </div>
            </div>
          `
        }
      ];
    }

    // -------------------------------------------------------------------------
    // STUDENT ANNOTATION PERSISTENCE (AUTOSAVE & ISOLATION)
    // -------------------------------------------------------------------------
    getAnnotationKey(noteId, pageNumber, studentId = null) {
      const uid = studentId || this.getCurrentUserId();
      return `${STORAGE_KEYS.ANNOTATIONS_PREFIX}${uid}_${noteId}_p${pageNumber}`;
    }

    async getAnnotations(noteId, pageNumber, studentId = null) {
      const uid = studentId || this.getCurrentUserId();
      const localKey = this.getAnnotationKey(noteId, pageNumber, uid);
      let data = null;

      try {
        const stored = localStorage.getItem(localKey);
        if (stored) data = JSON.parse(stored);
      } catch (_) {}

      // Try fetching from Supabase if online and user is logged in
      try {
        if (global.ARSupabase && typeof global.ARSupabase.getClient === 'function') {
          const client = await global.ARSupabase.getClient();
          if (client && uid && !uid.startsWith('guest_')) {
            const { data: remoteData, error } = await client
              .from('student_annotations')
              .select('annotation_data, updated_at')
              .eq('note_id', noteId)
              .eq('student_id', uid)
              .eq('page_number', Number(pageNumber))
              .maybeSingle();

            if (!error && remoteData && remoteData.annotation_data) {
              data = remoteData.annotation_data;
              localStorage.setItem(localKey, JSON.stringify(data));
            }
          }
        }
      } catch (err) {
        console.warn('SmartNotes: Memuat anotasi daripada cache setempat', err);
      }

      return data || { version: '1.0', objects: [] };
    }

    async saveAnnotations(noteId, pageNumber, annotationData, studentId = null) {
      const uid = studentId || this.getCurrentUserId();
      const localKey = this.getAnnotationKey(noteId, pageNumber, uid);
      const safeData = annotationData || { version: '1.0', objects: [] };

      // 1. Instant local persistence
      try {
        localStorage.setItem(localKey, JSON.stringify(safeData));
      } catch (e) {
        console.error('SmartNotes: Gagal menyimpan anotasi ke localStorage', e);
      }

      // 2. Cloud Supabase Sync
      try {
        if (global.ARSupabase && typeof global.ARSupabase.getClient === 'function') {
          const client = await global.ARSupabase.getClient();
          if (client && uid && !uid.startsWith('guest_')) {
            const { error } = await client
              .from('student_annotations')
              .upsert({
                note_id: String(noteId),
                student_id: uid,
                page_number: Number(pageNumber),
                annotation_data: safeData,
                updated_at: new Date().toISOString()
              }, { onConflict: 'note_id,student_id,page_number' });

            if (error) throw error;
          }
        }
        return { success: true, status: 'saved' };
      } catch (err) {
        console.warn('SmartNotes: Cloud sync gagal, anotasi disimpan secara selamat pada peranti', err);
        return { success: true, status: 'local_only', error: err.message };
      }
    }

    // -------------------------------------------------------------------------
    // STUDENT PROGRESS TRACKING
    // -------------------------------------------------------------------------
    async getNoteProgress(noteId, studentId = null) {
      const uid = studentId || this.getCurrentUserId();
      const key = `${STORAGE_KEYS.PROGRESS_PREFIX}${uid}_${noteId}`;
      let page = 1;
      try {
        const stored = localStorage.getItem(key);
        if (stored) page = Number(stored) || 1;
      } catch (_) {}
      return { lastViewedPage: page };
    }

    async saveNoteProgress(noteId, pageNumber, studentId = null) {
      const uid = studentId || this.getCurrentUserId();
      const key = `${STORAGE_KEYS.PROGRESS_PREFIX}${uid}_${noteId}`;
      try {
        localStorage.setItem(key, String(pageNumber));
      } catch (_) {}

      try {
        if (global.ARSupabase && typeof global.ARSupabase.getClient === 'function') {
          const client = await global.ARSupabase.getClient();
          if (client && uid && !uid.startsWith('guest_')) {
            await client.from('student_note_progress').upsert({
              student_id: uid,
              note_id: String(noteId),
              last_viewed_page: Number(pageNumber),
              last_opened_at: new Date().toISOString()
            }, { onConflict: 'student_id,note_id' });
          }
        }
      } catch (_) {}
    }

    // -------------------------------------------------------------------------
    // URL VALIDATOR & SAFE EMBED HANDLING
    // -------------------------------------------------------------------------
    validateGoogleSlidesUrl(rawUrl) {
      if (!rawUrl || typeof rawUrl !== 'string') return { valid: false, error: 'Pautan kosong' };
      const url = rawUrl.trim();
      const match = url.match(/^https:\/\/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/i);
      if (!match || !match[1]) {
        return {
          valid: false,
          error: 'Format URL Google Slides tidak sah. Sila gunakan format: https://docs.google.com/presentation/d/.../edit atau /pub'
        };
      }
      const presentationId = match[1];
      const embedUrl = `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
      const exportPdfUrl = `https://docs.google.com/presentation/d/${presentationId}/export/pdf`;
      return {
        valid: true,
        presentationId,
        embedUrl,
        exportPdfUrl,
        canonicalUrl: url
      };
    }

    validateEmbedUrl(rawUrl) {
      if (!rawUrl || typeof rawUrl !== 'string') return { valid: false, error: 'Pautan kosong' };
      const url = rawUrl.trim();

      // Check if user submitted an <iframe> snippet
      const iframeSrcMatch = url.match(/src=["'](https?:\/\/[^"']+)["']/i);
      const targetUrl = iframeSrcMatch ? iframeSrcMatch[1] : url;

      try {
        const parsed = new URL(targetUrl);
        const trustedDomains = [
          'docs.google.com',
          'slides.google.com',
          'canva.com',
          'www.canva.com',
          'onedrive.live.com',
          'view.officeapps.live.com',
          'slideshare.net',
          'www.slideshare.net',
          'view.genial.ly',
          'genial.ly',
          'www.youtube.com',
          'youtube.com'
        ];

        const isTrusted = trustedDomains.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
        if (!isTrusted) {
          return {
            valid: false,
            error: `Domain "${parsed.hostname}" tidak berada dalam senarai penyedia slaid yang dipercayai (Google Slides, Canva, Microsoft Office 365, Genially, SlideShare).`
          };
        }
        return { valid: true, embedUrl: targetUrl };
      } catch (e) {
        return { valid: false, error: 'Format URL atau kod embed tidak sah.' };
      }
    }
  }

  global.SmartNotes = new SmartNotesManager();
})(window);
