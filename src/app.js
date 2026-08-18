// HavenStays Core Application Controller

window.loadStorageItem = function(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch(e) {}
  return fallback;
};

window.saveStorageItem = function(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch(e) {}
};

// Global State
window.storedProperties = window.loadStorageItem('haven_properties_db', window.INITIAL_PROPERTIES);
if (!Array.isArray(window.storedProperties) || window.storedProperties.length < window.INITIAL_PROPERTIES.length) {
  const storedIds = new Set((window.storedProperties || []).map(p => p.id));
  window.INITIAL_PROPERTIES.forEach(p => {
    if (!storedIds.has(p.id)) window.storedProperties.push(p);
  });
  window.saveStorageItem('haven_properties_db', window.storedProperties);
}
window.PROPERTIES = window.storedProperties;
window.currentUser = window.loadStorageItem('haven_current_user', { name: 'Vikramaditya Thorne', email: 'host@heavenstay.in', role: 'host' });
window.bookings = window.loadStorageItem('haven_bookings_db', window.INITIAL_BOOKINGS);

window.currentProperty = window.PROPERTIES[0];
window.currentAuthMode = 'login';
window.guestState = { adults: 2, children: 0, males: 1, females: 1 };
window.selectedCheckIn = '2026-08-20';
window.selectedCheckOut = '2026-08-24';
window.filterAllCity = 'all';
window.filterAllPrice = 999999;
window.filterAllSort = 'featured';
window.selectedAuthRole = 'guest';
window.currentActiveGallery = window.GALLERY_IMAGES;
window.currentLightboxIndex = 0;

window.formatINR = function(val) {
  return '₹' + val.toLocaleString('en-IN');
};

window.toggleMobileNav = function() {
  const drawer = document.getElementById('mobile-nav-drawer');
  drawer.classList.toggle('hidden');
};

window.closeModal = function(id) {
  document.getElementById(id).classList.add('hidden');
};

// Gallery Logic
window.renderGallery = function(filterCity = 'all') {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  
  if (filterCity === 'all') {
    window.currentActiveGallery = window.GALLERY_IMAGES;
  } else {
    window.currentActiveGallery = window.GALLERY_IMAGES.filter(img => img.city.toLowerCase() === filterCity.toLowerCase());
  }

  grid.innerHTML = window.currentActiveGallery.map((img, idx) => `
    <div onclick="openGalleryLightbox(${idx})" class="group relative cursor-pointer rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 ${img.gridSpan}">
      <img src="${img.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-5 text-white">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">📍 ${img.location}</span>
        <h4 class="font-bold text-sm sm:text-base font-display mt-0.5">${img.title}</h4>
        <p class="text-[11px] sm:text-xs text-neutral-300 line-clamp-2 mt-1 font-normal">${img.caption}</p>
        <div class="pt-2 sm:pt-3">
          <span class="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full">
            🔍 Click to Expand ➔
          </span>
        </div>
      </div>
    </div>
  `).join('');
};

window.filterGallery = function(city) {
  ['all', 'manali', 'goa', 'udaipur', 'munnar'].forEach(c => {
    const btn = document.getElementById(`gfilter-${c}`);
    if (btn) {
      if (c === city.toLowerCase()) {
        btn.className = "bg-black text-white px-4 py-2 rounded-xl transition-all shadow-sm";
      } else {
        btn.className = "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl transition-all";
      }
    }
  });
  window.renderGallery(city);
};

window.openGalleryLightbox = function(index) {
  window.currentLightboxIndex = index;
  window.updateLightboxContent();
  document.getElementById('modal-gallery-lightbox').classList.remove('hidden');
};

window.updateLightboxContent = function() {
  const item = window.currentActiveGallery[window.currentLightboxIndex];
  if (!item) return;

  document.getElementById('lightbox-counter').innerText = `Photo ${window.currentLightboxIndex + 1} of ${window.currentActiveGallery.length}`;
  document.getElementById('lightbox-title').innerText = item.title;
  document.getElementById('lightbox-image').src = item.image;
  document.getElementById('lightbox-caption').innerText = item.caption;
  document.getElementById('lightbox-location').innerText = `📍 ${item.location}`;
};

window.navigateGallery = function(direction) {
  window.currentLightboxIndex = (window.currentLightboxIndex + direction + window.currentActiveGallery.length) % window.currentActiveGallery.length;
  window.updateLightboxContent();
};

window.closeGalleryLightbox = function() {
  document.getElementById('modal-gallery-lightbox').classList.add('hidden');
};

// Datepicker and Calendar Preset Logic
window.handleManualDateChange = function() {
  const cin = document.getElementById('calendar-manual-in').value;
  const cout = document.getElementById('calendar-manual-out').value;
  if (cin && cout && cin < cout) {
    window.setCalendarRange(cin, cout);
  }
};

