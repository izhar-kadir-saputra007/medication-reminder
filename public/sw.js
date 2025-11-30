const CACHE_NAME = 'medicine-reminder-v1';

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// Activate Service Worker  
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

// Handle Push Notifications (Popup seperti WA)
self.addEventListener('push', (event) => {
  console.log('Push Notification Received:', event);
  
  if (!event.data) {
    console.log('Push event without data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Pengingat Obat',
      body: event.data.text() || 'Waktu minum obat!',
      medicine: 'Obat',
      dose: '',
      time: new Date().toLocaleTimeString('id-ID')
    };
  }

  const options = {
    body: data.body || `Waktunya minum ${data.medicine} ${data.dose}`,
    icon: '/android-icon-192x192.png',
    badge: '/android-icon-192x192.png',
    image: '/android-icon-192x192.png', // Optional: large image
    tag: `medicine-${data.medicine}-${Date.now()}`,
    requireInteraction: true, // Tetap terbuka sampai user action
    silent: false, // Pastikan ada sound/vibrate
    vibrate: [100, 50, 100], // Pattern vibrate
    actions: [
      {
        action: 'taken',
        title: '✅ Sudah Minum',
        icon: '/android-icon-192x192.png'
      },
      {
        action: 'snooze', 
        title: '⏰ Tunda 10m',
        icon: '/android-icon-192x192.png'
      }
    ],
    data: {
      url: '/', // URL untuk redirect ketika diklik
      medicineId: data.medicineId,
      scheduledTime: data.scheduledTime
    }
  };

  console.log('Showing popup notification:', data.title, options);

  event.waitUntil(
    self.registration.showNotification(data.title || '💊 Pengingat Obat', options)
  );
});

// Handle Notification Clicks (Popup Actions)
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked - Action:', event.action);
  console.log('Notification data:', event.notification.data);
  
  const notification = event.notification;
  const action = event.action;
  const medicineData = notification.data;

  notification.close();

  // Handle different actions
  if (action === 'taken') {
    console.log('Medicine taken:', medicineData.medicineId);
    // Simpan ke localStorage atau kirim ke main app
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'MEDICINE_TAKEN',
            medicineId: medicineData.medicineId,
            timestamp: new Date().toISOString()
          });
        });
      })
    );
    
  } else if (action === 'snooze') {
    console.log('Medicine snoozed:', medicineData.medicineId);
    // Kirim message untuk snooze
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'MEDICINE_SNOOZED', 
            medicineId: medicineData.medicineId,
            duration: 10 // menit
          });
        });
      })
    );
    
  } else {
    // User clicked the notification body (bukan tombol action)
    console.log('Notification body clicked');
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        // Focus existing app atau buka baru
        for (const client of clientList) {
          if (client.url === medicineData.url && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(medicineData.url || '/');
        }
      })
    );
  }
});

// Handle background sync untuk notifikasi terjadwal
self.addEventListener('sync', (event) => {
  if (event.tag.startsWith('medicine-reminder-')) {
    console.log('Background sync for medicine reminder:', event.tag);
    event.waitUntil(triggerScheduledNotification(event.tag));
  }
});

async function triggerScheduledNotification(syncTag) {
  // Extract medicine data dari sync tag
  const medicineData = JSON.parse(syncTag.replace('medicine-reminder-', ''));
  
  // Trigger push notification
  await self.registration.showNotification(`💊 Waktu Minum ${medicineData.name}`, {
    body: `Dosis: ${medicineData.dose} - ${medicineData.time}`,
    icon: '/android-icon-192x192.png',
    tag: `medicine-${medicineData.id}-${Date.now()}`,
    requireInteraction: true,
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