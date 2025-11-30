// Service Worker untuk notifikasi mobile
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing for mobile notifications...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating for mobile notifications...');
  event.waitUntil(self.clients.claim());
});

// Handle push notifications untuk mobile
self.addEventListener('push', (event) => {
  console.log('Push notification received for mobile');
  
  if (!event.data) {
    console.log('No data in push event');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: '💊 Pengingat Obat',
      body: 'Waktunya minum obat!',
      medicine: 'Obat',
      dose: '',
      time: 'Sekarang'
    };
  }

  // Options untuk mobile notification (seperti WA)
  const options = {
    body: data.body || `Waktunya minum ${data.medicine} ${data.dose}`,
    icon: '/android-icon-192x192.png',
    badge: '/android-icon-192x192.png',
    image: '/android-icon-192x192.png', // Gambar besar (opsional)
    tag: `medicine-${data.medicineId || 'reminder'}-${Date.now()}`,
    requireInteraction: true, // Tetap terbuka sampai user action
    silent: false, // Ada suara
    vibrate: [200, 100, 200, 100, 200], // Pattern vibrate seperti WA
    actions: [
      {
        action: 'taken',
        title: '✅ Sudah Minum'
      },
      {
        action: 'snooze', 
        title: '⏰ Tunda 10m'
      }
    ],
    data: {
      medicineId: data.medicineId,
      medicineName: data.medicine,
      dose: data.dose,
      timestamp: data.timestamp || new Date().toISOString(),
      url: data.url || '/'
    },
    // Mobile-specific options
    dir: 'ltr', // Text direction
    lang: 'id-ID', // Language
    timestamp: Date.now()
  };

  console.log('Showing mobile notification:', data.title);

  event.waitUntil(
    self.registration.showNotification(data.title || '💊 Pengingat Obat', options)
      .then(() => console.log('Mobile notification shown successfully'))
      .catch(error => console.error('Failed to show mobile notification:', error))
  );
});

// Handle notification clicks di mobile
self.addEventListener('notificationclick', (event) => {
  console.log('Mobile notification clicked - Action:', event.action);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data;

  notification.close();

  // Handle actions
  if (action === 'taken') {
    console.log('Medicine taken on mobile:', data.medicineName);
    // Kirim message ke app
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'MEDICINE_TAKEN_MOBILE',
            medicineId: data.medicineId,
            medicineName: data.medicineName,
            timestamp: new Date().toISOString()
          });
        });
      })
    );
    
  } else if (action === 'snooze') {
    console.log('Medicine snoozed on mobile:', data.medicineName);
    // Kirim message untuk snooze
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'MEDICINE_SNOOZED_MOBILE',
            medicineId: data.medicineId,
            duration: 10 // menit
          });
        });
      })
    );
    
  } else {
    // User klik body notifikasi (bukan tombol action)
    console.log('Mobile notification body clicked');
    
    event.waitUntil(
      self.clients.matchAll({ 
        type: 'window',
        includeUncontrolled: true 
      }).then((clientList) => {
        // Cari client yang sudah terbuka
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('Focusing existing app window');
            return client.focus();
          }
        }
        
        // Buka app baru jika tidak ada yang terbuka
        if (self.clients.openWindow) {
          console.log('Opening new app window');
          return self.clients.openWindow(data.url || '/');
        }
      })
    );
  }
});

// Background sync untuk mobile
self.addEventListener('sync', (event) => {
  if (event.tag.startsWith('mobile-medicine-')) {
    console.log('Background sync for mobile notification:', event.tag);
    event.waitUntil(triggerMobileNotification(event.tag));
  }
});

async function triggerMobileNotification(syncTag) {
  const medicineData = JSON.parse(syncTag.replace('mobile-medicine-', ''));
  
  await self.registration.showNotification(`💊 ${medicineData.name}`, {
    body: `${medicineData.dose} - ${medicineData.time}`,
    icon: '/android-icon-192x192.png',
    tag: `mobile-${medicineData.id}-${Date.now()}`,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'taken', title: '✅ Sudah Minum' },
      { action: 'snooze', title: '⏰ Tunda 10m' }
    ],
    data: {
      medicineId: medicineData.id,
      url: '/'
    }
  });
}