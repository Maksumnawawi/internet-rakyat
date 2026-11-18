/**
 * Internet Rakyat - Authentication & Login Module
 * - Alur Login Resmi Internet Rakyat (Nomor HP + Password dengan Tombol Dinamis #94A3B8 -> #D91E2A)
 * - Alur Mandiri Pemulihan Kata Sandi 3 Tahap (Metode -> Verifikasi OTP 123456 -> Sandi Baru)
 * - Header Navigasi Hamburger Dropdown
 * - Terintegrasi Penuh ke Area Pelanggan (dashboard.html)
 */

(function (window, document) {
  'use strict';

  // State Management
  var state = {
    phone: '',
    normalizedPhone: '',
    isPasswordVisible: false,
    isMenuOpen: false,
    forgot: {
      phone: '',
      method: 'wa', // 'wa' or 'email'
      step: 1,
      countdown: 60,
      timerInterval: null
    }
  };

  /**
   * Sanitasi dan normalisasi nomor HP Indonesia
   * Mengubah "+62 838-..." atau "62838..." menjadi "0838..."
   * @param {string} phone
   * @returns {string}
   */
  function sanitizeIndonesianPhone(phone) {
    if (!phone) return '';
    var str = String(phone).trim();
    var clean = str.replace(/[\s\-\(\)\.]/g, '');
    if (clean.indexOf('+62') === 0) {
      clean = '0' + clean.slice(3);
    } else if (clean.indexOf('62') === 0 && clean.length > 4) {
      clean = '0' + clean.slice(2);
    }
    clean = clean.replace(/\D/g, '');
    return clean;
  }

  /**
   * Validasi Format Nomor Handphone Indonesia
   * @param {string} phone
   * @returns {{ isValid: boolean, message: string, normalized?: string }}
   */
  function validateIndonesianPhone(phone) {
    if (!phone) {
      return { 
        isValid: false, 
        message: 'Nomor handphone wajib diisi.' 
      };
    }

    var normalized = sanitizeIndonesianPhone(phone);

    if (!normalized) {
      return { 
        isValid: false, 
        message: 'Nomor handphone tidak boleh kosong.' 
      };
    }

    if (normalized.indexOf('08') !== 0) {
      return { 
        isValid: false, 
        message: 'Format nomor tidak valid. Masukkan nomor WhatsApp aktif diawali 08... minimal 10 digit.' 
      };
    }

    if (normalized.length < 10) {
      return { 
        isValid: false, 
        message: 'Nomor terlalu pendek. Nomor handphone Indonesia minimal 10 digit.' 
      };
    }

    if (normalized.length > 13) {
      return { 
        isValid: false, 
        message: 'Nomor terlalu panjang. Nomor handphone Indonesia maksimal 13 digit.' 
      };
    }

    if (normalized.charAt(2) === '0') {
      return { 
        isValid: false, 
        message: 'Format operator tidak valid. Tidak ada nomor seluler diawali 080.' 
      };
    }

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
   * Format nomor HP untuk tampilan (0812-3456-7890)
   */
  function formatIndonesianPhone(phone) {
    if (!phone) return '';
    var clean = sanitizeIndonesianPhone(phone);
    if (clean.length <= 4) return clean;
    if (clean.length <= 8) return clean.slice(0, 4) + '-' + clean.slice(4);
    if (clean.length <= 12) return clean.slice(0, 4) + '-' + clean.slice(4, 8) + '-' + clean.slice(8);
    return clean.slice(0, 4) + '-' + clean.slice(4, 8) + '-' + clean.slice(8, 12) + '-' + clean.slice(12);
  }

  // DOM Elements Cache
  var el = {};

  function initElements() {
    el.phoneInput = document.getElementById('phoneInput');
    el.passwordInput = document.getElementById('passwordInput');
    el.phoneError = document.getElementById('phoneError');
    el.phoneErrorText = document.getElementById('phoneErrorText');
    el.passwordError = document.getElementById('passwordError');
    el.passwordErrorText = document.getElementById('passwordErrorText');
    el.btnLoginSubmit = document.getElementById('btnLoginSubmit');
    el.btnLoginText = document.getElementById('btnLoginText');
    el.eyeShow = document.getElementById('eyeShow');
    el.eyeHide = document.getElementById('eyeHide');

    // Header Menu
    el.loginMenuBtn = document.getElementById('loginMenuBtn');
    el.loginBurgerIcon = document.getElementById('loginBurgerIcon');
    el.loginCloseIcon = document.getElementById('loginCloseIcon');
    el.loginDropdownMenu = document.getElementById('loginDropdownMenu');

    // Modal Forgot Password
    el.forgotModal = document.getElementById('forgotPasswordModal');
    el.badgeStep1 = document.getElementById('badgeStep1');
    el.badgeStep2 = document.getElementById('badgeStep2');
    el.badgeStep3 = document.getElementById('badgeStep3');
    el.lineStep1 = document.getElementById('lineStep1');
    el.lineStep2 = document.getElementById('lineStep2');

    el.forgotStage1 = document.getElementById('forgotStage1');
    el.forgotStage2 = document.getElementById('forgotStage2');
    el.forgotStage3 = document.getElementById('forgotStage3');

    el.forgotPhoneInput = document.getElementById('forgotPhoneInput');
    el.forgotPhoneError = document.getElementById('forgotPhoneError');
    el.forgotPhoneErrorText = document.getElementById('forgotPhoneErrorText');
    el.methodCardWa = document.getElementById('methodCardWa');
    el.methodCardEmail = document.getElementById('methodCardEmail');
    el.targetWaText = document.getElementById('targetWaText');
    el.forgotChosenTargetText = document.getElementById('forgotChosenTargetText');

    el.fOtpBoxes = [
      document.getElementById('fOtp1'),
      document.getElementById('fOtp2'),
      document.getElementById('fOtp3'),
      document.getElementById('fOtp4'),
      document.getElementById('fOtp5'),
      document.getElementById('fOtp6')
    ];
    el.forgotOtpError = document.getElementById('forgotOtpError');
    el.forgotOtpErrorText = document.getElementById('forgotOtpErrorText');
    el.forgotCountdownTimer = document.getElementById('forgotCountdownTimer');

    el.newPasswordInput = document.getElementById('newPasswordInput');
    el.confirmPasswordInput = document.getElementById('confirmPasswordInput');
    el.newPasswordError = document.getElementById('newPasswordError');
    el.newPasswordErrorText = document.getElementById('newPasswordErrorText');
    el.forgotSuccessBox = document.getElementById('forgotSuccessBox');
  }

  // Error Handlers
  function showPhoneError(msg) {
    if (!el.phoneInput || !el.phoneError) return;
    el.phoneInput.classList.add('is-invalid');
    if (el.phoneErrorText) el.phoneErrorText.textContent = msg;
    el.phoneError.classList.add('visible');
  }

  function clearPhoneError() {
    if (!el.phoneInput || !el.phoneError) return;
    el.phoneInput.classList.remove('is-invalid');
    el.phoneError.classList.remove('visible');
  }

  function showPasswordError(msg) {
    if (!el.passwordInput || !el.passwordError) return;
    el.passwordInput.classList.add('is-invalid');
    if (el.passwordErrorText) el.passwordErrorText.textContent = msg;
    el.passwordError.classList.add('visible');
  }

  function clearPasswordError() {
    if (!el.passwordInput || !el.passwordError) return;
    el.passwordInput.classList.remove('is-invalid');
    el.passwordError.classList.remove('visible');
  }

  /**
   * Real-time Check for LOGIN button state:
   * #94A3B8 (slate) when empty/invalid -> #D91E2A (bright red) when both fields are filled
   */
  function checkLoginButtonState() {
    if (!el.btnLoginSubmit) return;
    var phoneVal = el.phoneInput ? el.phoneInput.value.trim() : '';
    var passVal = el.passwordInput ? el.passwordInput.value : '';

    var phoneValid = validateIndonesianPhone(phoneVal).isValid;
    var passValid = passVal.length >= 6;

    if (phoneValid && passValid) {
      el.btnLoginSubmit.classList.add('ready');
    } else {
      el.btnLoginSubmit.classList.remove('ready');
    }
  }

  function handlePhoneInput() {
    clearPhoneError();
    if (!el.phoneInput) return;
    var val = el.phoneInput.value;

    // Normalisasi paste / input +62
    if (val.indexOf('+') !== -1 || val.indexOf(' ') !== -1 || val.indexOf('-') !== -1 || (val.indexOf('62') === 0 && val.length >= 4)) {
      var sanitized = sanitizeIndonesianPhone(val);
      if (sanitized && sanitized !== val) {
        el.phoneInput.value = sanitized;
      }
    }
    checkLoginButtonState();
  }

  function handlePasswordInput() {
    clearPasswordError();
    checkLoginButtonState();
  }

  /**
   * Toggle Show / Hide Password on Main Form
   */
  function togglePasswordVisibility() {
    if (!el.passwordInput) return;
    state.isPasswordVisible = !state.isPasswordVisible;

    if (state.isPasswordVisible) {
      el.passwordInput.type = 'text';
      if (el.eyeShow) el.eyeShow.style.display = 'none';
      if (el.eyeHide) el.eyeHide.style.display = 'block';
    } else {
      el.passwordInput.type = 'password';
      if (el.eyeShow) el.eyeShow.style.display = 'block';
      if (el.eyeHide) el.eyeHide.style.display = 'none';
    }
  }

  /**
   * Header Menu Toggle for login.html
   */
  function toggleLoginMenu() {
    if (!el.loginDropdownMenu) initElements();
    if (!el.loginDropdownMenu) return;
    state.isMenuOpen = el.loginDropdownMenu.style.display !== 'none';

    if (state.isMenuOpen) {
      closeLoginMenu();
    } else {
      el.loginDropdownMenu.style.display = 'flex';
      if (el.loginBurgerIcon) el.loginBurgerIcon.style.display = 'none';
      if (el.loginCloseIcon) el.loginCloseIcon.style.display = 'block';
    }
  }

  function closeLoginMenu() {
    if (el.loginDropdownMenu) el.loginDropdownMenu.style.display = 'none';
    if (el.loginBurgerIcon) el.loginBurgerIcon.style.display = 'block';
    if (el.loginCloseIcon) el.loginCloseIcon.style.display = 'none';
    state.isMenuOpen = false;
  }

  /**
   * Main Login Handler
   */
  function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    clearPhoneError();
    clearPasswordError();

    var rawPhone = el.phoneInput ? el.phoneInput.value : '';
    var pass = el.passwordInput ? el.passwordInput.value : '';

    var phoneValidation = validateIndonesianPhone(rawPhone);
    if (!phoneValidation.isValid) {
      showPhoneError(phoneValidation.message);
      return false;
    }

    if (!pass) {
      showPasswordError('Password wajib diisi.');
      return false;
    }

    if (pass.length < 6) {
      showPasswordError('Kata sandi minimal 6 karakter.');
      return false;
    }

    // Login Sukses
    if (el.btnLoginSubmit) el.btnLoginSubmit.disabled = true;
    if (el.btnLoginText) {
      el.btnLoginText.innerHTML = '<span class="spinner" style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;vertical-align:middle;margin-right:8px;"></span>Memverifikasi...';
    }

    try {
      var activeUser = {
        nama: 'Masum Nawawi',
        idPelanggan: 'DV737',
        phone: phoneValidation.normalized,
        isLogin: true,
        loginAt: new Date().toISOString()
      };
      if (window && window.localStorage) {
        window.localStorage.setItem('ira_active_user', JSON.stringify(activeUser));
      }
    } catch (err) {
      console.warn('Storage warning:', err);
    }

    setTimeout(function () {
      window.location.href = 'dashboard.html';
    }, 400);

    return false;
  }

  // ========================================================
  // ALUR MANDIRI "LUPA PASSWORD?" (3 TAHAP)
  // ========================================================
  function openForgotModal(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!el.forgotModal) initElements();
    if (!el.forgotModal) return;

    // Pre-fill phone number from main login field if typed
    var currentPhone = el.phoneInput ? el.phoneInput.value.trim() : '';
    if (el.forgotPhoneInput) {
      el.forgotPhoneInput.value = currentPhone;
      if (currentPhone) {
        var formatted = formatIndonesianPhone(currentPhone);
        if (el.targetWaText) el.targetWaText.textContent = formatted || '08xx-xxxx-xxxx';
      }
    }

    // Reset to Stage 1
    setForgotStage(1);
    el.forgotModal.style.display = 'flex';
  }

  function closeForgotModal() {
    if (el.forgotModal) el.forgotModal.style.display = 'none';
    if (state.forgot.timerInterval) clearInterval(state.forgot.timerInterval);
  }

  function setForgotStage(stageNum) {
    state.forgot.step = stageNum;

    // Badges update
    if (el.badgeStep1) el.badgeStep1.classList.toggle('active', stageNum >= 1);
    if (el.lineStep1) el.lineStep1.classList.toggle('active', stageNum >= 2);
    if (el.badgeStep2) el.badgeStep2.classList.toggle('active', stageNum >= 2);
    if (el.lineStep2) el.lineStep2.classList.toggle('active', stageNum >= 3);
    if (el.badgeStep3) el.badgeStep3.classList.toggle('active', stageNum >= 3);

    // Containers display
    if (el.forgotStage1) el.forgotStage1.style.display = stageNum === 1 ? 'block' : 'none';
    if (el.forgotStage2) el.forgotStage2.style.display = stageNum === 2 ? 'block' : 'none';
    if (el.forgotStage3) el.forgotStage3.style.display = stageNum === 3 ? 'block' : 'none';
  }

  function selectForgotMethod(method) {
    state.forgot.method = method;
    if (el.methodCardWa) el.methodCardWa.classList.toggle('active', method === 'wa');
    if (el.methodCardEmail) el.methodCardEmail.classList.toggle('active', method === 'email');
  }

  function submitForgotStage1() {
    var rawPhone = el.forgotPhoneInput ? el.forgotPhoneInput.value.trim() : '';
    var validation = validateIndonesianPhone(rawPhone);

    if (!validation.isValid) {
      if (el.forgotPhoneInput) el.forgotPhoneInput.classList.add('is-invalid');
      if (el.forgotPhoneError) el.forgotPhoneError.classList.add('visible');
      if (el.forgotPhoneErrorText) el.forgotPhoneErrorText.textContent = validation.message;
      return;
    }

    if (el.forgotPhoneInput) el.forgotPhoneInput.classList.remove('is-invalid');
    if (el.forgotPhoneError) el.forgotPhoneError.classList.remove('visible');

    state.forgot.phone = validation.normalized;
    var formatted = formatIndonesianPhone(validation.normalized);

    if (el.forgotChosenTargetText) {
      if (state.forgot.method === 'wa') {
        el.forgotChosenTargetText.textContent = 'WhatsApp ' + formatted;
      } else {
        el.forgotChosenTargetText.textContent = 'Email masum***@gmail.com';
      }
    }

    // Switch to Stage 2
    setForgotStage(2);

    // Start 60s countdown timer
    startForgotTimer();

    // Auto focus first OTP box
    setTimeout(function () {
      if (el.fOtpBoxes && el.fOtpBoxes[0]) el.fOtpBoxes[0].focus();
    }, 100);
  }

  function startForgotTimer() {
    if (state.forgot.timerInterval) clearInterval(state.forgot.timerInterval);
    state.forgot.countdown = 60;
    updateTimerDisplay();

    state.forgot.timerInterval = setInterval(function () {
      state.forgot.countdown--;
      updateTimerDisplay();
      if (state.forgot.countdown <= 0) {
        clearInterval(state.forgot.timerInterval);
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    if (!el.forgotCountdownTimer) return;
    var sec = state.forgot.countdown;
    var display = '00:' + (sec < 10 ? '0' : '') + sec;
    el.forgotCountdownTimer.textContent = display;
  }

  function moveModalOtp(current, nextId) {
    if (current && current.value.length === 1 && nextId) {
      var nextEl = document.getElementById(nextId);
      if (nextEl) nextEl.focus();
    }
  }

  /**
   * Tombol Simulasi Demo Langsung: Isi 123456
   */
  function fillDemoOtp() {
    var code = ['1', '2', '3', '4', '5', '6'];
    if (el.fOtpBoxes) {
      for (var i = 0; i < el.fOtpBoxes.length; i++) {
        if (el.fOtpBoxes[i]) {
          el.fOtpBoxes[i].value = code[i];
        }
      }
      if (el.fOtpBoxes[5]) el.fOtpBoxes[5].focus();
    }
    if (el.forgotOtpError) el.forgotOtpError.classList.remove('visible');
  }

  function submitForgotStage2() {
    var enteredOtp = '';
    if (el.fOtpBoxes) {
      for (var i = 0; i < el.fOtpBoxes.length; i++) {
        enteredOtp += (el.fOtpBoxes[i] ? el.fOtpBoxes[i].value.trim() : '');
      }
    }

    if (enteredOtp.length < 6) {
      if (el.forgotOtpError) el.forgotOtpError.classList.add('visible');
      if (el.forgotOtpErrorText) el.forgotOtpErrorText.textContent = 'Masukkan lengkap 6 digit kode verifikasi.';
      return;
    }

    // Kode verifikasi valid (terima 123456 atau sembarang 6 digit untuk kelancaran demo)
    if (el.forgotOtpError) el.forgotOtpError.classList.remove('visible');

    // Switch to Stage 3
    setForgotStage(3);

    setTimeout(function () {
      if (el.newPasswordInput) el.newPasswordInput.focus();
    }, 100);
  }

  function submitForgotStage3() {
    var p1 = el.newPasswordInput ? el.newPasswordInput.value : '';
    var p2 = el.confirmPasswordInput ? el.confirmPasswordInput.value : '';

    if (!p1 || p1.length < 6) {
      if (el.newPasswordError) el.newPasswordError.classList.add('visible');
      if (el.newPasswordErrorText) el.newPasswordErrorText.textContent = 'Kata sandi baru minimal 6 karakter.';
      return;
    }

    if (p1 !== p2) {
      if (el.newPasswordError) el.newPasswordError.classList.add('visible');
      if (el.newPasswordErrorText) el.newPasswordErrorText.textContent = 'Konfirmasi kata sandi tidak cocok.';
      return;
    }

    if (el.newPasswordError) el.newPasswordError.classList.remove('visible');

    // Sukses: tampilkan feedback
    if (el.forgotSuccessBox) el.forgotSuccessBox.style.display = 'block';

    // Isi kata sandi baru ke form login utama agar user langsung bisa klik LOGIN
    if (el.passwordInput) {
      el.passwordInput.value = p1;
    }
    if (el.phoneInput && state.forgot.phone) {
      el.phoneInput.value = state.forgot.phone;
    }
    checkLoginButtonState();

    setTimeout(function () {
      closeForgotModal();
      if (el.forgotSuccessBox) el.forgotSuccessBox.style.display = 'none';
      if (el.btnLoginSubmit) el.btnLoginSubmit.focus();
    }, 1400);
  }

  // DOM Ready
  function onReady() {
    initElements();

    if (el.phoneInput) {
      el.phoneInput.addEventListener('paste', function (e) {
        var pasteText = (e.clipboardData || window.clipboardData).getData('text');
        if (pasteText) {
          e.preventDefault();
          var sanitized = sanitizeIndonesianPhone(pasteText);
          el.phoneInput.value = sanitized;
          handlePhoneInput();
        }
      });
      el.phoneInput.addEventListener('input', handlePhoneInput);
      el.phoneInput.addEventListener('blur', function () {
        var val = el.phoneInput.value.trim();
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

    if (el.passwordInput) {
      el.passwordInput.addEventListener('input', handlePasswordInput);
    }

    if (el.forgotPhoneInput) {
      el.forgotPhoneInput.addEventListener('input', function () {
        var val = el.forgotPhoneInput.value;
        if (val.indexOf('+') !== -1 || (val.indexOf('62') === 0 && val.length >= 4)) {
          el.forgotPhoneInput.value = sanitizeIndonesianPhone(val);
        }
        var formatted = formatIndonesianPhone(el.forgotPhoneInput.value);
        if (el.targetWaText) el.targetWaText.textContent = formatted || '08xx-xxxx-xxxx';
      });
    }

    // Close header menu or modal on click outside
    document.addEventListener('click', function (e) {
      var headerRight = document.querySelector('.login-header-right');
      if (headerRight && !headerRight.contains(e.target)) {
        closeLoginMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeLoginMenu();
        if (el.forgotModal && el.forgotModal.style.display === 'flex') {
          closeForgotModal();
        }
      }
    });

    checkLoginButtonState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // Public API
  window.IRAAuth = {
    state: state,
    sanitizeIndonesianPhone: sanitizeIndonesianPhone,
    validateIndonesianPhone: validateIndonesianPhone,
    formatIndonesianPhone: formatIndonesianPhone,
    togglePasswordVisibility: togglePasswordVisibility,
    toggleLoginMenu: toggleLoginMenu,
    closeLoginMenu: closeLoginMenu,
    handleLogin: handleLogin,
    openForgotModal: openForgotModal,
    closeForgotModal: closeForgotModal,
    selectForgotMethod: selectForgotMethod,
    submitForgotStage1: submitForgotStage1,
    moveModalOtp: moveModalOtp,
    fillDemoOtp: fillDemoOtp,
    submitForgotStage2: submitForgotStage2,
    submitForgotStage3: submitForgotStage3
  };

})(window, document);
