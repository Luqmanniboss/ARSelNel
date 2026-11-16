/**
 * ARSELNEL — MODAL GALERI & CETAK KAD AR KOTAK ARSELNEL (FASA 4E-G.3)
 * Pengurusan Paparan Galeri, Pemilihan Marker, Cetakan A4 & Penjanaan PDF A4
 */

(function () {
  'use strict';

  // Senarai Lengkap 8 Marker Aktif MindAR (Target Index 0 - 7)
  const KOTAK_MARKERS = [
    {
      id: 'marker-video',
      targetIndex: 0,
      muka: 'Muka 1',
      title: 'Video Pembelajaran Sains KSSM',
      category: 'Video Interaktif',
      categoryColor: '#EA580C',
      categoryBg: '#FFEDD5',
      categoryBorder: '#FDBA74',
      icon: 'smart_display',
      image: '../kotak_arselnel/assets/markers/marker-video.png',
      size: '20 × 20 CM',
      description: 'Imbas untuk memainkan video penerangan konsep sel, struktur sel hidup, dan fungsi organel secara interaktif.'
    },
    {
      id: 'marker-nota',
      targetIndex: 1,
      muka: 'Muka 2',
      title: 'Nota & Infografik Interaktif',
      category: 'Nota & Slaid',
      categoryColor: '#0D9488',
      categoryBg: '#CCFBF1',
      categoryBorder: '#5EEAD4',
      icon: 'auto_stories',
      image: '../kotak_arselnel/assets/markers/marker-nota.png',
      size: '20 × 20 CM',
      description: 'Imbas untuk membaca nota sains KSSM Bab 2, ringkasan perbandingan sel, serta slaid maya beranimasi.'
    },
    {
      id: 'marker-kuiz',
      targetIndex: 2,
      muka: 'Muka 3',
      title: 'Kuiz & Cabaran Minda Sains',
      category: 'Kuiz Arked',
      categoryColor: '#7C3AED',
      categoryBg: '#EDE9FE',
      categoryBorder: '#C4B5FD',
      icon: 'sports_esports',
      image: '../kotak_arselnel/assets/markers/marker-kuiz.png',
      size: '20 × 20 CM',
      description: 'Imbas untuk mengaktifkan arked 5 permainan sel: Padanan Sel, Memori Sel, Labirin Organel, Penembak Sel & Cabaran.'
    },
    {
      id: 'marker-sel-haiwan',
      targetIndex: 3,
      muka: 'Muka 4',
      title: 'Model 3D Sel Haiwan (CellQuest)',
      category: 'Model 3D AR',
      categoryColor: '#2563EB',
      categoryBg: '#DBEAFE',
      categoryBorder: '#93C5FD',
      icon: 'biotech',
      image: '../kotak_arselnel/assets/markers/marker-sel-haiwan.png',
      size: '20 × 20 CM',
      description: 'Imbas untuk memunculkan model 3D hologram Sel Haiwan secara realiti terimbuh dengan keupayaan pusingan POV dan ketik organel.'
    },
    {
      id: 'marker-sel-tumbuhan',
      targetIndex: 4,
      muka: 'Muka 5',
      title: 'Model 3D Sel Tumbuhan (CellQuest)',
      category: 'Model 3D AR',
      categoryColor: '#059669',
      categoryBg: '#D1FAE5',
      categoryBorder: '#6EE7B7',
      icon: 'potted_plant',
      image: '../kotak_arselnel/assets/markers/marker-sel-tumbuhan.png',
      size: '20 × 20 CM',
      description: 'Imbas untuk memunculkan model 3D hologram Sel Tumbuhan dengan kloroplas, dinding sel tegar, dan vakuol pusat besar.'
    },
    {
      id: 'marker-jelajah3d',
      targetIndex: 5,
      muka: 'Muka 6',
      title: 'Makmal Eksplorasi 3D Maya',
      category: 'Makmal Sel',
      categoryColor: '#0284C7',
      categoryBg: '#E0F2FE',
      categoryBorder: '#7DD3FC',
      icon: 'explore',
      image: '../kotak_arselnel/assets/markers/marker-jelajah3d.png',
      size: '20 × 20 CM',
      description: 'Imbas untuk meneroka stesen makmal 3D berinteraktif bagi mengenal pasti instrumen mikroskop dan preparasi slaid sains.'
    },
    {
      id: 'marker-orientasi-dunia',
      targetIndex: 6,
      muka: 'Muka 7',
      title: 'AR Orientasi Dunia • Misi Jelajah',
      category: 'Spasial Radar',
      categoryColor: '#9333EA',
      categoryBg: '#F3E8FF',
      categoryBorder: '#D8B4FE',
      icon: 'public',
      image: '../kotak_arselnel/assets/markers/marker-orientasi-dunia.png',
      size: '20 × 20 CM',
      description: 'Imbas untuk memulakan Misi Jelajah Dunia Sel 360° menggunakan sensor kompas dan radar untuk mencari 8 stesen organel fizikal.'
    },
    {
      id: 'marker-selbot',
      targetIndex: 7,
      muka: 'Muka 8',
      title: 'SelBot AI — Pembantu Sains Pintar',
      category: 'SELBOT AI',
      categoryColor: '#0891B2',
      categoryBg: '#CFFAFE',
      categoryBorder: '#67E8F9',
      icon: 'smart_toy',
      image: '../kotak_arselnel/assets/markers/marker-selbot.png',
      size: '20 × 20 CM',
      description: 'Imbas untuk berinteraksi dengan SelBot AI, pembantu pembelajaran sains pintar yang membantu murid memahami konsep sel, fungsi organel dan menjawab soalan secara interaktif.'
    }
  ];

  // State
  const selectedMarkerIds = new Set(KOTAK_MARKERS.map(m => m.id)); // Default: semua dipilih
  const imageCache = new Map();

  function preloadImages() {
    KOTAK_MARKERS.forEach(m => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = m.image;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 600;
          canvas.height = img.naturalHeight || 600;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          imageCache.set(m.id, canvas.toDataURL('image/png'));
        } catch (e) {
          // Fallback ke path terus
        }
      };
    });
  }

  function getBase64Image(marker) {
    if (imageCache.has(marker.id)) {
      return Promise.resolve(imageCache.get(marker.id));
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = marker.image;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 600;
          canvas.height = img.naturalHeight || 600;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          imageCache.set(marker.id, dataUrl);
          resolve(dataUrl);
        } catch (e) {
          resolve(marker.image);
        }
      };
      img.onerror = () => resolve(marker.image);
    });
  }

  function openPrintModal() {
    const backdrop = document.getElementById('ar-print-modal-backdrop');
    if (!backdrop) return;
    backdrop.classList.remove('hidden');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateSelectionUI();
  }

  function closePrintModal() {
    const backdrop = document.getElementById('ar-print-modal-backdrop');
    if (!backdrop) return;
    backdrop.classList.add('hidden');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function toggleMarkerSelection(markerId, forceState) {
    if (forceState !== undefined) {
      if (forceState) selectedMarkerIds.add(markerId);
      else selectedMarkerIds.delete(markerId);
    } else {
      if (selectedMarkerIds.has(markerId)) selectedMarkerIds.delete(markerId);
      else selectedMarkerIds.add(markerId);
    }
    updateSelectionUI();
  }

  function toggleSelectAll(selectAll) {
    if (selectAll) {
      KOTAK_MARKERS.forEach(m => selectedMarkerIds.add(m.id));
    } else {
      selectedMarkerIds.clear();
    }
    updateSelectionUI();
  }

  function updateSelectionUI() {
    const countEl = document.getElementById('marker-selected-count');
    const selectAllCb = document.getElementById('cb-select-all-markers');
    const btnPrint = document.getElementById('btn-print-selected');
    const btnPdf = document.getElementById('btn-download-pdf');

    const total = KOTAK_MARKERS.length;
    const selectedCount = selectedMarkerIds.size;

    if (countEl) {
      countEl.textContent = `${selectedCount} daripada ${total} kad dipilih`;
    }

    if (selectAllCb) {
      selectAllCb.checked = selectedCount === total;
      selectAllCb.indeterminate = selectedCount > 0 && selectedCount < total;
    }

    if (btnPrint) {
      btnPrint.disabled = selectedCount === 0;
      btnPrint.style.opacity = selectedCount === 0 ? '0.5' : '1';
    }

    if (btnPdf) {
      btnPdf.disabled = selectedCount === 0;
      btnPdf.style.opacity = selectedCount === 0 ? '0.5' : '1';
    }

    // Kemaskini kad individu
    KOTAK_MARKERS.forEach(m => {
      const cardEl = document.getElementById(`card-${m.id}`);
      const cbEl = document.getElementById(`cb-${m.id}`);
      const isSelected = selectedMarkerIds.has(m.id);

      if (cbEl) cbEl.checked = isSelected;
      if (cardEl) {
        if (isSelected) {
          cardEl.classList.add('selected');
        } else {
          cardEl.classList.remove('selected');
        }
      }
    });
  }

  function getSelectedMarkers() {
    return KOTAK_MARKERS.filter(m => selectedMarkerIds.has(m.id));
  }

  function printMarkers(markerList) {
    const list = markerList && markerList.length > 0 ? markerList : getSelectedMarkers();
    if (list.length === 0) {
      alert('Sila pilih sekurang-kurangnya satu kad AR untuk dicetak.');
      return;
    }

    const printHost = document.getElementById('ar-print-sheet');
    if (!printHost) return;

    printHost.innerHTML = list.map((m, idx) => `
      <div class="ar-print-page">
        <div class="ar-print-header">
          <div class="ar-print-brand">
            <span class="ar-print-logo">ARSELNEL</span>
            <span class="ar-print-sep">•</span>
            <span class="ar-print-sub">KOTAK ARSELNEL: KAD MARKER RASMI WEBAR</span>
          </div>
          <h2 class="ar-print-card-title">${m.muka}: ${m.title}</h2>
          <div class="ar-print-meta">
            <span class="ar-print-meta-badge">SASARAN INDEX ${m.targetIndex}</span>
            <span class="ar-print-meta-badge">${m.category}</span>
            <span class="ar-print-meta-badge">SAIZ SKALA: ${m.size}</span>
          </div>
        </div>

        <div class="ar-print-cut-zone">
          <div class="ar-print-cut-label">✂️ GARISAN GUNTING KAD MARKER (IKUT BINGKAI LUAR)</div>
          <div class="ar-print-marker-frame">
            <img src="${m.image}" alt="${m.title}" class="ar-print-marker-img" />
          </div>
        </div>

        <div class="ar-print-footer">
          <p class="ar-print-func"><strong>Fungsi Modul:</strong> ${m.description}</p>
          <div class="ar-print-instructions">
            <strong>PANDUAN PENGIMBASAN AR:</strong>
            <ol>
              <li>Gunting mengikut bingkai garisan putus-putus dan lekatkan pada muka kotak fizikal atau kadbod tebal.</li>
              <li>Letakkan kad pada permukaan rata dengan pencahayaan bilik yang sekata (elakkan pantulan lampu).</li>
              <li>Buka <strong>ARSELNEL &gt; CellQuest &gt; Imbas Kotak ARSELNEL</strong> pada telefon atau iPad.</li>
              <li>Halakan kamera tepat ke kad ini (jarak 20-40 cm) untuk memulakan pengalaman AR 3D interaktif.</li>
            </ol>
            <div class="ar-print-tip">💡 Peringatan: Gunakan cetakan berkualiti tinggi dan elakkan kertas yang terlalu berkilat.</div>
          </div>
        </div>
      </div>
    `).join('');

    // Cetak
    window.print();
  }

  async function generateA4Pdf(markerList) {
    const list = markerList && markerList.length > 0 ? markerList : getSelectedMarkers();
    if (list.length === 0) {
      alert('Sila pilih sekurang-kurangnya satu kad AR untuk dimuat turun.');
      return;
    }

    const btnPdf = document.getElementById('btn-download-pdf');
    const originalText = btnPdf ? btnPdf.innerHTML : '';
    if (btnPdf) {
      btnPdf.disabled = true;
      btnPdf.innerHTML = `
        <span class="material-symbols-outlined" style="animation: spin 1s infinite linear;">refresh</span>
        <span>Menjana PDF...</span>
      `;
    }

    try {
      const jsPdfClass = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
      if (!jsPdfClass) {
        throw new Error('Pustaka jsPDF tidak ditemui. Sila gunakan fungsi Cetak Marker (Simpan ke PDF).');
      }

      const doc = new jsPdfClass({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = 210;
      const pageHeight = 297;

      for (let i = 0; i < list.length; i++) {
        const m = list[i];
        if (i > 0) doc.addPage('a4', 'portrait');

        // Header Background bar
        doc.setFillColor(88, 28, 135); // Ungu gelap ARSELNEL (#581C87)
        doc.rect(10, 10, 190, 22, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('ARSELNEL  |  KAD MARKER KOTAK ARSELNEL (A4)', 15, 18);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(233, 213, 255);
        doc.text(`KSSM Sains Tingkatan 1  •  Bab 2 Sel Unit Asas Hidupan  •  MindAR Target Index: ${m.targetIndex}`, 15, 26);

        // Sub-title Card
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`${m.muka}: ${m.title}`, 15, 40);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Kategori: ${m.category}  |  Saiz Asal Disyorkan: ${m.size}  |  Nisbah Aspek: 1:1 Segi Empat Sama`, 15, 46);

        // Marker Cutout Box Guidelines
        // Marker square 130mm x 130mm
        const markerSize = 130;
        const markerX = (pageWidth - markerSize) / 2; // (210 - 130) / 2 = 40mm
        const markerY = 53;

        // Garisan putus-putus pemotongan (Dashed cut frame)
        doc.setDrawColor(148, 163, 184); // Kelabu
        doc.setLineDashPattern([2.5, 2], 0);
        doc.setLineWidth(0.6);
        doc.rect(markerX - 3, markerY - 3, markerSize + 6, markerSize + 6, 'S');

        // Reset line dash
        doc.setLineDashPattern([], 0);

        // Label Gunting
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('✂ GARISAN GUNTING KAD (POTONG MENGIKUT BINGKAI PUTUS-PUTUS)', markerX - 3, markerY - 4.5);

        // Marker Image (High Resolution Base64)
        const base64Data = await getBase64Image(m);
        try {
          doc.addImage(base64Data, 'PNG', markerX, markerY, markerSize, markerSize, undefined, 'FAST');
        } catch (imgErr) {
          console.warn('[PDF] Ralat memasukkan imej marker:', imgErr);
        }

        // Footer & Instruction Box
        const footerY = markerY + markerSize + 8; // ~191mm
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.rect(10, footerY, 190, 84, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text('Penerangan Fungsi Modul:', 15, footerY + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const splitDesc = doc.splitTextToSize(m.description, 180);
        doc.text(splitDesc, 15, footerY + 12);

        // 6 Langkah Penggunaan Pantas
        const guideY = footerY + 22;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(88, 28, 135);
        doc.text('PANDUAN MENCETAK & MENGIMBAS (TINGKATAN 1):', 15, guideY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const steps = [
          '1. Cetak dokumen ini pada helaian A4 dengan skala 100% (Actual Size) tanpa ubah nisbah aspek.',
          '2. Gunting mengikut garisan putus-putus di atas dan lekatkan pada kotak atau kadbod tebal.',
          '3. Pastikan permukaan marker bersih, rata dan tidak terlipat pada kawasan corak imej.',
          '4. Letakkan kad di meja atau ruang dengan pencahayaan terang yang sekata.',
          '5. Buka CellQuest AR & tekan butang "Imbas Kotak ARSELNEL".',
          '6. Halakan kamera telefon/iPad ke kad marker ini untuk memaparkan model interaktif.'
        ];
        steps.forEach((st, idx) => {
          doc.text(st, 15, guideY + 5 + (idx * 4.6));
        });

        // Tip Card Callout
        const tipY = guideY + 36;
        doc.setFillColor(245, 243, 255);
        doc.setDrawColor(221, 214, 254);
        doc.rect(15, tipY, 180, 14, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(109, 40, 217);
        doc.text('PERINGATAN MESRA SAINS:', 18, tipY + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(76, 29, 149);
        doc.text('Untuk hasil pengesanan WebAR terbaik, gunakan cetakan warna yang jelas dan elakkan pantulan cahaya terus.', 18, tipY + 10);
      }

      // Simpan PDF
      doc.save('Kad_AR_Kotak_ARSELNEL.pdf');
    } catch (err) {
      console.error('[KotakMarkerModal] Ralat muat turun PDF:', err);
      alert('Gagal menjana PDF secara langsung. Membuka mod Cetak Pelayar (pilih "Save as PDF").');
      printMarkers(list);
    } finally {
      if (btnPdf) {
        btnPdf.disabled = selectedMarkerIds.size === 0;
        btnPdf.innerHTML = originalText;
      }
    }
  }

  function initListeners() {
    // Butang buka modal pada banner Kotak ARSELNEL
    const btnOpen = document.getElementById('btn-open-print-modal');
    if (btnOpen) {
      btnOpen.addEventListener('click', (e) => {
        e.preventDefault();
        openPrintModal();
      });
    }

    // Butang tutup modal
    const btnClose = document.getElementById('btn-close-print-modal');
    if (btnClose) btnClose.addEventListener('click', closePrintModal);

    const btnCancel = document.getElementById('btn-modal-cancel');
    if (btnCancel) btnCancel.addEventListener('click', closePrintModal);

    // Klik backdrop
    const backdrop = document.getElementById('ar-print-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closePrintModal();
      });
    }

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePrintModal();
    });

    // Checkbox Pilih Semua
    const cbSelectAll = document.getElementById('cb-select-all-markers');
    if (cbSelectAll) {
      cbSelectAll.addEventListener('change', (e) => {
        toggleSelectAll(e.target.checked);
      });
    }

    // Butang Tindakan Toolbar
    const btnPrintSelected = document.getElementById('btn-print-selected');
    if (btnPrintSelected) {
      btnPrintSelected.addEventListener('click', () => printMarkers(getSelectedMarkers()));
    }

    const btnDownloadPdf = document.getElementById('btn-download-pdf');
    if (btnDownloadPdf) {
      btnDownloadPdf.addEventListener('click', () => generateA4Pdf(getSelectedMarkers()));
    }

    // Pasang listeners pada setiap kad marker
    KOTAK_MARKERS.forEach(m => {
      const card = document.getElementById(`card-${m.id}`);
      const cb = document.getElementById(`cb-${m.id}`);
      const btnSinglePrint = document.getElementById(`btn-print-single-${m.id}`);

      if (card) {
        card.addEventListener('click', (e) => {
          // Elakkan double trigger jika klik terus pada checkbox atau butang cetak kad
          if (e.target.closest('input[type="checkbox"]') || e.target.closest('button')) return;
          toggleMarkerSelection(m.id);
        });
      }

      if (cb) {
        cb.addEventListener('change', (e) => {
          toggleMarkerSelection(m.id, e.target.checked);
        });
      }

      if (btnSinglePrint) {
        btnSinglePrint.addEventListener('click', (e) => {
          e.stopPropagation();
          printMarkers([m]);
        });
      }
    });

    // Prapapar imej untuk kecekapan PDF
    preloadImages();
  }

  // Auto initialize apabila DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListeners);
  } else {
    initListeners();
  }

  // Dedahkan API ke window untuk integrasi ujian
  window.KotakMarkerManager = {
    MARKERS: KOTAK_MARKERS,
    openModal: openPrintModal,
    closeModal: closePrintModal,
    toggleMarker: toggleMarkerSelection,
    toggleAll: toggleSelectAll,
    getSelected: getSelectedMarkers,
    print: printMarkers,
    generatePdf: generateA4Pdf
  };

})();