window.setCalendarRange = function(checkin, checkout) {
  window.selectedCheckIn = checkin;
  window.selectedCheckOut = checkout;

  const d1 = new Date(checkin);
  const d2 = new Date(checkout);
  const nights = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
  const options = { month: 'short', day: 'numeric', year: 'numeric' };

  document.getElementById('detail-checkin-display').innerText = d1.toLocaleDateString('en-US', options);
  document.getElementById('detail-checkout-display').innerText = d2.toLocaleDateString('en-US', options);

  const badge = document.getElementById('calendar-nights-badge');
  if (badge) badge.innerText = `${nights} ${nights === 1 ? 'Night' : 'Nights'} Selected`;

  const manualIn = document.getElementById('calendar-manual-in');
  const manualOut = document.getElementById('calendar-manual-out');
  if (manualIn) manualIn.value = checkin;
  if (manualOut) manualOut.value = checkout;

  window.recalculatePrice();
};

window.selectCalendarPreset = function(type) {
  if (type === 'weekend') {
    window.setCalendarRange('2026-08-21', '2026-08-23');
  } else if (type === 'nextweek') {
    window.setCalendarRange('2026-08-24', '2026-08-28');
  } else if (type === '7days') {
    window.setCalendarRange('2026-08-20', '2026-08-27');
  }
};

// Custom Dropdowns
window.toggleDropdown = function(id) {
  const popover = document.getElementById(id);
  const isHidden = popover.classList.contains('hidden');
  window.closeAllDropdowns();
  if (isHidden) popover.classList.remove('hidden');
};

