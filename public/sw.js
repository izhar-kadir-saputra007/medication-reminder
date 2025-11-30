// Handle Push Notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (!event.data) {
    console.log('Push event without data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.log('Push data is not JSON, using text');
    data = { title: 'Pengingat Obat', body: event.data.text() };
  }

  const options = {
    body: data.body || 'Waktu minum obat!',
    icon: data.icon || '/android-icon-192x192.png',
    badge: '/android-icon-192x192.png',
    tag: data.tag || 'medicine-reminder',
    requireInteraction: true,
    actions: [
      { action: 'taken', title: '✅ Sudah Minum' },
      { action: 'snooze', title: '⏰ Tunda 10m' }
    ],
    vibrate: [200, 100, 200]
  };

  console.log('Showing notification:', data.title, options);

  event.waitUntil(
    self.registration.showNotification(data.title || '💊 Pengingat Obat', options)
  );
});

// Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  event.notification.close();

  const action = event.action;

  if (action === 'taken') {
    console.log('User marked medicine as taken');
    // TODO: Simpan ke database/localStorage
  } else if (action === 'snooze') {
    console.log('User snoozed notification');
    // TODO: Implement snooze logic
  }

  // Focus atau buka aplikasi
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        console.log('Found existing client, focusing...');
        return clientList[0].focus();
      }
      console.log('No existing client, opening window...');
      return self.clients.openWindow('/');
    })
  );
});