/**
 * ==========================================================================
 * INTERNET RAKYAT - AREA PELANGGAN (CUSTOMER DASHBOARD)
 * Core Application Logic & Interactive Features
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ==========================================
  // 1. TAB NAVIGATION (ACCESSIBLE & KEYBOARD-ENABLED)
  // ==========================================
  var tabs = Array.from(document.querySelectorAll('.tab'));
  var panels = Array.from(document.querySelectorAll('.panel'));

  function activateTab(targetTab) {
    tabs.forEach(function (t) {
      var selected = t === targetTab;
      t.classList.toggle('active', selected);
      t.setAttribute('aria-selected', String(selected));
      t.setAttribute('tabindex', selected ? '0' : '-1');
    });

    panels.forEach(function (panel) {
      panel.classList.toggle('active', panel.id === targetTab.dataset.tab);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activateTab(tab);
    });

    tab.addEventListener('keydown', function (event) {
      var index = tabs.indexOf(tab);
      if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') index = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      else return;

      event.preventDefault();
      tabs[index].focus();
      activateTab(tabs[index]);
    });
  });

  // Header quick link to personal tab
  var accountBtn = document.getElementById('accountBtn');
  if (accountBtn) {
    accountBtn.addEventListener('click', function () {
      var personalTab = document.getElementById('tab-pribadi');
      if (personalTab) {
        activateTab(personalTab);
        personalTab.focus();
      }
    });
  }

  // ==========================================
  // 2. NOTIFICATION DROPDOWN
  // ==========================================
  var notificationBtn = document.getElementById('notificationBtn');
  var notificationPanel = document.getElementById('notificationPanel');

  function closeNotifications() {
    if (!notificationPanel) return;
    notificationPanel.hidden = true;
    if (notificationBtn) {
      notificationBtn.setAttribute('aria-expanded', 'false');
      notificationBtn.classList.remove('is-active');
    }
  }

  if (notificationBtn && notificationPanel) {
    notificationBtn.addEventListener('click', function () {
      var open = notificationPanel.hidden;
      notificationPanel.hidden = !open;
      notificationBtn.setAttribute('aria-expanded', String(open));
      notificationBtn.classList.toggle('is-active', open);
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.notification-wrap')) {
        closeNotifications();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeNotifications();
      }
    });
  }

  // ==========================================
  // 3. RESPONSIVE MOBILE NAVIGATION
  // ==========================================
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');

  if (menuBtn && nav) {
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var targetId = link.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ block: 'start' });
      }
    });
  });

  // ==========================================
  // 4. TOAST NOTIFICATION SYSTEM
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

  // Expose globally if needed
  window.showToast = showToast;

  // ==========================================
  // 5. GENERIC DIALOG HELPER
  // ==========================================
  var infoDialog = document.getElementById('infoDialog');
  var dialogTitle = document.getElementById('dialogTitle');
  var dialogBody = document.getElementById('dialogBody');

  function showDialog(title, content) {
    if (!infoDialog) return;
    if (dialogTitle) dialogTitle.textContent = title;
    if (dialogBody) dialogBody.innerHTML = content;
    infoDialog.showModal();
  }

  if (infoDialog) {
    infoDialog.addEventListener('click', function (event) {
      if (event.target === infoDialog) infoDialog.close();
    });
  }

  var promoBtn = document.getElementById('promoBtn');
  if (promoBtn) {
    promoBtn.addEventListener('click', function () {
      showDialog(
        'Promo Seru Bulan Ini',
        '<p>Promo paket streaming dan hiburan saat ini aktif untuk seluruh pelanggan setia Internet Rakyat. Nikmati kecepatan ekstra hingga 150 Mbps di akhir pekan!</p>'
      );
    });
  }

  var paymentGuideBtn = document.getElementById('paymentGuideBtn');
  if (paymentGuideBtn) {
    paymentGuideBtn.addEventListener('click', function () {
      showDialog(
        'Panduan Pembayaran Internet',
        '<ol><li>Buka aplikasi m-Banking atau e-Wallet favorit Anda (BCA, Mandiri, BRI, GoPay, OVO).</li><li>Pilih menu <b>Bayar Tagihan &gt; Internet</b>.</li><li>Pilih penyedia <b>Internet Rakyat</b> dan masukkan Nomor ID Pelanggan Anda (<b>DV765</b>).</li><li>Pastikan nama tagihan sesuai, lalu konfirmasi pembayaran.</li></ol><p style="margin-top:12px;color:var(--muted);font-size:13px">Pembayaran akan otomatis diverifikasi dalam 1-3 menit.</p>'
      );
    });
  }

  var buyAgainBtn = document.getElementById('buyAgainBtn');
  if (buyAgainBtn) {
    buyAgainBtn.addEventListener('click', function () {
      showToast('Paket IRA 100 Mbps Anda masih aktif 27 hari lagi. Perpanjangan otomatis diaktifkan.');
    });
  }

  // Invoice viewer
  document.querySelectorAll('.btn-inv').forEach(function (button) {
    button.addEventListener('click', function () {
      var item = button.closest('.hist-item');
      if (!item) return;
      var packageName = item.querySelector('h4') ? item.querySelector('h4').textContent : 'Paket IRA';
      var paidDate = item.querySelector('.info small') ? item.querySelector('.info small').textContent : '';
      var priceText = item.querySelector('.price') ? item.querySelector('.price').textContent.trim() : 'Rp 100.000';

      var details = [
        '====================================',
        '       INVOICE INTERNET RAKYAT      ',
        '====================================',
        'No. Transaksi : INV-' + Math.floor(100000 + Math.random() * 900000),
        'ID Pelanggan  : DV765 (Ikhda)',
        'Layanan       : ' + packageName,
        paidDate,
        'Total Bayar   : ' + priceText,
        'Status        : LUNAS (Berhasil)',
        '====================================',
        'Terima kasih telah berlangganan Internet Rakyat!'
      ].join('\n');

      var escaped = details.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      showDialog('Bukti Pembayaran / Invoice', '<pre class="invoice-preview">' + escaped + '</pre>');
    });
  });

  // Filter history
  var box = document.getElementById('filterBox');
  var filterBtn = document.getElementById('filterBtn');
  if (filterBtn && box) {
    filterBtn.addEventListener('click', function () {
      var open = box.classList.toggle('open');
      filterBtn.setAttribute('aria-expanded', String(open));
    });
  }

  var filterMessage = document.getElementById('filterMessage');
  var emptyState = document.getElementById('empty');
  var fromInput = document.getElementById('from');
  var toInput = document.getElementById('to');

  function applyFilter() {
    var from = fromInput ? fromInput.value : '';
    var to = toInput ? toInput.value : '';
    var shown = 0;

    if (from && to && from > to) {
      if (filterMessage) filterMessage.textContent = 'Tanggal awal tidak boleh melewati tanggal akhir.';
      return;
    }
    if (filterMessage) filterMessage.textContent = '';

    document.querySelectorAll('.hist-item').forEach(function (it) {
      var d = it.dataset.date;
      var ok = (!from || d >= from) && (!to || d <= to);
      it.style.display = ok ? 'flex' : 'none';
      if (ok) shown++;
    });

    if (emptyState) {
      emptyState.style.display = shown ? 'none' : 'block';
    }
  }

  var applyBtn = document.getElementById('apply');
  if (applyBtn) applyBtn.addEventListener('click', applyFilter);

  var resetBtn = document.getElementById('reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (fromInput) fromInput.value = '';
      if (toInput) toInput.value = '';
      if (filterMessage) filterMessage.textContent = '';
      applyFilter();
    });
  }

  // ==========================================================================
  // 6. FITUR 1 (AFTER): LIVE STATUS JARINGAN & DIAGNOSTIK
  // ==========================================================================
  var btnCheckNet = document.getElementById('btnCheckNet');
  var pingVal = document.getElementById('pingVal');
  var speedVal = document.getElementById('speedVal');
  var checkText = document.getElementById('checkText');
  var netPulseDot = document.getElementById('netPulseDot');
  var netStatusTitle = document.getElementById('netStatusTitle');
  var netStatusDesc = document.getElementById('netStatusDesc');
  var netBadgeSafe = document.getElementById('netBadgeSafe');
  var networkStatusBar = document.getElementById('networkStatusBar');

  if (btnCheckNet) {
    btnCheckNet.addEventListener('click', function () {
      btnCheckNet.classList.add('is-loading');
      if (checkText) checkText.textContent = 'Mengecek...';
      if (netStatusDesc) netStatusDesc.textContent = 'Melakukan ping diagnostik ke gateway Internet Rakyat & modem ONT...';

      setTimeout(function () {
        var randomPing = Math.floor(Math.random() * 5) + 11;
        var randomSpeed = (98 + Math.random() * 2).toFixed(1);

        if (pingVal) pingVal.textContent = randomPing + ' ms';
        if (speedVal) speedVal.textContent = randomSpeed + ' Mbps';

        btnCheckNet.classList.remove('is-loading');
        if (checkText) checkText.textContent = 'Cek Jaringan';
        if (netStatusDesc) netStatusDesc.textContent = 'Modem ONT fiber aktif. Wilayah Anda bebas dari gangguan massal atau pemeliharaan.';

        showToast('Koneksi stabil! Ping: ' + randomPing + ' ms, Kecepatan: ' + randomSpeed + ' Mbps.');
      }, 900);
    });
  }

  // ==========================================================================
  // 7. FITUR 2 (AFTER): QUICK WIFI MANAGER (SSID & PASSWORD & RESTART)
  // ==========================================================================
  var wifiRealPass = 'rakyat@2026';
  var wifiPassHidden = true;
  var wifiPassDisplay = document.getElementById('wifiPassDisplay');
  var btnTogglePass = document.getElementById('btnTogglePass');
  var passToggleText = document.getElementById('passToggleText');
  var btnCopyPass = document.getElementById('btnCopyPass');

  // Toggle intip password (clean text)
  if (btnTogglePass && wifiPassDisplay) {
    btnTogglePass.addEventListener('click', function () {
      wifiPassHidden = !wifiPassHidden;
      if (wifiPassHidden) {
        wifiPassDisplay.textContent = '••••••••';
        wifiPassDisplay.classList.add('masked');
        if (passToggleText) passToggleText.textContent = 'Lihat';
      } else {
        wifiPassDisplay.textContent = wifiRealPass;
        wifiPassDisplay.classList.remove('masked');
        if (passToggleText) passToggleText.textContent = 'Tutup';
      }
    });
  }

  // Salin password ke clipboard (clean text)
  if (btnCopyPass) {
    btnCopyPass.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(wifiRealPass).then(function () {
          showToast('Kata sandi WiFi "' + wifiRealPass + '" berhasil disalin ke clipboard!');
        }).catch(function () {
          showToast('Kata sandi WiFi: ' + wifiRealPass);
        });
      } else {
        showToast('Kata sandi WiFi: ' + wifiRealPass);
      }
    });
  }

  // Modal: Ubah Nama WiFi (SSID)
  var ssidDialog = document.getElementById('ssidDialog');
  var btnEditSsid = document.getElementById('btnEditSsid');
  var btnCancelSsid = document.getElementById('btnCancelSsid');
  var ssidForm = document.getElementById('ssidForm');
  var ssidInput = document.getElementById('ssidInput');
  var wifiSsidDisplay = document.getElementById('wifiSsidDisplay');

  if (btnEditSsid && ssidDialog) {
    btnEditSsid.addEventListener('click', function () {
      if (ssidInput && wifiSsidDisplay) {
        ssidInput.value = wifiSsidDisplay.textContent;
      }
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
          if (wifiSsidDisplay) wifiSsidDisplay.textContent = newSsid;
          ssidDialog.close();
          showToast('Nama WiFi berhasil diperbarui menjadi "' + newSsid + '".');
        }
      });
    }
  }

  // Modal: Ganti Password WiFi
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

        wifiRealPass = p1;
        if (!wifiPassHidden && wifiPassDisplay) {
          wifiPassDisplay.textContent = wifiRealPass;
        }

        passDialog.close();
        showToast('Kata sandi WiFi baru berhasil disimpan!');
      });
    }
  }

  // Modal: Konfirmasi & Simulasi Restart Modem
  var restartDialog = document.getElementById('restartDialog');
  var btnRestartRouterModal = document.getElementById('btnRestartRouterModal');
  var btnPerangkatRestart = document.getElementById('btnPerangkatRestart');
  var btnCancelRestart = document.getElementById('btnCancelRestart');
  var btnConfirmRestart = document.getElementById('btnConfirmRestart');
  var devRouterStatus = document.getElementById('devRouterStatus');
  var devRouterDot = document.getElementById('devRouterDot');

  function openRestartModal() {
    if (restartDialog) restartDialog.showModal();
  }

  if (btnRestartRouterModal) btnRestartRouterModal.addEventListener('click', openRestartModal);
  if (btnPerangkatRestart) btnPerangkatRestart.addEventListener('click', openRestartModal);

  if (restartDialog) {
    if (btnCancelRestart) {
      btnCancelRestart.addEventListener('click', function () {
        restartDialog.close();
      });
    }

    restartDialog.addEventListener('click', function (e) {
      if (e.target === restartDialog) restartDialog.close();
    });
  }

  if (btnConfirmRestart) {
    btnConfirmRestart.addEventListener('click', function () {
      if (restartDialog) restartDialog.close();

      // Simulasi status restart (yellow warning state)
      if (networkStatusBar) networkStatusBar.classList.add('warning');
      if (netPulseDot) netPulseDot.classList.add('rebooting');
      if (netBadgeSafe) {
        netBadgeSafe.classList.add('rebooting');
        netBadgeSafe.textContent = '🟡 Sedang Reboot';
      }
      if (netStatusTitle) netStatusTitle.textContent = 'Status Jaringan: Modem Memulai Ulang...';
      if (netStatusDesc) netStatusDesc.textContent = 'Modem ONT sedang melakukan booting ulang sistem. Koneksi terputus sementara (10 detik).';
      if (pingVal) pingVal.textContent = '-';
      if (speedVal) speedVal.textContent = '-';

      if (devRouterStatus) {
        devRouterStatus.textContent = 'Rebooting...';
        if (devRouterDot) devRouterDot.className = 'dot off';
      }

      showToast('Memulai reboot modem ONT... Harap tunggu sebentar.');

      // Pemulihan kembali online (green online state)
      setTimeout(function () {
        if (networkStatusBar) networkStatusBar.classList.remove('warning');
        if (netPulseDot) netPulseDot.classList.remove('rebooting');
        if (netBadgeSafe) {
          netBadgeSafe.classList.remove('rebooting');
          netBadgeSafe.textContent = '🟢 Online';
        }
        if (netStatusTitle) netStatusTitle.textContent = 'Status Jaringan: Normal & Terhubung';
        if (netStatusDesc) netStatusDesc.textContent = 'Modem ONT fiber aktif. Wilayah Anda bebas dari gangguan massal atau pemeliharaan.';
        if (pingVal) pingVal.textContent = '12 ms';
        if (speedVal) speedVal.textContent = '99.1 Mbps';

        if (devRouterStatus) {
          devRouterStatus.textContent = 'Online';
          if (devRouterDot) devRouterDot.className = 'dot';
        }

        showToast('Reboot sukses! Modem ONT kembali online dan stabil.');
      }, 3500);
    });
  }
});

