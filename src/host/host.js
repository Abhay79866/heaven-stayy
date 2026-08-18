// HavenStays Host Portal and Property Management

window.triggerHostPublishCheck = function() {
  if (!window.currentUser || window.currentUser.role !== 'host') {
    alert('🔒 Host Authentication Required! Please sign in as a Host before publishing property listings.');
    window.openAuthModal('register');
  } else {
    window.openHostModal();
  }
};

window.openHostModal = function() {
  document.getElementById('modal-host').classList.remove('hidden');
};

window.closeHostModal = function() {
  document.getElementById('modal-host').classList.add('hidden');
};

window.handleHostSubmit = function(e) {
  e.preventDefault();
  const title = document.getElementById('host-form-title').value;
  const city = document.getElementById('host-form-city').value;
  const price = Number(document.getElementById('host-form-price').value);
  const customImg = document.getElementById('host-form-image').value || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80';
  const hostId = window.currentUser ? (window.currentUser.email === 'host@heavenstay.in' ? 'host_001' : window.currentUser.email) : 'host_001';

  const newProp = {
    id: 'prop_' + Date.now(),
    hostId: hostId,
    title,
    tagline: 'Custom Indian host published stay',
    description: 'Authentic human hosted stay in India with complete privacy.',
    price,
    cleaning: 2500,
    rating: 5.00,
    reviews: 1,
    city,
    specs: { guests: 4, bedrooms: 2, beds: 2, baths: 2 },
    hostName: window.currentUser ? window.currentUser.name : 'Vikramaditya Thorne',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    amenities: ['Mountain/Beach View', 'Full Kitchen', 'Wi-Fi'],
    images: [
      customImg,
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    ]
  };

  window.PROPERTIES.unshift(newProp);
  window.saveStorageItem('haven_properties_db', window.PROPERTIES);
  window.renderPropertyGrid();
  window.closeHostModal();
  window.showPage('host-dash');
};

window.renderHostDashboard = function() {
  const hostName = window.currentUser ? window.currentUser.name : 'Vikramaditya Thorne';
  const hostId = window.currentUser ? (window.currentUser.email === 'host@heavenstay.in' ? 'host_001' : window.currentUser.email) : 'host_001';

  document.getElementById('host-portal-name').innerText = hostName.split(' ')[0];
  document.getElementById('host-modal-user-subtitle').innerText = `Logged in Host: ${hostName} (ID: ${hostId})`;

  const hostBookings = window.bookings.filter(b => b.hostId === hostId || hostId === 'host_001');
  const totalPayout = hostBookings.reduce((sum, b) => sum + (b.totalPaid || 0), 0);

  document.getElementById('metric-host-payout').innerText = window.formatINR(totalPayout > 0 ? totalPayout : 198240);
  document.getElementById('metric-host-stays').innerText = `${hostBookings.length > 0 ? hostBookings.length : 2} Stays`;

  const hostProps = window.PROPERTIES.filter(p => p.hostId === hostId || hostId === 'host_001');
  document.getElementById('metric-host-properties-count').innerText = `${hostProps.length > 0 ? hostProps.length : 5} Properties`;

  const listContainer = document.getElementById('host-properties-list');
  listContainer.innerHTML = hostProps.map(p => `
    <div class="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between">
      <div>
        <div class="relative aspect-[16/9] bg-gray-100">
          <img src="${p.images[0]}" class="w-full h-full object-cover" />
          <span class="absolute top-3 right-3 bg-black text-white font-bold px-3 py-1 rounded-full text-xs shadow-md">
            ${window.formatINR(p.price)}/night
          </span>
        </div>
        <div class="p-5 space-y-2">
          <h3 class="font-bold text-gray-900 text-base line-clamp-1 font-display">${p.title}</h3>
          <p class="text-xs text-gray-500 font-medium">📍 ${p.city}</p>
          <div class="flex items-center space-x-2 text-xs font-semibold text-gray-600 pt-1">
            <span>★ ${p.rating} (${p.reviews} reviews)</span>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
        <button onclick="handleEditPropertyPrice('${p.id}')" class="text-xs font-bold text-blue-600 hover:underline">
          Edit Price (₹)
        </button>
        <button onclick="handleDeleteProperty('${p.id}')" class="text-xs font-bold text-red-600 hover:underline">
          Delete Listing
        </button>
      </div>
    </div>
  `).join('');
};

window.handleEditPropertyPrice = function(propId) {
  const prop = window.PROPERTIES.find(p => p.id === propId);
  if (!prop) return;

  const newPriceStr = prompt(`Enter new price per night (₹ INR) for "${prop.title}":`, prop.price);
  if (newPriceStr && !isNaN(Number(newPriceStr))) {
    prop.price = Number(newPriceStr);
    window.saveStorageItem('haven_properties_db', window.PROPERTIES);
    window.renderPropertyGrid();
    window.renderHostDashboard();
    alert(`✓ Price updated to ${window.formatINR(prop.price)} in database!`);
  }
};

