// HavenStays Guest Dashboard and Booking Operations

window.adjustGuestCount = function(category, delta) {
  if (category === 'adults') {
    window.guestState.adults = Math.max(1, window.guestState.adults + delta);
  } else if (category === 'children') {
    window.guestState.children = Math.max(0, window.guestState.children + delta);
  } else if (category === 'males') {
    window.guestState.males = Math.max(0, window.guestState.males + delta);
  } else if (category === 'females') {
    window.guestState.females = Math.max(0, window.guestState.females + delta);
  }

  document.getElementById('count-adults').innerText = window.guestState.adults;
  document.getElementById('count-children').innerText = window.guestState.children;
  document.getElementById('count-males').innerText = window.guestState.males;
  document.getElementById('count-females').innerText = window.guestState.females;

  document.getElementById('detail-count-adults').innerText = window.guestState.adults;
  document.getElementById('detail-count-children').innerText = window.guestState.children;
  document.getElementById('detail-count-males').innerText = window.guestState.males;
  document.getElementById('detail-count-females').innerText = window.guestState.females;

  const totalGuests = window.guestState.adults + window.guestState.children;
  const summaryStr = `${totalGuests} ${totalGuests === 1 ? 'Guest' : 'Guests'} (${window.guestState.males} M, ${window.guestState.females} F)`;

  document.getElementById('hero-guest-summary').innerText = summaryStr;
  document.getElementById('detail-guests-summary').innerText = summaryStr;

  window.recalculatePrice();
};

window.recalculatePrice = function() {
  const checkin = new Date(window.selectedCheckIn);
  const checkout = new Date(window.selectedCheckOut);
  const nights = Math.max(1, Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24)));

  const baseTotal = window.currentProperty.price * nights;
  const cleaning = window.currentProperty.cleaning;
  const service = Math.round(baseTotal * 0.08);
  const grandTotal = baseTotal + cleaning + service;

  document.getElementById('booking-night-rate').innerText = window.formatINR(window.currentProperty.price);
  document.getElementById('breakdown-nights-label').innerText = `${window.formatINR(window.currentProperty.price)} × ${nights} ${nights === 1 ? 'night' : 'nights'}`;
  document.getElementById('breakdown-base-total').innerText = window.formatINR(baseTotal);
  document.getElementById('breakdown-cleaning').innerText = window.formatINR(cleaning);
  document.getElementById('breakdown-service').innerText = window.formatINR(service);
  document.getElementById('breakdown-grand-total').innerText = window.formatINR(grandTotal);

  return { nights, grandTotal };
};

window.handleInitiateBooking = function() {
  if (!window.currentUser) {
    alert('🔑 Please create an account or sign in to book your stay!');
    window.openAuthModal('register');
    return;
  }

  const { grandTotal } = window.recalculatePrice();
  document.getElementById('bio-confirm-guest-name').innerText = window.currentUser.name;
  document.getElementById('bio-confirm-total-price').innerText = window.formatINR(grandTotal);

  document.getElementById('modal-biometric').classList.remove('hidden');
  document.getElementById('bio-step-1').classList.remove('hidden');
  document.getElementById('bio-step-2').classList.add('hidden');
  document.getElementById('bio-step-3').classList.add('hidden');
};

window.startScanProcess = function() {
  document.getElementById('bio-step-1').classList.add('hidden');
  document.getElementById('bio-step-2').classList.remove('hidden');

  setTimeout(() => {
    window.pendingTxHash = 'BIO_WA_IN_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById('bio-txhash').innerText = 'TxHash: ' + window.pendingTxHash;
    document.getElementById('bio-step-2').classList.add('hidden');
    document.getElementById('bio-step-3').classList.remove('hidden');
  }, 1000);
};

