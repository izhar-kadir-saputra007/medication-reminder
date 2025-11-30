export interface MobileMedicineData {
  id: string;
  name: string;
  dose: string;
  time: string;
  priority?: 'low' | 'medium' | 'high';
}

export class MobileNotificationService {
  // Request permission untuk mobile
  static async requestMobilePermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser mobile tidak mendukung notifikasi');
      return false;
    }

    // Di mobile, permission biasanya sudah granted jika user mengizinkan
    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Izin notifikasi ditolak di mobile');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Mobile notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting mobile notification permission:', error);
      return false;
    }
  }

  // Trigger mobile notification seperti WA
  static async triggerMobilePopup(medicineData: MobileMedicineData): Promise<boolean> {
    console.log('Triggering mobile popup for:', medicineData.name);
    
    try {
      // Cek service worker untuk mobile
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker tidak didukung di browser ini');
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Konfigurasi untuk mobile notification
      const notificationOptions = {
        body: `Dosis: ${medicineData.dose}\nWaktu: ${medicineData.time}`,
        icon: '/android-icon-192x192.png',
        badge: '/android-icon-192x192.png',
        tag: `mobile-${medicineData.id}-${Date.now()}`,
        requireInteraction: true, // Tetap terbuka sampai user action
        silent: false,
        vibrate: this.getVibrationPattern(medicineData.priority),
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
          time: medicineData.time,
          priority: medicineData.priority || 'medium',
          url: window.location.origin,
          timestamp: new Date().toISOString()
        }
      };

      console.log('Sending mobile notification with options:', notificationOptions);
      
      await registration.showNotification(`💊 ${medicineData.name}`, notificationOptions);
      
      console.log('Mobile popup notification sent successfully');
      return true;

    } catch (error: any) {
      console.error('Failed to send mobile popup:', error);
      
      // Fallback untuk browser yang tidak support service worker
      return await this.fallbackMobileNotification(medicineData);
    }
  }

  // Fallback untuk mobile
  private static async fallbackMobileNotification(medicineData: MobileMedicineData): Promise<boolean> {
    try {
      const permissionGranted = await this.requestMobilePermission();
      if (!permissionGranted) return false;

      const notification = new Notification(`💊 ${medicineData.name}`, {
        body: `Dosis: ${medicineData.dose} - ${medicineData.time}`,
        icon: '/android-icon-192x192.png',
        tag: `mobile-fallback-${medicineData.id}`,
        requireInteraction: true
      });

      // Handle click untuk fallback
      notification.onclick = () => {
        console.log('Fallback mobile notification clicked');
        window.focus();
      };

      return true;
    } catch (error: any) {
      console.error('Fallback mobile notification failed:', error);
      return false;
    }
  }

  // Vibration pattern berdasarkan priority (seperti WA)
  private static getVibrationPattern(priority: string = 'medium'): number[] {
    switch (priority) {
      case 'high':
        return [500, 200, 500, 200, 500]; // Panjang dan berulang
      case 'medium':
        return [300, 100, 300]; // Sedang
      case 'low':
        return [200, 100]; // Pendek
      default:
        return [200, 100, 200]; // Default seperti WA
    }
  }

  // Test mobile notifications dengan berbagai skenario
  static async testMobileNotifications(): Promise<Array<{ medicine: string; success: boolean; type: string }>> {
    const testScenarios: MobileMedicineData[] = [
      {
        id: 'mobile-test-1',
        name: 'Panadol',
        dose: '1 tablet 500mg',
        time: '08:00',
        priority: 'medium'
      },
      {
        id: 'mobile-test-2',
        name: 'Vitamin C',
        dose: '1 kapsul 1000mg',
        time: '12:00',
        priority: 'low'
      },
      {
        id: 'mobile-test-3',
        name: 'ANTIBIOTIK',
        dose: '2 tablet (PENTING)',
        time: '20:00',
        priority: 'high'
      }
    ];

    const results: Array<{ medicine: string; success: boolean; type: string }> = [];
    
    for (const medicine of testScenarios) {
      console.log(`Testing mobile notification for: ${medicine.name}`);
      const success = await this.triggerMobilePopup(medicine);
      results.push({ 
        medicine: medicine.name, 
        success, 
        type: `${medicine.priority} priority` 
      });
      
      // Tunggu 3 detik antara notifikasi
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return results;
  }

  // Schedule mobile notification
  static async scheduleMobileNotification(medicineData: MobileMedicineData, delaySeconds: number = 10): Promise<boolean> {
    console.log(`Scheduling mobile notification for ${medicineData.name} in ${delaySeconds} seconds`);
    
    return new Promise<boolean>((resolve) => {
      setTimeout(async () => {
        try {
          const success = await this.triggerMobilePopup(medicineData);
          resolve(success);
        } catch (error) {
          console.error('Scheduled mobile notification failed:', error);
          resolve(false);
        }
      }, delaySeconds * 1000);
    });
  }

  // Check mobile notification support
  static checkMobileSupport(): {
    supported: boolean;
    serviceWorker: boolean;
    vibration: boolean;
    permission: string;
    isMobile: boolean;
  } {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const supported = 'Notification' in window;
    const serviceWorker = 'serviceWorker' in navigator;
    const vibration = 'vibrate' in navigator;

    return {
      supported,
      serviceWorker,
      vibration,
      permission: supported ? Notification.permission : 'unsupported',
      isMobile
    };
  }
}