window.closeAllDropdowns = function() {
  const ids = [
    'hero-guest-counter-popover',
    'custom-calendar-popover',
    'all-city-popover',
    'all-price-popover',
    'all-sort-popover',
    'contact-subject-popover',
    'detail-guests-popover',
    'auth-role-popover'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
};

window.selectAllCity = function(val, label) {
  window.filterAllCity = val;
  document.getElementById('all-city-label').innerText = label;
  window.closeAllDropdowns();
  window.handleApplyAllStaysFilters();
};

window.selectAllPrice = function(val, label) {
  window.filterAllPrice = val;
  document.getElementById('all-price-label').innerText = label;
  window.closeAllDropdowns();
  window.handleApplyAllStaysFilters();
};

window.selectAllSort = function(val, label) {
  window.filterAllSort = val;
  document.getElementById('all-sort-label').innerText = label;
  window.closeAllDropdowns();
  window.handleApplyAllStaysFilters();
};

window.selectContactSubject = function(label) {
  document.getElementById('contact-subject-label').innerText = label;
  window.closeAllDropdowns();
};

// Property Rendering
window.renderPropertyGrid = function(filteredProps = window.PROPERTIES) {
  const grid = document.getElementById('property-grid');
  if (!grid) return;
  const homeFeaturedProps = filteredProps.slice(0, 6);

  const btnCount = document.getElementById('btn-view-all-count');
  if (btnCount) btnCount.innerText = `View All Stays (${window.PROPERTIES.length} Properties)`;

  grid.innerHTML = homeFeaturedProps.map(p => `
    <div onclick="openPropertyDetails('${p.id}')" class="group cursor-pointer space-y-3">
      <div class="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
        <img src="${p.images[0]}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
          ★ ${p.rating} (${p.reviews})
        </div>
        <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-800">
          Verified Host
        </div>
      </div>
      <div class="space-y-1">
        <h3 class="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors font-display">${p.title}</h3>
        <p class="text-xs text-gray-500 font-medium">📍 ${p.city}</p>
        <div class="pt-1 flex items-baseline space-x-1">
          <span class="text-lg font-extrabold text-gray-900 font-display">${window.formatINR(p.price)}</span>
          <span class="text-xs text-gray-500 font-medium">/ night</span>
        </div>
      </div>
    </div>
  `).join('');
};

window.renderAllStaysPage = function(propsList = window.PROPERTIES) {
  const grid = document.getElementById('all-stays-grid');
  if (!grid) return;
  grid.innerHTML = propsList.map(p => `
    <div onclick="openPropertyDetails('${p.id}')" class="group cursor-pointer space-y-3 bg-white p-4 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div class="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
        <img src="${p.images[0]}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
          ★ ${p.rating} (${p.reviews})
        </div>
      </div>
      <div class="space-y-1">
        <h3 class="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors font-display">${p.title}</h3>
        <p class="text-xs text-gray-500 font-medium">📍 ${p.city}</p>
        <div class="pt-2 flex justify-between items-baseline border-t border-gray-100">
          <span class="text-base sm:text-lg font-extrabold text-gray-900 font-display">${window.formatINR(p.price)} <span class="text-xs text-gray-500 font-normal">/ night</span></span>
          <span class="text-xs font-bold text-blue-600 group-hover:underline">View Details ➔</span>
        </div>
      </div>
    </div>
  `).join('');
};

window.handleApplyAllStaysFilters = function() {
  let filtered = window.PROPERTIES.filter(p => {
    if (window.filterAllCity !== 'all' && !p.city.toLowerCase().includes(window.filterAllCity.toLowerCase())) return false;
    if (p.price > window.filterAllPrice) return false;
    return true;
  });

  if (window.filterAllSort === 'low-high') filtered.sort((a, b) => a.price - b.price);
  if (window.filterAllSort === 'high-low') filtered.sort((a, b) => b.price - a.price);
  if (window.filterAllSort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

  window.renderAllStaysPage(filtered);
};

window.handleResetAllFilters = function() {
  window.filterAllCity = 'all';
  window.filterAllPrice = 999999;
  window.filterAllSort = 'featured';
  document.getElementById('all-city-label').innerText = 'All Destinations (India)';
  document.getElementById('all-price-label').innerText = 'Any Price Range';
  document.getElementById('all-sort-label').innerText = 'Featured First';
  window.renderAllStaysPage(window.PROPERTIES);
};

window.handleContactSubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('contact-name').value;
  alert(`✓ Thank you ${name}! Your message has been routed to our support team.`);
  document.getElementById('contact-message').value = '';
};

window.openPropertyDetails = function(id) {
  const prop = window.PROPERTIES.find(p => p.id === id) || window.PROPERTIES[0];
  window.currentProperty = prop;

  document.getElementById('detail-title').innerText = prop.title;
  document.getElementById('detail-tagline').innerText = prop.tagline;
  document.getElementById('detail-description').innerText = prop.description;
  document.getElementById('detail-location').innerText = prop.city;
  
  document.getElementById('spec-guests').innerText = prop.specs.guests;
  document.getElementById('spec-bedrooms').innerText = prop.specs.bedrooms;
  document.getElementById('spec-beds').innerText = prop.specs.beds;
  document.getElementById('spec-baths').innerText = prop.specs.baths;

  document.getElementById('host-name').innerText = 'Hosted by ' + prop.hostName;
  document.getElementById('host-avatar').src = prop.hostAvatar;

  document.getElementById('detail-amenities').innerHTML = prop.amenities.map(a => `
    <div class="bg-white p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium flex items-center space-x-2">
      <span class="text-blue-600 font-bold">✓</span>
      <span>${a}</span>
    </div>
  `).join('');

  document.getElementById('detail-bento').innerHTML = `
    <div class="md:col-span-2 aspect-[4/3] bg-gray-100 overflow-hidden">
      <img src="${prop.images[0]}" class="w-full h-full object-cover" />
    </div>
    <div class="hidden md:grid md:col-span-2 grid-cols-2 gap-2">
      ${prop.images.slice(1, 5).map(img => `
        <div class="aspect-square bg-gray-100 overflow-hidden">
          <img src="${img}" class="w-full h-full object-cover" />
        </div>
      `).join('')}
    </div>
  `;

  window.recalculatePrice();
  window.showPage('details');
};

window.handleSearchSubmit = function() {
  const city = document.getElementById('search-city').value.toLowerCase();
  const maxPrice = Number(document.getElementById('search-price').value);

  const filtered = window.PROPERTIES.filter(p => {
    if (city && !p.city.toLowerCase().includes(city)) return false;
    if (maxPrice && p.price > maxPrice) return false;
    return true;
  });

  window.renderPropertyGrid(filtered);
  window.showPage('catalog');
};

window.quickFilter = function(cityName) {
  document.getElementById('search-city').value = cityName;
  window.handleSearchSubmit();
};

window.showPage = function(pageName) {
  document.getElementById('view-home').classList.add('hidden');
  document.getElementById('view-all-stays').classList.add('hidden');
  document.getElementById('view-gallery').classList.add('hidden');
  document.getElementById('view-contact').classList.add('hidden');
  document.getElementById('view-details').classList.add('hidden');
  document.getElementById('view-guest-dash').classList.add('hidden');
  document.getElementById('view-host-dash').classList.add('hidden');

  if (pageName === 'home' || pageName === 'catalog') {
    document.getElementById('view-home').classList.remove('hidden');
  } else if (pageName === 'all-stays') {
    window.renderAllStaysPage();
    document.getElementById('view-all-stays').classList.remove('hidden');
  } else if (pageName === 'gallery') {
    window.renderGallery('all');
    document.getElementById('view-gallery').classList.remove('hidden');
  } else if (pageName === 'contact') {
    document.getElementById('view-contact').classList.remove('hidden');
  } else if (pageName === 'details') {
    document.getElementById('view-details').classList.remove('hidden');
  } else if (pageName === 'guest-dash') {
    window.renderGuestDashboard();
    document.getElementById('view-guest-dash').classList.remove('hidden');
  } else if (pageName === 'host-dash') {
    window.renderHostDashboard();
    document.getElementById('view-host-dash').classList.remove('hidden');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Global Event Listeners
document.addEventListener('click', function(e) {
  if (!e.target.closest('.relative')) {
    window.closeAllDropdowns();
  }
});

document.addEventListener('keydown', function(e) {
  const modal = document.getElementById('modal-gallery-lightbox');
  if (modal && !modal.classList.contains('hidden')) {
    if (e.key === 'ArrowLeft') window.navigateGallery(-1);
    if (e.key === 'ArrowRight') window.navigateGallery(1);
    if (e.key === 'Escape') window.closeGalleryLightbox();
  }
});

// Bootstrapping App
window.addEventListener('DOMContentLoaded', () => {
  window.updateAuthHeaderUI();
  window.renderPropertyGrid();
});
