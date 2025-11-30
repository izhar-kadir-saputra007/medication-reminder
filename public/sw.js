// Enhanced Service Worker untuk notifikasi mobile lengkap
const CACHE_NAME = 'medicine-reminder-v2.0.0';
const APP_VERSION = '2.0.0';

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing version', APP_VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating version', APP_VERSION);
  event.waitUntil(self.clients.claim());
});

// Background Sync untuk notifikasi terjadwal
self.addEventListener('sync', (event) => {
  if (event.tag.startsWith('bg-medicine-')) {
    console.log('Background Sync triggered:', event.tag);
    event.waitUntil(handleBackgroundSync(event.tag));
  }
});

async function handleBackgroundSync(syncTag) {
  try {
    const medicineData = JSON.parse(syncTag.replace('bg-medicine-', ''));
    console.log('Processing background sync for:', medicineData.name);
    
    await showMobileNotification(medicineData);
    
    // Update badge count
    await updateBadgeCount(1);
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push Notification dengan semua fitur mobile
self.addEventListener('push', (event) => {
  console.log('Push event received for mobile notification');
  
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: '💊 Pengingat Obat',
      body: 'Waktunya minum obat!',
      medicine: 'Obat',
      dose: '',
      time: 'Sekarang',
      type: 'medicine_reminder'
    };
  }

  event.waitUntil(
    showMobileNotification(data).then(() => {
      // Update badge
      return updateBadgeCount(1);
    })
  );
});

// Fungsi utama untuk menampilkan notifikasi mobile
async function showMobileNotification(data) {
  const options = {
    // Konten notifikasi
    body: data.body || `Waktunya minum ${data.medicine} ${data.dose}`,
    title: data.title || `💊 ${data.medicine}`,
    
    // Icons dan badges
    icon: '/android-icon-192x192.png',
    badge: '/android-icon-192x192.png',
    image: '/android-icon-512x512.png',
    
    // Metadata
    tag: `medicine-${data.medicineId || data.id || 'reminder'}-${Date.now()}`,
    timestamp: Date.now(),
    
    // Perilaku notifikasi
    requireInteraction: true,
    silent: false,
    
    // Fitur mobile
    vibrate: getVibrationPattern(data.priority),
    sound: '/notification-sound.mp3', // Opsional
    
    // Actions
    actions: [
      { action: 'taken', title: '✅ Sudah Minum' },
      { action: 'snooze', title: '⏰ Tunda 10m' }
    ],
    
    // Data tambahan
    data: {
      medicineId: data.medicineId || data.id,
      medicineName: data.medicine,
      dose: data.dose,
      time: data.time,
      priority: data.priority || 'medium',
      type: data.type || 'medicine_reminder',
      timestamp: data.timestamp || new Date().toISOString(),
      url: data.url || '/'
    }
  };

  console.log('Showing mobile notification with options:', options);
  
  return self.registration.showNotification(options.title, options);
}

// Handle semua interaksi notifikasi
self.addEventListener('notificationclick', (event) => {
  console.log('Mobile notification clicked - Action:', event.action);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data;

  notification.close();

  // Handle different actions
  switch (action) {
    case 'taken':
      handleMedicineTaken(data);
      break;
    case 'snooze':
      handleMedicineSnoozed(data);
      break;
    default:
      handleNotificationClick(data);
      break;
  }

  // Update badge count ketika notifikasi diinteraksi
  updateBadgeCount(-1);
});

function handleMedicineTaken(data) {
  console.log('Medicine taken:', data.medicineName);
  
  // Kirim ke app utama
  sendMessageToClients({
    type: 'MEDICINE_TAKEN',
    medicineId: data.medicineId,
    medicineName: data.medicineName,
    timestamp: new Date().toISOString()
  });
  
  // Simpan ke storage
  saveMedicineHistory(data, 'taken');
}

function handleMedicineSnoozed(data) {
  console.log('Medicine snoozed:', data.medicineName);
  
  // Schedule ulang untuk 10 menit
  const snoozeTime = new Date(Date.now() + 10 * 60 * 1000);
  
  sendMessageToClients({
    type: 'MEDICINE_SNOOZED',
    medicineId: data.medicineId,
    duration: 10,
    rescheduleTime: snoozeTime.toISOString()
  });
}

function handleNotificationClick(data) {
  console.log('Notification body clicked');
  
  // Focus atau buka app
  self.clients.matchAll({ 
    type: 'window',
    includeUncontrolled: true 
  }).then((clientList) => {
    for (const client of clientList) {
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        return client.focus();
      }
    }
    if (self.clients.openWindow) {
      return self.clients.openWindow(data.url || '/');
    }
  });
}

// Helper functions
function getVibrationPattern(priority = 'medium') {
  switch (priority) {
    case 'high': return [1000, 500, 1000, 500, 1000]; // Panjang untuk high priority
    case 'medium': return [500, 250, 500]; // Medium seperti WA
    case 'low': return [200, 100]; // Pendek
    default: return [500, 250, 500];
  }
}

async function updateBadgeCount(countChange) {
  if ('setAppBadge' in navigator) {
    try {
      const currentCount = await navigator.clearAppBadge?.() || 0;
      const newCount = Math.max(0, currentCount + countChange);
      
      if (newCount > 0) {
        await navigator.setAppBadge(newCount);
      } else {
        await navigator.clearAppBadge();
      }
      console.log('Badge updated:', newCount);
    } catch (error) {
      console.log('Badge API not supported');
    }
  }
}

function sendMessageToClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}

function saveMedicineHistory(data, status) {
  // Simpan ke IndexedDB atau kirim ke server
  const history = {
    medicineId: data.medicineId,
    medicineName: data.medicineName,
    dose: data.dose,
    status: status,
    timestamp: new Date().toISOString()
  };
  
  console.log('Saving medicine history:', history);
}

// Periodic Sync untuk notifikasi berulang
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'medicine-reminder-check') {
    console.log('Periodic sync for medicine reminders');
    event.waitUntil(checkPendingReminders());
  }
});

async function checkPendingReminders() {
  // Cek jika ada reminder yang pending
  console.log('Checking for pending reminders...');
}