window.completeBookingAndRedirect = function() {
  const { nights, grandTotal } = window.recalculatePrice();

  const newBooking = {
    id: 'bk_' + Date.now(),
    guestId: window.currentUser.email,
    guestName: window.currentUser.name,
    guestPhone: '+91 98123 45678',
    hostId: window.currentProperty.hostId || 'host_001',
    hostName: window.currentProperty.hostName || 'Vikramaditya Thorne',
    hostPhone: '+91 98765 43210',
    propertyTitle: window.currentProperty.title,
    propertyCity: window.currentProperty.city,
    propertyImage: window.currentProperty.images[0],
    checkIn: window.selectedCheckIn,
    checkOut: window.selectedCheckOut,
    nights: nights,
    totalPaid: grandTotal,
    txHash: window.pendingTxHash,
    status: 'Confirmed & Settled'
  };

  window.bookings.unshift(newBooking);
  window.saveStorageItem('haven_bookings_db', window.bookings);

  window.closeBiometricModal();
  window.showPage('guest-dash');
};

window.renderGuestDashboard = function() {
  if (!window.currentUser) return;
  document.getElementById('dash-guest-name').innerText = window.currentUser.name;

  const guestBookings = window.bookings.filter(b => b.guestId === window.currentUser.email);
  const listContainer = document.getElementById('guest-bookings-list');

  if (guestBookings.length === 0) {
    listContainer.innerHTML = `
      <div class="col-span-2 bg-white border border-dashed border-gray-300 rounded-3xl p-8 text-center space-y-3">
        <span class="text-3xl">🧳</span>
        <h3 class="font-bold text-gray-900 text-lg font-display">No trips booked yet</h3>
        <p class="text-xs text-gray-500 font-normal">Explore stays and reserve with Touch ID biometrics.</p>
        <button onclick="showPage('all-stays')" class="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-neutral-800">Explore Stays ➔</button>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = guestBookings.map(b => `
    <div class="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden flex flex-col justify-between">
      <div>
        <div class="relative aspect-[16/9] bg-gray-100">
          <img src="${b.propertyImage}" class="w-full h-full object-cover" />
          <span class="absolute top-3 right-3 bg-emerald-600 text-white font-bold px-3 py-1 rounded-full text-xs shadow-md">
            ✓ Touch ID Verified
          </span>
        </div>
        <div class="p-5 sm:p-6 space-y-3">
          <div>
            <span class="text-xs font-bold text-blue-600 uppercase tracking-wider">📍 ${b.propertyCity}</span>
            <h3 class="text-base sm:text-lg font-bold text-gray-900 mt-0.5 line-clamp-1 font-display">${b.propertyTitle}</h3>
          </div>
          <div class="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-2xl text-xs">
            <div>
              <span class="block text-[10px] font-extrabold uppercase text-gray-400">Check-In</span>
              <span class="font-bold text-gray-900">${b.checkIn}</span>
            </div>
            <div>
              <span class="block text-[10px] font-extrabold uppercase text-gray-400">Check-Out</span>
              <span class="font-bold text-gray-900">${b.checkOut}</span>
            </div>
          </div>
          <div class="space-y-1 text-xs text-gray-600 pt-2 border-t border-gray-100">
            <div class="flex justify-between">
              <span>Total Upfront Cost:</span>
              <span class="font-extrabold text-gray-900 font-display">${window.formatINR(b.totalPaid)}</span>
            </div>
            <div class="flex justify-between">
              <span>WebAuthn TxHash:</span>
              <span class="font-mono text-emerald-700 font-bold text-[11px]">${b.txHash}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
        <div class="text-xs">
          <span class="block font-bold text-gray-900">Host: ${b.hostName}</span>
          <span class="text-[11px] text-gray-500">${b.hostPhone}</span>
        </div>
        <button onclick="alert('Calling Host ${b.hostName} (${b.hostPhone})...')" class="bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-neutral-800">
          Call Host
        </button>
      </div>
    </div>
  `).join('');
};

window.triggerBiometricModal = function() {
  document.getElementById('modal-biometric').classList.remove('hidden');
  document.getElementById('bio-step-1').classList.remove('hidden');
  document.getElementById('bio-step-2').classList.add('hidden');
  document.getElementById('bio-step-3').classList.add('hidden');
};

window.closeBiometricModal = function() {
  document.getElementById('modal-biometric').classList.add('hidden');
};
