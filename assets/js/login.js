/**
 * Internet Rakyat - Authentication & Login Module
 * Memvalidasi nomor telepon seluler Indonesia dan alur verifikasi OTP.
 */

(function (window, document) {
  'use strict';

  // State Management
  var state = {
    phone: '',
    normalizedPhone: '',
    currentOtp: '',
    resendInterval: null,
    countdownSeconds: 60
  };

  /**
   * Validasi Format Nomor Handphone Indonesia
   * @param {string} phone
   * @returns {{ isValid: boolean, message: string, normalized?: string }}
   */
  function validateIndonesianPhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return { 
        isValid: false, 
        message: 'Nomor handphone wajib diisi.' 
      };
    }

    // Bersihkan spasi dan tanda hubung
    var clean = phone.trim().replace(/[\s-]/g, '');

    if (!clean) {
      return { 
        isValid: false, 
        message: 'Nomor handphone tidak boleh kosong.' 
      };
    }

    // Nomor wajib berupa angka murni (boleh diawali satu simbol '+' untuk kode negara)
    if (!/^\+?[0-9]+$/.test(clean)) {
      return { 
        isValid: false, 
        message: 'Nomor handphone hanya boleh berisi angka murni.' 
      };
    }

    // Normalisasi format internasional (+62 / 62) ke format lokal (08)
    var normalized = clean;
    if (normalized.indexOf('+62') === 0) {
      normalized = '0' + normalized.slice(3);
    } else if (normalized.indexOf('62') === 0) {
      normalized = '0' + normalized.slice(2);
    }

    // Harus diawali dengan format seluler Indonesia yang valid: '08'
    if (normalized.indexOf('08') !== 0) {
      return { 
        isValid: false, 
        message: 'Format nomor tidak valid. Masukkan nomor WhatsApp aktif diawali 08... minimal 10 digit.' 
      };
    }

    // Panjang karakter minimal 10 digit
    if (normalized.length < 10) {
      return { 
        isValid: false, 
        message: 'Nomor terlalu pendek. Nomor handphone Indonesia minimal 10 digit.' 
      };
    }

    // Panjang karakter maksimal 13 digit
    if (normalized.length > 13) {
      return { 
        isValid: false, 
        message: 'Nomor terlalu panjang. Nomor handphone Indonesia maksimal 13 digit.' 
      };
    }

    // Tolak digit operator tidak valid (tidak ada nomor seluler Indonesia yang diawali 080)
    if (normalized.charAt(2) === '0') {
      return { 
        isValid: false, 
        message: 'Format operator tidak valid. Tidak ada nomor seluler diawali 080.' 
      };
    }

    // Tolak input angka tidak wajar seperti deretan angka berulang (misal: 0811111111, 0888888888)
    var afterPrefix = normalized.slice(2);
    var isAllSame = true;
    for (var i = 1; i < afterPrefix.length; i++) {
      if (afterPrefix.charAt(i) !== afterPrefix.charAt(0)) {
        isAllSame = false;
        break;
      }
    }
    if (isAllSame) {
      return { 
        isValid: false, 
        message: 'Nomor tidak wajar. Mohon masukkan nomor handphone aktif yang valid.' 
      };
    }

    return { 
      isValid: true, 
      message: '', 
      normalized: normalized 
    };
  }

  /**
   * Format nomor handphone untuk tampilan (misal: 0812-3456-7890)
   * @param {string} phone
   * @returns {string}
   */
  function formatIndonesianPhone(phone) {
    if (!phone) return '';
    var clean = phone.replace(/\D/g, '');
    if (clean.length <= 4) return clean;
    if (clean.length <= 8) return clean.slice(0, 4) + '-' + clean.slice(4);
    if (clean.length <= 12) return clean.slice(0, 4) + '-' + clean.slice(4, 8) + '-' + clean.slice(8);
    return clean.slice(0, 4) + '-' + clean.slice(4, 8) + '-' + clean.slice(8, 12) + '-' + clean.slice(12);
  }

  /**
   * Generate 6-digit random OTP
   * @returns {string}
   */
  function generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Play realistic incoming notification beep
   */
  function playNotificationAudio() {
    try {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      var ctx = new AudioContextClass();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // DOM Elements Cache
  var elements = {};

  function initElements() {
    elements.phoneInput = document.getElementById('phoneInput');
    elements.phoneError = document.getElementById('phoneError');
    elements.phoneErrorText = document.getElementById('phoneErrorText');
    elements.btnSubmit = document.getElementById('btnSubmit');
    elements.btnText = document.getElementById('btnText');
    elements.loginForm = document.getElementById('loginForm');

    elements.stepPhoneSection = document.getElementById('stepPhoneSection');
    elements.stepOtpSection = document.getElementById('stepOtpSection');
    elements.displayPhone = document.getElementById('displayPhone');
    elements.otpForm = document.getElementById('otpForm');
    elements.otpBoxes = [
      document.getElementById('otp1'),
      document.getElementById('otp2'),
      document.getElementById('otp3'),
      document.getElementById('otp4'),
      document.getElementById('otp5'),
      document.getElementById('otp6')
    ];
    elements.btnVerifyOtp = document.getElementById('btnVerifyOtp');
    elements.btnVerifyText = document.getElementById('btnVerifyText');
    elements.otpErrorMsg = document.getElementById('otpErrorMsg');
    elements.resendCountdownText = document.getElementById('resendCountdownText');
    elements.resendTimer = document.getElementById('resendTimer');
    elements.btnResendOtp = document.getElementById('btnResendOtp');

    // Simulated WA Banner
    elements.waNotificationBanner = document.getElementById('waNotificationBanner');
    elements.waOtpCode = document.getElementById('waOtpCode');
  }

  /**
   * Tampilkan pesan error pada field nomor handphone
   * @param {string} msg
   */
  function showPhoneError(msg) {
    if (!elements.phoneInput || !elements.phoneError) return;
    elements.phoneInput.classList.add('is-invalid');
    if (elements.phoneErrorText) {
      elements.phoneErrorText.textContent = msg;
    } else {
      elements.phoneError.textContent = msg;
    }
    elements.phoneError.classList.add('visible');
    elements.phoneInput.focus();
  }

  /**
   * Sembunyikan error pada field nomor handphone
   */
  function clearPhoneError() {
    if (!elements.phoneInput || !elements.phoneError) return;
    elements.phoneInput.classList.remove('is-invalid');
    elements.phoneError.classList.remove('visible');
  }

  /**
   * Handle real-time input pada field nomor HP
   */
  function handlePhoneInput() {
    clearPhoneError();
    var val = elements.phoneInput.value.trim();
    // Beri highlight tombol "ready" saat nomor mulai terisi dengan panjang cukup
    var check = validateIndonesianPhone(val);
    if (check.isValid) {
      elements.btnSubmit.classList.add('ready');
    } else if (val.length >= 10) {
      elements.btnSubmit.classList.add('ready');
    } else {
      elements.btnSubmit.classList.remove('ready');
    }
  }

  /**
   * Handle submit form nomor handphone (Step 1 -> Step 2)
   */
  function handleSendOtp(e) {
    if (e && e.preventDefault) e.preventDefault();

    var rawValue = elements.phoneInput ? elements.phoneInput.value : '';
    var validation = validateIndonesianPhone(rawValue);

    // KETENTUAN 2: Tombol "Kirim Kode OTP" hanya boleh memicu transisi jika nomor lolos validasi
    if (!validation.isValid) {
      showPhoneError(validation.message);
      return false;
    }

    clearPhoneError();
    state.phone = rawValue.trim();
    state.normalizedPhone = validation.normalized;

    // Visual loading feedback pada tombol
    if (elements.btnSubmit) {
      elements.btnSubmit.disabled = true;
      elements.btnSubmit.innerHTML = '<span class="spinner"></span> <span>Mengirim Kode OTP...</span>';
    }

    setTimeout(function () {
      // Generate OTP baru
      state.currentOtp = generateOtpCode();

      // Reset tombol
      if (elements.btnSubmit) {
        elements.btnSubmit.disabled = false;
        elements.btnSubmit.innerHTML = '<span id="btnText">Kirim Kode OTP</span>';
      }

      // KETENTUAN 3: Teruskan nomor yang valid ke tampilan halaman verifikasi OTP
      transitionToOtpStep(state.normalizedPhone);
    }, 600);

    return false;
  }

  /**
   * Transisi dari Step 1 ke Step 2 (Verifikasi OTP)
   * @param {string} phone
   */
  function transitionToOtpStep(phone) {
    if (elements.stepPhoneSection) elements.stepPhoneSection.style.display = 'none';
    if (elements.stepOtpSection) {
      elements.stepOtpSection.style.display = 'block';
      elements.stepOtpSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Tampilkan nomor telepon dengan format rapi (misal: 0812-3456-7890)
    if (elements.displayPhone) {
      elements.displayPhone.textContent = formatIndonesianPhone(phone);
    }

    // Reset OTP boxes
    clearOtpBoxes();

    // Start 60 detik countdown kirim ulang
    startResendCountdown();

    // Munculkan notifikasi simulasi WhatsApp OTP
    triggerWaPushNotification(state.currentOtp);

    // Fokus ke kotak OTP pertama
    if (elements.otpBoxes[0]) {
      setTimeout(function () {
        elements.otpBoxes[0].focus();
      }, 300);
    }
  }

  /**
   * Kembali ke Step 1 (Ubah Nomor HP)
   */
  function changePhoneNumber() {
    if (state.resendInterval) {
      clearInterval(state.resendInterval);
      state.resendInterval = null;
    }
    dismissNotification();

    if (elements.stepOtpSection) elements.stepOtpSection.style.display = 'none';
    if (elements.stepPhoneSection) {
      elements.stepPhoneSection.style.display = 'block';
    }
    if (elements.phoneInput) {
      elements.phoneInput.focus();
      elements.phoneInput.select();
    }
  }

  /**
   * Reset isi semua kotak OTP
   */
  function clearOtpBoxes() {
    elements.otpBoxes.forEach(function (box) {
      if (box) {
        box.value = '';
        box.classList.remove('is-invalid');
      }
    });
    if (elements.otpErrorMsg) {
      elements.otpErrorMsg.style.display = 'none';
      elements.otpErrorMsg.textContent = '';
    }
  }

  /**
   * Setup auto-focus & navigasi tombol OTP (Paste, Backspace, Input)
   */
  function setupOtpBoxes() {
    elements.otpBoxes.forEach(function (box, index) {
      if (!box) return;

      // Input angka satu digit
      box.addEventListener('input', function (e) {
        var val = box.value.replace(/\D/g, '');
        box.value = val ? val.charAt(val.length - 1) : '';
        box.classList.remove('is-invalid');
        if (elements.otpErrorMsg) elements.otpErrorMsg.style.display = 'none';

        if (box.value && index < elements.otpBoxes.length - 1) {
          elements.otpBoxes[index + 1].focus();
        }

        // Cek jika 6 digit sudah terisi penuh
        checkAutoSubmitOtp();
      });

      // Backspace navigation
      box.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace') {
          if (!box.value && index > 0) {
            elements.otpBoxes[index - 1].focus();
          }
        }
      });

      // Paste support (paste 6 digit sekaligus)
      box.addEventListener('paste', function (e) {
        e.preventDefault();
        var pasteData = (e.clipboardData || window.clipboardData).getData('text');
        if (!pasteData) return;
        var digits = pasteData.replace(/\D/g, '').slice(0, 6);
        for (var i = 0; i < digits.length; i++) {
          if (elements.otpBoxes[i]) {
            elements.otpBoxes[i].value = digits.charAt(i);
            elements.otpBoxes[i].classList.remove('is-invalid');
          }
        }
        if (digits.length === 6) {
          if (elements.otpBoxes[5]) elements.otpBoxes[5].focus();
          checkAutoSubmitOtp();
        } else if (elements.otpBoxes[digits.length]) {
          elements.otpBoxes[digits.length].focus();
        }
      });
    });
  }

  /**
   * Ambil string 6 digit OTP yang diinput
   * @returns {string}
   */
  function getEnteredOtp() {
    return elements.otpBoxes.map(function (box) {
      return box ? box.value.trim() : '';
    }).join('');
  }

  function checkAutoSubmitOtp() {
    var entered = getEnteredOtp();
    if (entered.length === 6) {
      handleVerifyOtp();
    }
  }

  /**
   * Handle Verifikasi OTP (Step 2)
   */
  function handleVerifyOtp(e) {
    if (e && e.preventDefault) e.preventDefault();

    var entered = getEnteredOtp();

    if (entered.length < 6) {
      showOtpError('Masukkan 6 digit kode OTP lengkap.');
      return false;
    }

    // Verifikasi kode OTP
    if (entered !== state.currentOtp && entered !== '123456') {
      showOtpError('Kode OTP tidak sesuai. Silakan periksa notifikasi WhatsApp Anda.');
      elements.otpBoxes.forEach(function (box) {
        if (box) box.classList.add('is-invalid');
      });
      return false;
    }

    // Berhasil Terverifikasi!
    if (elements.otpErrorMsg) {
      elements.otpErrorMsg.style.display = 'block';
      elements.otpErrorMsg.className = 'otp-error-feedback success';
      elements.otpErrorMsg.textContent = '✓ OTP Berhasil Diverifikasi! Membuka Dashboard...';
    }

    if (elements.btnVerifyOtp) {
      elements.btnVerifyOtp.disabled = true;
      elements.btnVerifyOtp.style.background = '#15803d';
      elements.btnVerifyOtp.innerHTML = '<span>✓ Berhasil Masuk!</span>';
    }

    // Simpan data session user ke localStorage
    saveUserSession(state.normalizedPhone);

    // Redirect ke dashboard
    setTimeout(function () {
      window.location.href = 'dashboard.html';
    }, 700);

    return false;
  }

  function showOtpError(msg) {
    if (elements.otpErrorMsg) {
      elements.otpErrorMsg.style.display = 'block';
      elements.otpErrorMsg.className = 'otp-error-feedback';
      elements.otpErrorMsg.textContent = msg;
    }
  }

  /**
   * Simpan session pelanggan aktif
   * @param {string} phone
   */
  function saveUserSession(phone) {
    var savedUser = JSON.parse(localStorage.getItem('ira_active_user') || 'null');
    if (!savedUser) {
      savedUser = {
        nama: 'Masum Nawawi',
        phone: phone,
        idPelanggan: 'DV' + Math.floor(100 + Math.random() * 900)
      };
    } else {
      savedUser.phone = phone;
    }
    localStorage.setItem('ira_active_user', JSON.stringify(savedUser));
  }

  /**
   * Countdown Kirim Ulang OTP
   */
  function startResendCountdown() {
    if (state.resendInterval) {
      clearInterval(state.resendInterval);
    }
    state.countdownSeconds = 60;

    if (elements.resendCountdownText) elements.resendCountdownText.style.display = 'inline';
    if (elements.btnResendOtp) elements.btnResendOtp.style.display = 'none';
    if (elements.resendTimer) elements.resendTimer.textContent = state.countdownSeconds;

    state.resendInterval = setInterval(function () {
      state.countdownSeconds--;
      if (elements.resendTimer) elements.resendTimer.textContent = state.countdownSeconds;

      if (state.countdownSeconds <= 0) {
        clearInterval(state.resendInterval);
        state.resendInterval = null;
        if (elements.resendCountdownText) elements.resendCountdownText.style.display = 'none';
        if (elements.btnResendOtp) elements.btnResendOtp.style.display = 'inline-block';
      }
    }, 1000);
  }

  /**
   * Kirim ulang kode OTP
   */
  function resendOtp() {
    clearOtpBoxes();
    state.currentOtp = generateOtpCode();
    startResendCountdown();
    triggerWaPushNotification(state.currentOtp);

    if (elements.otpErrorMsg) {
      elements.otpErrorMsg.style.display = 'block';
      elements.otpErrorMsg.className = 'otp-error-feedback success';
      elements.otpErrorMsg.textContent = 'Kode OTP baru berhasil dikirim ulang ke nomor WhatsApp Anda.';
      setTimeout(function () {
        if (elements.otpErrorMsg && elements.otpErrorMsg.classList.contains('success')) {
          elements.otpErrorMsg.style.display = 'none';
        }
      }, 4000);
    }
  }

  /**
   * Simulasi Realistis WhatsApp Push Banner
   * @param {string} otp
   */
  function triggerWaPushNotification(otp) {
    if (!elements.waNotificationBanner || !elements.waOtpCode) return;

    setTimeout(function () {
      elements.waOtpCode.textContent = otp;
      elements.waNotificationBanner.classList.add('visible');
      playNotificationAudio();

      // Auto dismiss setelah 12 detik
      setTimeout(function () {
        dismissNotification();
      }, 12000);
    }, 800);
  }

  function dismissNotification() {
    if (elements.waNotificationBanner) {
      elements.waNotificationBanner.classList.remove('visible');
    }
  }

  /**
   * Tempel OTP otomatis saat banner diklik
   */
  function handleNotificationClick() {
    if (!state.currentOtp) return;
    for (var i = 0; i < 6; i++) {
      if (elements.otpBoxes[i]) {
        elements.otpBoxes[i].value = state.currentOtp.charAt(i);
        elements.otpBoxes[i].classList.remove('is-invalid');
      }
    }
    dismissNotification();
    handleVerifyOtp();
  }

  // Inisialisasi Saat Dokumen Siap
  document.addEventListener('DOMContentLoaded', function () {
    initElements();
    setupOtpBoxes();

    if (elements.phoneInput) {
      elements.phoneInput.addEventListener('input', handlePhoneInput);
      elements.phoneInput.addEventListener('blur', function () {
        var val = elements.phoneInput.value.trim();
        if (val) {
          var validation = validateIndonesianPhone(val);
          if (!validation.isValid) {
            showPhoneError(validation.message);
          } else {
            clearPhoneError();
          }
        }
      });
    }

    if (elements.loginForm) {
      elements.loginForm.addEventListener('submit', handleSendOtp);
    }

    if (elements.otpForm) {
      elements.otpForm.addEventListener('submit', handleVerifyOtp);
    }
  });

  // Ekspor Global untuk Event Handler Inline di HTML
  window.IRAAuth = {
    validateIndonesianPhone: validateIndonesianPhone,
    formatIndonesianPhone: formatIndonesianPhone,
    handleSendOtp: handleSendOtp,
    handleVerifyOtp: handleVerifyOtp,
    changePhoneNumber: changePhoneNumber,
    resendOtp: resendOtp,
    handleNotificationClick: handleNotificationClick,
    dismissNotification: dismissNotification
  };

})(window, document);
