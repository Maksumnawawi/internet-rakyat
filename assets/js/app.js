/**
 * ==========================================================================
 * INTERNET RAKYAT - AREA PELANGGAN (CUSTOMER DASHBOARD)
 * Core Application Logic & Fully Interactive Features
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // State Management
  var state = {
    wifiSsid: localStorage.getItem('ira_wifi_ssid') || 'InternetRakyat_5G',
    wifiPassword: localStorage.getItem('ira_wifi_password') || 'rakyat@2026',
    wifiPassHidden: true,
    remainingDays: parseInt(localStorage.getItem('ira_pkg_days') || '27', 10),
    selectedPkg: 'Paket IRA Up To 100 Mbps',
    selectedPrice: 250000,
    activePayMethod: 'qris',
    latestTrx: {
      invNo: 'INV-IRA-20261001-0982',
      date: '01 Oktober 2026',
      pkgName: 'Paket IRA Up To 100 Mbps',
      total: 'Rp 250.000',
      method: 'QRIS'
    }
  };

  // Sync initial display from state
  var wifiSsidDisplay = document.getElementById('wifiSsidDisplay');
  var wifiPassDisplay = document.getElementById('wifiPassDisplay');
  var currentPkgDaysBadge = document.getElementById('currentPkgDaysBadge');
  var pkgProgressBar = document.getElementById('pkgProgressBar');

  if (wifiSsidDisplay) wifiSsidDisplay.textContent = state.wifiSsid;
  if (currentPkgDaysBadge) currentPkgDaysBadge.textContent = 'Sisa ' + state.remainingDays + ' Hari';
  if (pkgProgressBar) {
    var pct = Math.min(100, Math.max(10, Math.round((state.remainingDays / 30) * 90)));
    pkgProgressBar.style.width = pct + '%';
  }

  // ==========================================
  // 1. RESPONSIVE SIDEBAR DRAWER & BACKDROP
  // ==========================================
  var sidebarDrawer = document.getElementById('sidebar-drawer');
  var menuBackdrop = document.getElementById('menu-backdrop');
  var menuBtn = document.getElementById('menuBtn');
  var navDrawerCloseBtn = document.getElementById('navDrawerCloseBtn');

  function openSidebar() {
    if (!sidebarDrawer) return;
    sidebarDrawer.classList.add('open');
    if (menuBackdrop) menuBackdrop.classList.add('active');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');
  }
  window.openSidebar = openSidebar;

  function closeSidebar() {
    if (!sidebarDrawer) return;
    sidebarDrawer.classList.remove('open');
    if (menuBackdrop) menuBackdrop.classList.remove('active');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
  }
  window.closeSidebar = closeSidebar;

  if (menuBtn) {
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (sidebarDrawer && sidebarDrawer.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (navDrawerCloseBtn) {
    navDrawerCloseBtn.addEventListener('click', closeSidebar);
  }

  if (menuBackdrop) {
    menuBackdrop.addEventListener('click', closeSidebar);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (sidebarDrawer && sidebarDrawer.classList.contains('open')) closeSidebar();
      closeNotifications();
    }
  });

  // ==========================================
  // 2. TOAST NOTIFICATION SYSTEM
  // ==========================================
  var toast = document.getElementById('toast');
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('visible');
    }, 3600);
  }
  window.showToast = showToast;

  // ==========================================
  // 3. NOTIFICATION DROPDOWN & PANEL
  // ==========================================
  var notificationBtn = document.getElementById('notificationBtn');
  var notificationPanel = document.getElementById('notificationPanel');
  var notificationBackdrop = document.getElementById('notificationBackdrop');

  function openNotifications() {
    if (!notificationPanel) return;
    notificationPanel.hidden = false;
    notificationPanel.classList.add('active');
    if (notificationBackdrop) notificationBackdrop.classList.add('active');
    if (notificationBtn) {
      notificationBtn.setAttribute('aria-expanded', 'true');
      notificationBtn.classList.add('is-active');
    }
  }

  function closeNotifications() {
    if (!notificationPanel) return;
    notificationPanel.hidden = true;
    notificationPanel.classList.remove('active');
    if (notificationBackdrop) notificationBackdrop.classList.remove('active');
    if (notificationBtn) {
      notificationBtn.setAttribute('aria-expanded', 'false');
      notificationBtn.classList.remove('is-active');
    }
  }
  window.closeNotifications = closeNotifications;

  if (notificationBtn && notificationPanel) {
    notificationBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (notificationPanel.classList.contains('active')) {
        closeNotifications();
      } else {
        openNotifications();
      }
    });
  }

  // ==========================================
  // 4. DIAGNOSTIK & CEK JARINGAN
  // ==========================================
  var btnCheckNet = document.getElementById('btnCheckNet');
  var pingVal = document.getElementById('pingVal');
  var speedVal = document.getElementById('speedVal');
  var checkText = document.getElementById('checkText');
  var netStatusDesc = document.getElementById('netStatusDesc');

  if (btnCheckNet) {
    btnCheckNet.addEventListener('click', function () {
      btnCheckNet.disabled = true;
      if (checkText) checkText.textContent = 'Mengecek...';
      if (netStatusDesc) netStatusDesc.textContent = 'Melakukan ping diagnostik ke gateway Internet Rakyat & modem ONT...';

      setTimeout(function () {
        var randomPing = Math.floor(Math.random() * 4) + 12;
        var randomSpeed = (98 + Math.random() * 1.8).toFixed(1);

        if (pingVal) pingVal.textContent = randomPing + ' ms';
        if (speedVal) speedVal.textContent = randomSpeed + ' Mbps';

        btnCheckNet.disabled = false;
        if (checkText) checkText.textContent = 'Cek Jaringan';
        if (netStatusDesc) netStatusDesc.textContent = 'Modem ONT fiber aktif. Wilayah Anda bebas dari gangguan massal atau pemeliharaan.';

        showToast('Koneksi stabil! Latensi: ' + randomPing + ' ms, Kecepatan: ' + randomSpeed + ' Mbps.');
      }, 800);
    });
  }

  // ==========================================
  // 5. KELOLA WIFI RUMAH (SSID, PASSWORD, COPY, TOGGLE)
  // ==========================================
  var btnTogglePass = document.getElementById('btnTogglePass');
  var passToggleText = document.getElementById('passToggleText');
  var btnCopyPass = document.getElementById('btnCopyPass');

  // Toggle intip kata sandi
  if (btnTogglePass && wifiPassDisplay) {
    btnTogglePass.addEventListener('click', function () {
      state.wifiPassHidden = !state.wifiPassHidden;
      if (state.wifiPassHidden) {
        wifiPassDisplay.textContent = '••••••••';
        wifiPassDisplay.classList.add('masked');
        if (passToggleText) passToggleText.textContent = 'Lihat';
      } else {
        wifiPassDisplay.textContent = state.wifiPassword;
        wifiPassDisplay.classList.remove('masked');
        if (passToggleText) passToggleText.textContent = 'Tutup';
      }
    });
  }

  // Salin kata sandi ke clipboard
  if (btnCopyPass) {
    btnCopyPass.addEventListener('click', function () {
      var passToCopy = state.wifiPassword;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(passToCopy).then(function () {
          showToast('✓ Kata sandi WiFi "' + passToCopy + '" berhasil disalin ke clipboard!');
        }).catch(function () {
          showToast('Kata sandi WiFi: ' + passToCopy);
        });
      } else {
        showToast('Kata sandi WiFi: ' + passToCopy);
      }
    });
  }

  // Modal Ubah Nama WiFi (SSID)
  var ssidDialog = document.getElementById('ssidDialog');
  var btnEditSsid = document.getElementById('btnEditSsid');
  var btnCancelSsid = document.getElementById('btnCancelSsid');
  var ssidForm = document.getElementById('ssidForm');
  var ssidInput = document.getElementById('ssidInput');

  if (btnEditSsid && ssidDialog) {
    btnEditSsid.addEventListener('click', function () {
      if (ssidInput) ssidInput.value = state.wifiSsid;
      ssidDialog.showModal();
    });

    if (btnCancelSsid) {
      btnCancelSsid.addEventListener('click', function () {
        ssidDialog.close();
      });
    }

    ssidDialog.addEventListener('click', function (e) {
      if (e.target === ssidDialog) ssidDialog.close();
    });

    if (ssidForm) {
      ssidForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var newSsid = ssidInput ? ssidInput.value.trim() : '';
        if (newSsid.length >= 3) {
          state.wifiSsid = newSsid;
          localStorage.setItem('ira_wifi_ssid', newSsid);
          if (wifiSsidDisplay) wifiSsidDisplay.textContent = newSsid;
          ssidDialog.close();
          showToast('✓ Nama WiFi (SSID) berhasil diubah menjadi "' + newSsid + '".');
        }
      });
    }
  }

  // Modal Ganti Password WiFi
  var passDialog = document.getElementById('passDialog');
  var btnChangePassModal = document.getElementById('btnChangePassModal');
  var btnCancelPass = document.getElementById('btnCancelPass');
  var passForm = document.getElementById('passForm');
  var passInput = document.getElementById('passInput');
  var passConfirmInput = document.getElementById('passConfirmInput');
  var passError = document.getElementById('passError');

  if (btnChangePassModal && passDialog) {
    btnChangePassModal.addEventListener('click', function () {
      if (passInput) passInput.value = '';
      if (passConfirmInput) passConfirmInput.value = '';
      if (passError) passError.style.display = 'none';
      passDialog.showModal();
    });

    if (btnCancelPass) {
      btnCancelPass.addEventListener('click', function () {
        passDialog.close();
      });
    }

    passDialog.addEventListener('click', function (e) {
      if (e.target === passDialog) passDialog.close();
    });

    if (passForm) {
      passForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var p1 = passInput ? passInput.value : '';
        var p2 = passConfirmInput ? passConfirmInput.value : '';

        if (p1.length < 8) {
          if (passError) {
            passError.textContent = 'Kata sandi minimal 8 karakter!';
            passError.style.display = 'block';
          }
          return;
        }

        if (p1 !== p2) {
          if (passError) {
            passError.textContent = 'Konfirmasi kata sandi tidak cocok!';
            passError.style.display = 'block';
          }
          return;
        }

        state.wifiPassword = p1;
        localStorage.setItem('ira_wifi_password', p1);
        if (!state.wifiPassHidden && wifiPassDisplay) {
          wifiPassDisplay.textContent = p1;
        }

        passDialog.close();
        showToast('✓ Kata sandi WiFi baru berhasil disimpan!');
      });
    }
  }

  // ==========================================
  // 6. KONFIRMASI & ANIMASI RESTART MODEM (3 DETIK)
  // ==========================================
  var restartDialog = document.getElementById('restartDialog');
  var restartingModal = document.getElementById('restartingModal');
  var btnRestartRouterModal = document.getElementById('btnRestartRouterModal');
  var btnPerangkatRestart = document.getElementById('btnPerangkatRestart');
  var btnCancelRestart = document.getElementById('btnCancelRestart');
  var btnConfirmRestart = document.getElementById('btnConfirmRestart');

  var restartingStatusText = document.getElementById('restartingStatusText');
  var restartingTimerText = document.getElementById('restartingTimerText');
  var restartProgressBar = document.getElementById('restartProgressBar');

  var networkStatusBar = document.getElementById('networkStatusBar');
  var netPulseDot = document.getElementById('netPulseDot');
  var netBadgeSafe = document.getElementById('netBadgeSafe');
  var netStatusTitle = document.getElementById('netStatusTitle');
  var devRouterStatus = document.getElementById('devRouterStatus');
  var devRouterDot = document.getElementById('devRouterDot');

  function openRestartConfirm() {
    if (restartDialog) restartDialog.showModal();
  }

  if (btnRestartRouterModal) btnRestartRouterModal.addEventListener('click', openRestartConfirm);
  if (btnPerangkatRestart) btnPerangkatRestart.addEventListener('click', openRestartConfirm);

  if (btnCancelRestart && restartDialog) {
    btnCancelRestart.addEventListener('click', function () {
      restartDialog.close();
    });
  }

  if (btnConfirmRestart) {
    btnConfirmRestart.addEventListener('click', function () {
      if (restartDialog) restartDialog.close();
      if (!restartingModal) return;

      restartingModal.showModal();

      // Indikator kuning di background
      if (networkStatusBar) networkStatusBar.classList.add('warning');
      if (netPulseDot) netPulseDot.classList.add('rebooting');
      if (netBadgeSafe) {
        netBadgeSafe.classList.add('rebooting');
        netBadgeSafe.textContent = '🟡 Sedang Reboot';
      }
      if (netStatusTitle) netStatusTitle.textContent = 'Status Jaringan: Modem Memulai Ulang...';
      if (pingVal) pingVal.textContent = '-';
      if (speedVal) speedVal.textContent = '-';
      if (devRouterStatus) {
        devRouterStatus.textContent = 'Rebooting...';
        if (devRouterDot) devRouterDot.className = 'dot off';
      }

      // Progress step 1 (0-1s)
      if (restartProgressBar) restartProgressBar.style.width = '30%';
      if (restartingStatusText) restartingStatusText.textContent = 'Mematikan sinyal radio & reboot firmware router...';
      if (restartingTimerText) restartingTimerText.textContent = '3 detik';

      // Step 2 (1-2s)
      setTimeout(function () {
        if (restartProgressBar) restartProgressBar.style.width = '65%';
        if (restartingStatusText) restartingStatusText.textContent = 'Sinkronisasi koneksi serat optik ONT...';
        if (restartingTimerText) restartingTimerText.textContent = '2 detik';
      }, 1000);

      // Step 3 (2-3s)
      setTimeout(function () {
        if (restartProgressBar) restartProgressBar.style.width = '95%';
        if (restartingStatusText) restartingStatusText.textContent = 'Sinkronisasi selesai! Menghubungkan perangkat...';
        if (restartingTimerText) restartingTimerText.textContent = '1 detik';
      }, 2000);

      // Finish at 3s
      setTimeout(function () {
        if (restartProgressBar) restartProgressBar.style.width = '100%';
        if (restartingStatusText) restartingStatusText.textContent = '✓ Modem berhasil direstart! Jaringan kembali normal.';
        if (restartingTimerText) restartingTimerText.textContent = 'Selesai';

        setTimeout(function () {
          restartingModal.close();

          // Reset network display to green online
          if (networkStatusBar) networkStatusBar.classList.remove('warning');
          if (netPulseDot) netPulseDot.classList.remove('rebooting');
          if (netBadgeSafe) {
            netBadgeSafe.classList.remove('rebooting');
            netBadgeSafe.textContent = '🟢 Online';
          }
          if (netStatusTitle) netStatusTitle.textContent = 'Status Jaringan: Normal & Terhubung';
          if (pingVal) pingVal.textContent = '12 ms';
          if (speedVal) speedVal.textContent = '99.2 Mbps';
          if (devRouterStatus) {
            devRouterStatus.textContent = 'Online';
            if (devRouterDot) devRouterDot.className = 'dot';
          }

          showToast('✓ Modem berhasil direstart dan kembali online!');
        }, 600);
      }, 3000);
    });
  }

  // ==========================================
  // 7. ALUR PEMBELIAN & PERPANJANG ("BELI LAGI" FLOW)
  // ==========================================
  var purchaseModal = document.getElementById('purchaseModal');
  var purchaseStep1 = document.getElementById('purchaseStep1');
  var purchaseStep2 = document.getElementById('purchaseStep2');
  var purchaseStep3 = document.getElementById('purchaseStep3');

  function openPurchaseModal(pkgName, price) {
    if (pkgName) state.selectedPkg = pkgName;
    if (price) state.selectedPrice = price;

    if (purchaseStep1) purchaseStep1.style.display = 'block';
    if (purchaseStep2) purchaseStep2.style.display = 'none';
    if (purchaseStep3) purchaseStep3.style.display = 'none';

    if (purchaseModal) purchaseModal.showModal();
  }
  window.openPurchaseModal = openPurchaseModal;

  function closePurchaseModal() {
    if (purchaseModal) purchaseModal.close();
  }
  window.closePurchaseModal = closePurchaseModal;

  function selectPkgOption(cardEl, pkgName, price) {
    document.querySelectorAll('.pkg-option-card').forEach(function (c) {
      c.classList.remove('selected');
    });
    if (cardEl) cardEl.classList.add('selected');
    state.selectedPkg = pkgName;
    state.selectedPrice = price;
  }
  window.selectPkgOption = selectPkgOption;

  function goToPaymentStep() {
    if (purchaseStep1) purchaseStep1.style.display = 'none';
    if (purchaseStep2) purchaseStep2.style.display = 'block';

    var summaryPkgName = document.getElementById('summaryPkgName');
    var summaryPkgPrice = document.getElementById('summaryPkgPrice');
    var summaryTotal = document.getElementById('summaryTotal');

    var formattedPrice = 'Rp ' + state.selectedPrice.toLocaleString('id-ID');
    if (summaryPkgName) summaryPkgName.textContent = state.selectedPkg;
    if (summaryPkgPrice) summaryPkgPrice.textContent = formattedPrice;
    if (summaryTotal) summaryTotal.textContent = formattedPrice;
  }
  window.goToPaymentStep = goToPaymentStep;

  function backToStep1() {
    if (purchaseStep2) purchaseStep2.style.display = 'none';
    if (purchaseStep1) purchaseStep1.style.display = 'block';
  }
  window.backToStep1 = backToStep1;

  function switchPayMethod(method) {
    state.activePayMethod = method;
    var tabQris = document.getElementById('tabQris');
    var tabVa = document.getElementById('tabVa');
    var payQrisBox = document.getElementById('payQrisBox');
    var payVaBox = document.getElementById('payVaBox');

    if (method === 'qris') {
      if (tabQris) tabQris.classList.add('active');
      if (tabVa) tabVa.classList.remove('active');
      if (payQrisBox) payQrisBox.style.display = 'block';
      if (payVaBox) payVaBox.style.display = 'none';
    } else {
      if (tabVa) tabVa.classList.add('active');
      if (tabQris) tabQris.classList.remove('active');
      if (payVaBox) payVaBox.style.display = 'flex';
      if (payQrisBox) payQrisBox.style.display = 'none';
    }
  }
  window.switchPayMethod = switchPayMethod;

  function copyVaNumber() {
    var va = '8077 0812 3456 7890';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(va.replace(/\s/g, '')).then(function () {
        showToast('✓ Nomor Virtual Account berhasil disalin!');
      });
    } else {
      showToast('Nomor VA: ' + va);
    }
  }
  window.copyVaNumber = copyVaNumber;

  function processPayment() {
    var btnPayConfirm = document.getElementById('btnPayConfirm');
    if (btnPayConfirm) {
      btnPayConfirm.disabled = true;
      btnPayConfirm.textContent = 'Memverifikasi Pembayaran...';
    }

    setTimeout(function () {
      if (btnPayConfirm) {
        btnPayConfirm.disabled = false;
        btnPayConfirm.textContent = 'Bayar Sekarang (Simulasi)';
      }

      // Generate invoice
      var randomTrx = 'INV-IRA-20261118-' + Math.floor(1000 + Math.random() * 9000);
      var today = '18 November 2026';
      var formattedTotal = 'Rp ' + state.selectedPrice.toLocaleString('id-ID');
      var payMethodName = state.activePayMethod === 'qris' ? 'QRIS Instan' : 'Virtual Account';

      state.latestTrx = {
        invNo: randomTrx,
        date: today,
        pkgName: state.selectedPkg,
        total: formattedTotal,
        method: payMethodName
      };

      // Tambahkan +30 Hari pada masa aktif
      state.remainingDays += 30;
      localStorage.setItem('ira_pkg_days', String(state.remainingDays));

      if (currentPkgDaysBadge) currentPkgDaysBadge.textContent = 'Sisa ' + state.remainingDays + ' Hari';
      if (pkgProgressBar) pkgProgressBar.style.width = '95%';

      // Tambahkan baris baru ke Riwayat Pembelian
      addHistoryItem(randomTrx, today, state.selectedPkg, formattedTotal, payMethodName);

      // Tampilkan Step 3 (Layar Sukses)
      var successTrxId = document.getElementById('successTrxId');
      var successPkgName = document.getElementById('successPkgName');
      var successTotal = document.getElementById('successTotal');

      if (successTrxId) successTrxId.textContent = randomTrx;
      if (successPkgName) successPkgName.textContent = state.selectedPkg;
      if (successTotal) successTotal.textContent = formattedTotal;

      if (purchaseStep2) purchaseStep2.style.display = 'none';
      if (purchaseStep3) purchaseStep3.style.display = 'block';

      showToast('✓ Pembayaran berhasil! Paket internet Anda aktif bertambah 30 hari.');
    }, 900);
  }
  window.processPayment = processPayment;

  function addHistoryItem(invNo, date, pkgName, total, method) {
    var historyContainer = document.getElementById('history');
    if (!historyContainer) return;

    var itemHtml = document.createElement('div');
    itemHtml.className = 'hist-item';
    itemHtml.setAttribute('data-date', '2026-11-18');
    itemHtml.innerHTML = [
      '<svg class="logo" viewBox="0 0 64 64" width="44" height="44">',
      '  <circle cx="32" cy="32" r="32" fill="#d90429"/>',
      '  <path d="M15 25a24 24 0 0 1 34 0" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none"/>',
      '  <path d="M21 32a16 16 0 0 1 22 0" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none"/>',
      '  <path d="M27 39a8 8 0 0 1 10 0" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none"/>',
      '  <circle cx="32" cy="47" r="3.5" fill="#ffffff"/>',
      '</svg>',
      '<div class="info">',
      '  <div class="ok"><i>✓</i> Pembayaran Berhasil (Lunas)</div>',
      '  <h4>' + pkgName + '</h4>',
      '  <small>Dibayar pada ' + date + ' via ' + method + '</small>',
      '</div>',
      '<div class="right-col">',
      '  <div class="price">' + total + '</div>',
      '  <button class="btn-inv" type="button" onclick="openInvoiceModal(\'' + invNo + '\', \'' + date + '\', \'' + pkgName + '\', \'' + total + '\', \'' + method + '\')">Lihat Invoice</button>',
      '</div>'
    ].join('\n');

    historyContainer.insertBefore(itemHtml, historyContainer.firstChild);
  }

  function showLatestInvoice() {
    closePurchaseModal();
    openInvoiceModal(
      state.latestTrx.invNo,
      state.latestTrx.date,
      state.latestTrx.pkgName,
      state.latestTrx.total,
      state.latestTrx.method
    );
  }
  window.showLatestInvoice = showLatestInvoice;

  // ==========================================
  // 8. MODAL INVOICE RESMI INTERNET RAKYAT
  // ==========================================
  var invoiceModal = document.getElementById('invoiceModal');

  function openInvoiceModal(invNo, date, pkgName, total, method) {
    if (!invoiceModal) return;

    var invNoDisplay = document.getElementById('invNoDisplay');
    var invDateDisplay = document.getElementById('invDateDisplay');
    var invMethodDisplay = document.getElementById('invMethodDisplay');
    var invTablePkgName = document.getElementById('invTablePkgName');
    var invTableSubtotal = document.getElementById('invTableSubtotal');
    var invTableTax = document.getElementById('invTableTax');
    var invTableTotal = document.getElementById('invTableTotal');

    if (invNoDisplay) invNoDisplay.textContent = invNo || 'INV-IRA-20261001-0982';
    if (invDateDisplay) invDateDisplay.textContent = date || '01 Oktober 2026';
    if (invMethodDisplay) invMethodDisplay.textContent = method || 'QRIS Instan';
    if (invTablePkgName) invTablePkgName.textContent = pkgName || 'Paket IRA Up To 100 Mbps';
    if (invTableTotal) invTableTotal.textContent = total || 'Rp 250.000';

    // Rincian PPN 11%
    var numericPrice = parseInt(String(total || '250000').replace(/\D/g, ''), 10) || 250000;
    var subtotal = Math.round(numericPrice / 1.11);
    var tax = numericPrice - subtotal;

    if (invTableSubtotal) invTableSubtotal.textContent = 'Rp ' + subtotal.toLocaleString('id-ID');
    if (invTableTax) invTableTax.textContent = 'Rp ' + tax.toLocaleString('id-ID');

    invoiceModal.showModal();
  }
  window.openInvoiceModal = openInvoiceModal;

  function closeInvoiceModal() {
    if (invoiceModal) invoiceModal.close();
  }
  window.closeInvoiceModal = closeInvoiceModal;

  function printInvoice() {
    window.print();
  }
  window.printInvoice = printInvoice;

  // Generic Dialog Handlers (Promo & Panduan Bayar)
  var infoDialog = document.getElementById('infoDialog');
  var dialogTitle = document.getElementById('dialogTitle');
  var dialogBody = document.getElementById('dialogBody');

  function showDialog(title, content) {
    if (!infoDialog) return;
    if (dialogTitle) dialogTitle.textContent = title;
    if (dialogBody) dialogBody.innerHTML = content;
    infoDialog.showModal();
  }

  var promoBtn = document.getElementById('promoBtn');
  if (promoBtn) {
    promoBtn.addEventListener('click', function () {
      showDialog(
        'Promo Seru Bulan Ini',
        '<p>Promo paket streaming dan hiburan saat ini aktif untuk seluruh pelanggan setia Internet Rakyat. Nikmati add-on Vidio & Catchplay+ gratis selama 3 bulan pertama!</p><div style="margin-top:14px;padding:12px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;"><strong style="color:#d90429;">Klaim Promo via Call Center:</strong><br>Hubungi 1500-IRA atau chat WhatsApp CS kami.</div>'
      );
    });
  }

  var paymentGuideBtn = document.getElementById('paymentGuideBtn');
  if (paymentGuideBtn) {
    paymentGuideBtn.addEventListener('click', function () {
      showDialog(
        'Panduan Cara Bayar Tagihan',
        '<ol style="line-height:1.7;margin-top:8px;"><li>Buka aplikasi m-Banking atau E-Wallet favorit Anda (BCA Mobile, Livin Mandiri, BRImo, GoPay, OVO, ShopeePay).</li><li>Pilih menu <b>Bayar / Tagihan &gt; Internet</b>.</li><li>Pilih penyedia layanan <b>Internet Rakyat</b>.</li><li>Masukkan Nomor ID Pelanggan Anda: <b>DV737</b>.</li><li>Periksa nama pelanggan dan jumlah tagihan, lalu konfirmasi pembayaran dengan PIN.</li></ol><p style="margin-top:12px;color:#15803d;font-size:13px;font-weight:700;">✓ Tagihan otomatis terkonfirmasi lunas dalam 1–2 menit.</p>'
      );
    });
  }

  // Filter Riwayat Pembelian
  var filterBtn = document.getElementById('filterBtn');
  var filterBox = document.getElementById('filterBox');
  var filterMessage = document.getElementById('filterMessage');
  var emptyState = document.getElementById('empty');
  var fromInput = document.getElementById('from');
  var toInput = document.getElementById('to');
  var applyBtn = document.getElementById('apply');
  var resetBtn = document.getElementById('reset');

  if (filterBtn && filterBox) {
    filterBtn.addEventListener('click', function () {
      var isOpen = filterBox.classList.toggle('open');
      filterBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', function () {
      var from = fromInput ? fromInput.value : '';
      var to = toInput ? toInput.value : '';
      var count = 0;

      if (from && to && from > to) {
        if (filterMessage) filterMessage.textContent = 'Tanggal awal tidak boleh melewati tanggal akhir.';
        return;
      }
      if (filterMessage) filterMessage.textContent = '';

      document.querySelectorAll('.hist-item').forEach(function (el) {
        var d = el.getAttribute('data-date');
        var ok = (!from || d >= from) && (!to || d <= to);
        el.style.display = ok ? 'flex' : 'none';
        if (ok) count++;
      });

      if (emptyState) emptyState.style.display = count === 0 ? 'block' : 'none';
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (fromInput) fromInput.value = '';
      if (toInput) toInput.value = '';
      if (filterMessage) filterMessage.textContent = '';
      document.querySelectorAll('.hist-item').forEach(function (el) {
        el.style.display = 'flex';
      });
      if (emptyState) emptyState.style.display = 'none';
    });
  }

  // ==========================================
  // 9. SINKRONISASI USER DARI LOCALSTORAGE
  // ==========================================
  try {
    var savedUser = JSON.parse(localStorage.getItem('ira_active_user') || 'null');
    var targetName = savedUser && savedUser.nama ? savedUser.nama : 'Masum Nawawi';
    var targetId = savedUser && savedUser.idPelanggan ? savedUser.idPelanggan : 'DV737';

    var nameDisplay = document.getElementById('userNameDisplay');
    var userAvatar = document.getElementById('userAvatar');
    var idDisplay = document.getElementById('userIdDisplay');
    var drawerUserName = document.getElementById('drawerUserName');
    var drawerAvatar = document.getElementById('drawerAvatar');
    var drawerUserId = document.getElementById('drawerUserId');

    if (nameDisplay) nameDisplay.textContent = targetName;
    if (userAvatar) userAvatar.textContent = targetName.charAt(0).toUpperCase();
    if (idDisplay) idDisplay.textContent = 'ID: ' + targetId;

    if (drawerUserName) drawerUserName.textContent = targetName;
    if (drawerAvatar) drawerAvatar.textContent = targetName.charAt(0).toUpperCase();
    if (drawerUserId) drawerUserId.textContent = 'ID: ' + targetId;
  } catch (e) {
    console.warn('Sync user error:', e);
  }
});
