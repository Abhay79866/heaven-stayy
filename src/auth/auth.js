// HavenStays User and Host Authentication Logic

window.setAuthMode = function(mode) {
  window.currentAuthMode = mode;
  const regBtn = document.getElementById('auth-mode-register');
  const loginBtn = document.getElementById('auth-mode-login');
  const title = document.getElementById('auth-modal-title');
  const submitBtn = document.getElementById('auth-submit-btn');
  const nameField = document.getElementById('field-name-container');
  const roleField = document.getElementById('role-select-container');

  if (mode === 'register') {
    regBtn.className = "py-2.5 rounded-lg bg-white text-gray-900 shadow-sm transition-colors";
    loginBtn.className = "py-2.5 rounded-lg text-gray-500 hover:text-gray-900 transition-colors";
    title.innerText = "Create your account";
    submitBtn.innerText = "Create Account & Log In ➔";
    nameField.classList.remove('hidden');
    roleField.classList.remove('hidden');
  } else {
    loginBtn.className = "py-2.5 rounded-lg bg-white text-gray-900 shadow-sm transition-colors";
    regBtn.className = "py-2.5 rounded-lg text-gray-500 hover:text-gray-900 transition-colors";
    title.innerText = "Sign In to HavenStays";
    submitBtn.innerText = "Sign In ➔";
    nameField.classList.add('hidden');
    roleField.classList.add('hidden');
  }
};

window.selectAuthRole = function(role, label) {
  window.selectedAuthRole = role;
  document.getElementById('auth-role-label').innerText = label;
  window.closeAllDropdowns();
};

window.updateAuthHeaderUI = function() {
  const guestMenu = document.getElementById('header-guest-menu');
  const hostMenu = document.getElementById('header-host-menu');
  const loggedOutMenu = document.getElementById('header-logged-out-menu');

  const mobGuest = document.getElementById('mobile-guest-menu');
  const mobHost = document.getElementById('mobile-host-menu');
  const mobLoggedOut = document.getElementById('mobile-logged-out-menu');

  if (!window.currentUser) {
    loggedOutMenu.classList.remove('hidden');
    guestMenu.classList.add('hidden');
    hostMenu.classList.add('hidden');

    if (mobLoggedOut) mobLoggedOut.classList.remove('hidden');
    if (mobGuest) mobGuest.classList.add('hidden');
    if (mobHost) mobHost.classList.add('hidden');
  } else if (window.currentUser.role === 'host') {
    loggedOutMenu.classList.add('hidden');
    guestMenu.classList.add('hidden');
    hostMenu.classList.remove('hidden');
    document.getElementById('host-display-name').innerText = window.currentUser.name.split(' ')[0];

    if (mobLoggedOut) mobLoggedOut.classList.add('hidden');
    if (mobGuest) mobGuest.classList.add('hidden');
    if (mobHost) mobHost.classList.remove('hidden');
  } else {
    loggedOutMenu.classList.add('hidden');
    guestMenu.classList.remove('hidden');
    hostMenu.classList.add('hidden');
    document.getElementById('user-display-name').innerText = window.currentUser.name.split(' ')[0];

    if (mobLoggedOut) mobLoggedOut.classList.add('hidden');
    if (mobGuest) mobGuest.classList.remove('hidden');
    if (mobHost) mobHost.classList.add('hidden');
  }
};

window.handleLogout = function() {
  window.currentUser = null;
  window.saveStorageItem('haven_current_user', null);
  window.updateAuthHeaderUI();
  window.showPage('home');
  alert('You have logged out.');
};

window.quickAuth = function(role) {
  if (role === 'host') {
    window.currentUser = { name: 'Vikramaditya Thorne', email: 'host@heavenstay.in', role: 'host' };
  } else {
    window.currentUser = { name: 'Aarav Mehta', email: 'guest@heavenstay.in', role: 'guest' };
  }
  window.saveStorageItem('haven_current_user', window.currentUser);
  window.closeAuthModal();
  window.updateAuthHeaderUI();
  if (role === 'host') window.showPage('host-dash'); else window.showPage('guest-dash');
};

window.handleAuthSubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;

  if (window.currentAuthMode === 'register') {
    const name = document.getElementById('auth-name').value || 'Aarav Mehta';
    window.currentUser = { name, email, role: window.selectedAuthRole };
    window.saveStorageItem('haven_current_user', window.currentUser);
    alert(`✓ Account created successfully for ${name}!`);
  } else {
    const isHost = email.includes('host');
    window.currentUser = { name: isHost ? 'Vikramaditya Thorne' : 'Aarav Mehta', email, role: isHost ? 'host' : 'guest' };
    window.saveStorageItem('haven_current_user', window.currentUser);
    alert(`✓ Signed in as ${window.currentUser.name}`);
  }

  window.closeAuthModal();
  window.updateAuthHeaderUI();
  if (window.currentUser.role === 'host') window.showPage('host-dash'); else window.showPage('guest-dash');
};

window.openAuthModal = function(mode = 'login') {
  window.setAuthMode(mode);
  document.getElementById('modal-auth').classList.remove('hidden');
};

window.closeAuthModal = function() {
  document.getElementById('modal-auth').classList.add('hidden');
};
