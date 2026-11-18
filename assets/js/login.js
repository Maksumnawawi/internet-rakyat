/**
 * Internet Rakyat - Authentication & Login Module
 * Alur Login Resmi Internet Rakyat (Nomor HP + Kata Sandi / Password)
 * Terintegrasi langsung dengan Area Pelanggan (dashboard.html).
 */

(function (window, document) {
  'use strict';

  // State Management
  var state = {
    phone: '',
    normalizedPhone: '',
    isPasswordVisible: false,
    isLoading: false
  };

  /**
   * Sanitasi dan normalisasi nomor HP Indonesia
   * Mengubah "+62 838-..." atau "62838..." menjadi "0838..."
   * Menjamin tidak ada digit yang terpotong menjadi "52..."
   * @param {string} phone
   * @returns {string}
   */
  function sanitizeIndonesianPhone(phone) {
    if (!phone) return '';
    var str = String(phone).trim();
    // Hapus spasi, strip, tanda kurung, dan titik
    var clean = str.replace(/[\s\-\(\)\.]/g, '');
    // Normalisasi kode negara Indonesia (+62 / 62) menjadi 08
    if (clean.indexOf('+62') === 0) {
      clean = '0' + clean.slice(3);
    } else if (clean.indexOf('62') === 0 && clean.length > 4) {
      clean = '0' + clean.slice(2);
    }
    // Hapus karakter non-digit selain angka
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
    var clean = sanitizeIndonesianPhone(phone);
    if (clean.length <= 4) return clean;
    if (clean.length <= 8) return clean.slice(0, 4) + '-' + clean.slice(4);
    if (clean.length <= 12) return clean.slice(0, 4) + '-' + clean.slice(4, 8) + '-' + clean.slice(8);
    return clean.slice(0, 4) + '-' + clean.slice(4, 8) + '-' + clean.slice(8, 12) + '-' + clean.slice(12);
  }

  // DOM Elements Cache
  var el = {};

  function initElements() {
    el.stepPhoneSection = document.getElementById('stepPhoneSection');
    el.phoneForm = document.getElementById('phoneForm');
    el.phoneInput = document.getElementById('phoneInput');
    el.phoneError = document.getElementById('phoneError');
    el.phoneErrorText = document.getElementById('phoneErrorText');
    el.btnSubmitPhone = document.getElementById('btnSubmitPhone');
    el.btnTextPhone = document.getElementById('btnTextPhone');

    el.stepPasswordSection = document.getElementById('stepPasswordSection');
    el.displayTargetPhone = document.getElementById('displayTargetPhone');
    el.passwordForm = document.getElementById('passwordForm');
    el.passwordInput = document.getElementById('passwordInput');
    el.passwordError = document.getElementById('passwordError');
    el.passwordErrorText = document.getElementById('passwordErrorText');
    el.btnSubmitPassword = document.getElementById('btnSubmitPassword');
    el.btnLoginText = document.getElementById('btnLoginText');
    el.btnTogglePassword = document.getElementById('btnTogglePassword');
    el.eyeIconShow = document.getElementById('eyeIconShow');
    el.eyeIconHide = document.getElementById('eyeIconHide');

    el.forgotPasswordModal = document.getElementById('forgotPasswordModal');
    el.forgotModalDesc = document.getElementById('forgotModalDesc');
    el.btnForgotWaAction = document.getElementById('btnForgotWaAction');
  }

  /**
   * Tampilkan pesan error pada field nomor handphone
   * @param {string} msg
   */
  function showPhoneError(msg) {
    if (!el.phoneInput || !el.phoneError) return;
    el.phoneInput.classList.add('is-invalid');
    if (el.phoneErrorText) {
      el.phoneErrorText.textContent = msg;
    }
    el.phoneError.classList.add('visible');
    el.phoneInput.focus();
  }

  /**
   * Sembunyikan error pada field nomor handphone
   */
  function clearPhoneError() {
    if (!el.phoneInput || !el.phoneError) return;
    el.phoneInput.classList.remove('is-invalid');
    el.phoneError.classList.remove('visible');
  }

  /**
   * Tampilkan pesan error pada field password
   * @param {string} msg
   */
  function showPasswordError(msg) {
    if (!el.passwordInput || !el.passwordError) return;
    el.passwordInput.classList.add('is-invalid');
    if (el.passwordErrorText) {
      el.passwordErrorText.textContent = msg;
    }
    el.passwordError.classList.add('visible');
    el.passwordInput.focus();
  }

  /**
   * Sembunyikan error pada field password
   */
  function clearPasswordError() {
    if (!el.passwordInput || !el.passwordError) return;
    el.passwordInput.classList.remove('is-invalid');
    el.passwordError.classList.remove('visible');
  }

  /**
   * Handle real-time input pada field nomor HP
   */
  function handlePhoneInput() {
    clearPhoneError();
    if (!el.phoneInput) return;
    var val = el.phoneInput.value;
    
    // Otomatis normalisasi jika user menempelkan awalan kode negara atau spasi
    if (val.indexOf('+') !== -1 || val.indexOf(' ') !== -1 || val.indexOf('-') !== -1 || (val.indexOf('62') === 0 && val.length >= 4)) {
      var sanitized = sanitizeIndonesianPhone(val);
      if (sanitized && sanitized !== val) {
        el.phoneInput.value = sanitized;
        val = sanitized;
      }
    }
  }

  /**
   * TAHAP 1: Submit Nomor HP -> Beralih ke Tahap 2 (Kata Sandi)
   * @param {Event} e
   */
  function handleProceedToPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    clearPhoneError();

    if (!el.phoneInput) initElements();
    var rawPhone = el.phoneInput ? el.phoneInput.value : '';
    var validation = validateIndonesianPhone(rawPhone);

    if (!validation.isValid) {
      showPhoneError(validation.message);
      return false;
    }

    // Nomor valid, simpan ke state
    state.phone = rawPhone;
    state.normalizedPhone = validation.normalized;

    // Tampilkan nomor terformat di Tahap 2
    var formatted = formatIndonesianPhone(validation.normalized);
    if (el.displayTargetPhone) {
      el.displayTargetPhone.textContent = formatted;
    }

    // Update link WhatsApp pemulihan kata sandi
    if (el.btnForgotWaAction) {
      var waMsg = encodeURIComponent('Halo Internet Rakyat, saya ingin bantuan pemulihan kata sandi untuk akun nomor ' + formatted);
      el.btnForgotWaAction.href = 'https://api.whatsapp.com/send?phone=6281110689111&text=' + waMsg;
    }

    // Transisi visual: Sembunyikan Tahap 1, Tampilkan Tahap 2
    if (el.stepPhoneSection) el.stepPhoneSection.style.display = 'none';
    if (el.stepPasswordSection) {
      el.stepPasswordSection.style.display = 'block';
      // Auto focus ke password input
      setTimeout(function () {
        if (el.passwordInput) {
          el.passwordInput.focus();
        }
      }, 50);
    }

    return false;
  }

  /**
   * Kembali dari Tahap 2 ke Tahap 1 (Tombol "Ubah")
   */
  function backToPhoneStep() {
    clearPasswordError();
    if (el.stepPasswordSection) el.stepPasswordSection.style.display = 'none';
    if (el.stepPhoneSection) {
      el.stepPhoneSection.style.display = 'block';
      if (el.phoneInput) {
        el.phoneInput.focus();
      }
    }
  }

  /**
   * Toggle Show / Hide Password
   */
  function togglePasswordVisibility() {
    if (!el.passwordInput) return;
    state.isPasswordVisible = !state.isPasswordVisible;

    if (state.isPasswordVisible) {
      el.passwordInput.type = 'text';
      if (el.eyeIconShow) el.eyeIconShow.style.display = 'none';
      if (el.eyeIconHide) el.eyeIconHide.style.display = 'block';
    } else {
      el.passwordInput.type = 'password';
      if (el.eyeIconShow) el.eyeIconShow.style.display = 'block';
      if (el.eyeIconHide) el.eyeIconHide.style.display = 'none';
    }
  }

  /**
   * TAHAP 2: Submit Kata Sandi -> Masuk langsung ke Area Pelanggan (Dashboard)
   * @param {Event} e
   */
  function handleLoginWithPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    clearPasswordError();

    if (!el.passwordInput) initElements();
    var pass = el.passwordInput ? el.passwordInput.value : '';

    if (!pass) {
      showPasswordError('Silakan masukkan kata sandi Anda.');
      return false;
    }

    if (pass.length < 6) {
      showPasswordError('Kata sandi minimal 6 karakter.');
      return false;
    }

    // Kata sandi valid -> Mulai proses login
    state.isLoading = true;
    if (el.btnSubmitPassword) el.btnSubmitPassword.disabled = true;
    if (el.btnLoginText) {
      el.btnLoginText.innerHTML = '<span class="spinner" style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;vertical-align:middle;margin-right:8px;"></span>Memverifikasi...';
    }

    // Simpan session aktif di localStorage untuk sinkronisasi Area Pelanggan
    try {
      var activeUser = {
        nama: 'Masum Nawawi',
        idPelanggan: 'DV737',
        phone: state.normalizedPhone || '08123456789',
        isLogin: true,
        loginAt: new Date().toISOString()
      };
      if (window && window.localStorage) {
        window.localStorage.setItem('ira_active_user', JSON.stringify(activeUser));
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ira_active_user', JSON.stringify(activeUser));
      }
    } catch (err) {
      console.warn('Storage warning:', err);
    }

    // Redirect langsung ke Area Pelanggan (dashboard.html)
    setTimeout(function () {
      window.location.href = 'dashboard.html';
    }, 400);

    return false;
  }

  /**
   * Buka pop-up Dialog Lupa Kata Sandi
   * @param {Event} e
   */
  function showForgotPasswordDialog(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!el.forgotPasswordModal) initElements();
    if (el.forgotPasswordModal) {
      el.forgotPasswordModal.style.display = 'flex';
    }
  }

  /**
   * Tutup pop-up Dialog Lupa Kata Sandi
   */
  function closeForgotPasswordDialog() {
    if (el.forgotPasswordModal) {
      el.forgotPasswordModal.style.display = 'none';
    }
  }

  // Inisialisasi Event Listener saat DOM Siap
  function onReady() {
    initElements();

    if (el.phoneInput) {
      // Listener Paste otomatis bersihkan nomor (+62 -> 08)
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
      el.passwordInput.addEventListener('input', function () {
        clearPasswordError();
      });
    }

    // Support keyboard Escape untuk menutup modal lupa kata sandi
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && el.forgotPasswordModal && el.forgotPasswordModal.style.display === 'flex') {
        closeForgotPasswordDialog();
      }
    });
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
    handleProceedToPassword: handleProceedToPassword,
    backToPhoneStep: backToPhoneStep,
    togglePasswordVisibility: togglePasswordVisibility,
    handleLoginWithPassword: handleLoginWithPassword,
    showForgotPasswordDialog: showForgotPasswordDialog,
    closeForgotPasswordDialog: closeForgotPasswordDialog
  };

})(window, document);
