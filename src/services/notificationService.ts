export interface MedicineData {
  id: string;
  name: string;
  dose: string;
  time: string;
}

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

  // Method untuk trigger popup notification seperti WA
  static async triggerPopupNotification(medicineData: MedicineData): Promise<boolean> {
    console.log('Triggering popup notification:', medicineData);
    
    try {
      // Cek service worker support - PERBAIKAN SYNTAX
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker tidak didukung');
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Gunakan showNotification dari Service Worker untuk popup
      await registration.showNotification(`💊 Waktu Minum ${medicineData.name}`, {
        body: `Dosis: ${medicineData.dose} - ${medicineData.time}`,
        icon: '/android-icon-192x192.png',
        badge: '/android-icon-192x192.png',
        tag: `medicine-${medicineData.id}-${Date.now()}`, // Unique tag
        requireInteraction: true, // Popup tetap terbuka
        silent: false,
        vibrate: [100, 50, 100], // Vibrate pattern
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
          medicineId: medicineData.id,
          medicineName: medicineData.name,
          dose: medicineData.dose,
          url: window.location.origin,
          timestamp: new Date().toISOString()
        }
      });

      console.log('Popup notification shown successfully');
      return true;

    } catch (error: any) {
      console.error('Failed to show popup notification:', error);
      
      // Fallback ke regular notification
      return await this.showFallbackNotification(medicineData);
    }
  }

  // Fallback ke regular notification
  private static async showFallbackNotification(medicineData: MedicineData): Promise<boolean> {
    try {
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) return false;

      const notification = new Notification(`💊 Waktu Minum ${medicineData.name}`, {
        body: `Dosis: ${medicineData.dose} - ${medicineData.time}`,
        icon: '/android-icon-192x192.png',
        tag: `medicine-${medicineData.id}`,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (error: any) {
      console.error('Fallback notification also failed:', error);
      return false;
    }
  }

  // Schedule popup notification untuk waktu tertentu
  static async schedulePopupNotification(medicineData: MedicineData, triggerTime: Date): Promise<boolean> {
    const now = new Date();
    const delay = triggerTime.getTime() - now.getTime();

    if (delay <= 0) {
      throw new Error('Waktu notifikasi sudah lewat');
    }

    console.log(`Scheduling popup notification for ${medicineData.name} in ${delay}ms`);

    // Schedule dengan background sync jika available
    if (('serviceWorker' in navigator) && ('sync' in (self as any).registration)) {
      try {
        await this.registerBackgroundSync(medicineData, triggerTime);
        return true;
      } catch (error) {
        console.warn('Background sync failed, using setTimeout');
      }
    }

    // Fallback ke setTimeout
    return new Promise<boolean>((resolve) => {
      setTimeout(async () => {
        try {
          const success = await this.triggerPopupNotification(medicineData);
          resolve(success);
        } catch (error) {
          console.error('Scheduled popup notification failed:', error);
          resolve(false);
        }
      }, delay);
    });
  }

  private static async registerBackgroundSync(medicineData: MedicineData, triggerTime: Date): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    const syncTag = `medicine-reminder-${JSON.stringify({
      id: medicineData.id,
      name: medicineData.name,
      dose: medicineData.dose,
      time: triggerTime.toLocaleTimeString('id-ID')
    })}`;

    await (registration as any).sync.register(syncTag);
    console.log('Background sync registered for popup notification:', syncTag);
  }

  // Test different types of popup notifications
  static async testPopupNotifications(): Promise<Array<{ medicine: string; success: boolean }>> {
    const testMedicines: MedicineData[] = [
      {
        id: 'test-1',
        name: 'Panadol',
        dose: '1 tablet 500mg',
        time: '08:00'
      },
      {
        id: 'test-2', 
        name: 'Vitamin C',
        dose: '1 kapsul 1000mg',
        time: '12:00'
      },
      {
        id: 'test-3',
        name: 'Antibiotik',
        dose: '2 tablet',
        time: '20:00'
      }
    ];

    const results: Array<{ medicine: string; success: boolean }> = [];
    
    for (const medicine of testMedicines) {
      const result = await this.triggerPopupNotification(medicine);
      results.push({ medicine: medicine.name, success: result });
      
      // Tunggu 2 detik antara notifikasi
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return results;
  }

  // Check notification support
  static async checkPopupSupport(): Promise<{
    notification: boolean;
    serviceWorker: boolean;
    pushManager: boolean;
    sync: boolean;
    permission: string;
  }> {
    const supported = 'Notification' in window;
    const permission = supported ? Notification.permission : 'unsupported';
    const serviceWorker = 'serviceWorker' in navigator;
    const pushManager = 'PushManager' in window;
    const sync = 'SyncManager' in window;

    return { 
      notification: supported, 
      serviceWorker, 
      pushManager, 
      sync, 
      permission 
    };
  }
}