window.handleDeleteProperty = function(propId) {
  if (confirm('Are you sure you want to delete this property from the database?')) {
    window.PROPERTIES = window.PROPERTIES.filter(p => p.id !== propId);
    window.saveStorageItem('haven_properties_db', window.PROPERTIES);
    window.renderPropertyGrid();
    window.renderHostDashboard();
    alert('✓ Property deleted from database.');
  }
};

window.openHostListingsModal = function() {
  const hostId = window.currentUser ? (window.currentUser.email === 'host@heavenstay.in' ? 'host_001' : window.currentUser.email) : 'host_001';
  const hostProps = window.PROPERTIES.filter(p => p.hostId === hostId || hostId === 'host_001');

  const gridContainer = document.getElementById('listings-modal-grid');
  gridContainer.innerHTML = hostProps.map(p => `
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between p-3 space-y-3">
      <div class="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 relative">
        <img src="${p.images[0]}" class="w-full h-full object-cover" />
        <span class="absolute top-2 right-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          ${window.formatINR(p.price)}/night
        </span>
      </div>
      <div>
        <h4 class="font-bold text-xs text-gray-900 line-clamp-1 font-display">${p.title}</h4>
        <p class="text-[11px] text-gray-500">📍 ${p.city}</p>
      </div>
      <div class="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
        <button onclick="handleEditPropertyPrice('${p.id}'); openHostListingsModal();" class="text-blue-600 font-bold hover:underline">Edit Price</button>
        <button onclick="handleDeleteProperty('${p.id}'); openHostListingsModal();" class="text-red-600 font-bold hover:underline">Delete</button>
      </div>
    </div>
  `).join('');

  document.getElementById('modal-host-listings').classList.remove('hidden');
};

window.openHostPayoutModal = function() {
  const hostId = window.currentUser ? (window.currentUser.email === 'host@heavenstay.in' ? 'host_001' : window.currentUser.email) : 'host_001';
  const hostBookings = window.bookings.filter(b => b.hostId === hostId || hostId === 'host_001');
  const totalPayout = hostBookings.reduce((sum, b) => sum + (b.totalPaid || 0), 0);

  document.getElementById('payout-modal-total').innerText = window.formatINR(totalPayout > 0 ? totalPayout : 198240);

  const listContainer = document.getElementById('payout-modal-list');
  listContainer.innerHTML = hostBookings.map(b => `
    <div class="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <div class="flex items-center space-x-2">
          <span class="font-bold text-sm text-gray-900">${b.guestName}</span>
          <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">WebAuthn Settled</span>
        </div>
        <p class="text-xs text-gray-600 mt-0.5">${b.propertyTitle}</p>
        <p class="text-[11px] text-gray-400 font-mono mt-0.5">TxHash: ${b.txHash} • Dates: ${b.checkIn} to ${b.checkOut}</p>
      </div>
      <div class="text-left sm:text-right flex-shrink-0">
        <span class="text-base sm:text-lg font-black text-gray-900 font-display">${window.formatINR(b.totalPaid)}</span>
        <span class="block text-[10px] text-gray-500">100% Direct Payout</span>
      </div>
    </div>
  `).join('');

  document.getElementById('modal-host-payout').classList.remove('hidden');
};

window.openHostCompletedStaysModal = function() {
  const hostId = window.currentUser ? (window.currentUser.email === 'host@heavenstay.in' ? 'host_001' : window.currentUser.email) : 'host_001';
  const hostBookings = window.bookings.filter(b => b.hostId === hostId || hostId === 'host_001');

  const listContainer = document.getElementById('completed-stays-modal-list');
  listContainer.innerHTML = hostBookings.map(b => `
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
      <div class="flex justify-between items-start">
        <div>
          <span class="text-xs font-bold text-blue-600 uppercase tracking-wider">📍 ${b.propertyCity}</span>
          <h4 class="font-bold text-sm sm:text-base text-gray-900 font-display mt-0.5">${b.propertyTitle}</h4>
        </div>
        <span class="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
          ★ 5.0
        </span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl text-xs">
        <div>
          <span class="block text-[10px] font-extrabold uppercase text-gray-400">Guest Name</span>
          <span class="font-bold text-gray-900">${b.guestName}</span>
        </div>
        <div>
          <span class="block text-[10px] font-extrabold uppercase text-gray-400">Contact</span>
          <span class="font-semibold text-gray-700">${b.guestPhone || '+91 98123 45678'}</span>
        </div>
        <div class="col-span-2 sm:col-span-1">
          <span class="block text-[10px] font-extrabold uppercase text-gray-400">Duration</span>
          <span class="font-bold text-gray-900">${b.nights} Nights</span>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 text-xs border-t border-gray-100">
        <span class="text-gray-500">Dates: <strong>${b.checkIn}</strong> to <strong>${b.checkOut}</strong></span>
        <button onclick="alert('Calling Guest ${b.guestName} (${b.guestPhone || '+91 98123 45678'})...')" class="w-full sm:w-auto bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-xl hover:bg-neutral-800">
          Call Guest
        </button>
      </div>
    </div>
  `).join('');

  document.getElementById('modal-host-stays').classList.remove('hidden');
};
