export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser tidak mendukung notifikasi');
      return false;
    }

    try {
      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission === 'denied') {
        console.warn('Izin notifikasi ditolak oleh pengguna');
        return false;
      }

      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static async showMedicineReminder(medicineName: string, dose: string, time: string) {
    console.log('Attempting to show notification:', medicineName);
    
    try {
      const permissionGranted = await this.requestPermission();
      
      if (!permissionGranted) {
        throw new Error('Izin notifikasi tidak diberikan');
      }

      const options: NotificationOptions = {
        body: `Dosis: ${dose} - ${time}`,
        icon: '/android-icon-192x192.png',
        badge: '/android-icon-192x192.png',
        tag: `medicine-${medicineName}-${Date.now()}`,
        requireInteraction: true,
        actions: [
          { action: 'taken', title: '✅ Sudah Minum' },
          { action: 'snooze', title: '⏰ Tunda 10m' }
        ],
        vibrate: [200, 100, 200]
      };

      // Coba Service Worker first
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration.active) {
            await registration.showNotification(`💊 Waktu Minum ${medicineName}`, options);
            console.log('Notification shown via Service Worker');
            return true;
          }
        } catch (swError) {
          console.warn('Service Worker notification failed:', swError);
        }
      }

      // Fallback ke regular notification
      const notification = new Notification(`💊 Waktu Minum ${medicineName}`, options);
      console.log('Notification shown via regular API');
      
      // Handle notification clicks
      notification.onclick = () => {
        console.log('Notification clicked');
        window.focus();
      };

      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      throw error;
    }
  }

  static async scheduleNotification(medicineName: string, dose: string, triggerTime: Date) {
    const now = new Date();
    const delay = triggerTime.getTime() - now.getTime();

    if (delay <= 0) {
      throw new Error('Waktu notifikasi sudah lewat');
    }

    console.log(`Scheduling notification for ${medicineName} in ${delay}ms`);

    return new Promise<boolean>((resolve) => {
      setTimeout(async () => {
        try {
          const success = await this.showMedicineReminder(medicineName, dose, 
            triggerTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          );
          resolve(success);
        } catch (error) {
          console.error('Scheduled notification failed:', error);
          resolve(false);
        }
      }, delay);
    });
  }

  static async checkNotificationSupport(): Promise<{
    supported: boolean;
    permission: string;
    serviceWorker: boolean;
  }> {
    const supported = 'Notification' in window;
    const permission = supported ? Notification.permission : 'unsupported';
    const serviceWorker = 'serviceWorker' in navigator;

    return { supported, permission, serviceWorker };
  }
}