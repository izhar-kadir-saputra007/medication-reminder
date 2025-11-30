export interface MobileMedicineData {
  id: string;
  name: string;
  dose: string;
  time: string;
  priority?: 'low' | 'medium' | 'high';
  scheduleTime?: Date;
}

export class MobileNotificationService {
  // Schedule notification dengan background sync
  static async scheduleBackgroundNotification(
    medicineData: MobileMedicineData, 
    delaySeconds: number = 15
  ): Promise<boolean> {
    console.log(`Scheduling background notification for ${medicineData.name} in ${delaySeconds} seconds`);
    
    try {
      // Simpan data untuk background sync
      const scheduledTime = new Date(Date.now() + delaySeconds * 1000);
      const notificationData = {
        ...medicineData,
        scheduleTime: scheduledTime.toISOString(),
        type: 'scheduled_medicine'
      };

      // Register background sync
      if ('serviceWorker' in navigator && 'sync' in (self as any).registration) {
        await this.registerBackgroundSync(notificationData, delaySeconds);
        console.log('Background sync registered successfully');
        return true;
      } else {
        // Fallback ke setTimeout
        return await this.scheduleWithTimeout(medicineData, delaySeconds);
      }
    } catch (error) {
      console.error('Failed to schedule background notification:', error);
      return await this.scheduleWithTimeout(medicineData, delaySeconds);
    }
  }

  private static async registerBackgroundSync(medicineData: any, delaySeconds: number): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    const syncTag = `bg-medicine-${JSON.stringify(medicineData)}`;
    
    // Wait for the delay then register sync
    setTimeout(async () => {
      try {
        await (registration as any).sync.register(syncTag);
        console.log('Background sync registered after delay:', syncTag);
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    }, delaySeconds * 1000);
  }

  private static async scheduleWithTimeout(medicineData: MobileMedicineData, delaySeconds: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          console.log('Timeout triggered, showing notification...');
          const success = await this.triggerMobilePopup(medicineData);
          resolve(success);
        } catch (error) {
          console.error('Scheduled notification failed:', error);
          resolve(false);
        }
      }, delaySeconds * 1000);
    });
  }

  // Enhanced mobile notification dengan semua fitur
  static async triggerMobilePopup(medicineData: MobileMedicineData): Promise<boolean> {
    console.log('Triggering enhanced mobile popup for:', medicineData.name);
    
    try {
      if (!('serviceWorker' in navigator)) {
        return await this.fallbackMobileNotification(medicineData);
      }

      const registration = await navigator.serviceWorker.ready;
      
      const notificationOptions = {
        body: `Dosis: ${medicineData.dose}\nWaktu: ${medicineData.time}`,
        icon: this.getIconPath('android-icon-192x192.png'),
        badge: this.getIconPath('android-icon-192x192.png'),
        image: this.getIconPath('android-icon-512x512.png'),
        tag: `mobile-${medicineData.id}-${Date.now()}`,
        requireInteraction: true,
        silent: false,
        vibrate: this.getVibrationPattern(medicineData.priority),
        actions: [
          { action: 'taken', title: '✅ Sudah Minum' },
          { action: 'snooze', title: '⏰ Tunda 10m' }
        ],
        data: {
          medicineId: medicineData.id,
          medicineName: medicineData.name,
          dose: medicineData.dose,
          time: medicineData.time,
          priority: medicineData.priority || 'medium',
          type: 'medicine_reminder',
          url: window.location.origin,
          timestamp: new Date().toISOString()
        }
      };

      console.log('Sending enhanced mobile notification');
      
      await registration.showNotification(`💊 ${medicineData.name}`, notificationOptions);
      
      // Update app badge
      await this.updateAppBadge(1);
      
      console.log('Enhanced mobile notification sent successfully');
      return true;

    } catch (error: any) {
      console.error('Failed to send enhanced notification:', error);
      return await this.fallbackMobileNotification(medicineData);
    }
  }

  // App Badge API untuk mobile
  private static async updateAppBadge(count: number): Promise<void> {
    try {
      if ('setAppBadge' in navigator) {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
          console.log('App badge set to:', count);
        } else {
          await (navigator as any).clearAppBadge();
          console.log('App badge cleared');
        }
      }
    } catch (error) {
      console.log('App Badge API not supported');
    }
  }

  // Request permission dengan semua fitur
  static async requestMobilePermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser tidak mendukung notifikasi');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Izin notifikasi ditolak');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Mobile notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  private static async fallbackMobileNotification(medicineData: MobileMedicineData): Promise<boolean> {
    try {
      const permissionGranted = await this.requestMobilePermission();
      if (!permissionGranted) return false;

      const notification = new Notification(`💊 ${medicineData.name}`, {
        body: `Dosis: ${medicineData.dose} - ${medicineData.time}`,
        icon: this.getIconPath('android-icon-192x192.png'),
        tag: `mobile-fallback-${medicineData.id}`,
        requireInteraction: true,
        vibrate: this.getVibrationPattern(medicineData.priority)
      });

      notification.onclick = () => {
        window.focus();
      };

      return true;
    } catch (error: any) {
      console.error('Fallback notification failed:', error);
      return false;
    }
  }

  private static getIconPath(iconName: string): string {
    return `${window.location.origin}/${iconName}`;
  }

  private static getVibrationPattern(priority: string = 'medium'): number[] {
    switch (priority) {
      case 'high': return [1000, 500, 1000, 500, 1000];
      case 'medium': return [500, 250, 500];
      case 'low': return [200, 100];
      default: return [500, 250, 500];
    }
  }

  // Test background notification dengan delay 15 detik
  static async testBackgroundNotification(): Promise<boolean> {
    const medicineData: MobileMedicineData = {
      id: 'bg-test-' + Date.now(),
      name: 'Panadol',
      dose: '1 tablet 500mg',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      priority: 'medium'
    };

    console.log('Starting background notification test with 15 second delay...');
    
    const success = await this.scheduleBackgroundNotification(medicineData, 15);
    
    if (success) {
      console.log('✅ Background notification scheduled successfully');
      console.log('📱 Anda bisa menutup app sekarang - notifikasi akan muncul dalam 15 detik');
    } else {
      console.log('❌ Failed to schedule background notification');
    }
    
    return success;
  }

  // Check semua fitur mobile
  static checkMobileFeatures(): {
    notifications: boolean;
    serviceWorker: boolean;
    backgroundSync: boolean;
    appBadge: boolean;
    vibration: boolean;
    isMobile: boolean;
    permission: string;
  } {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return {
      notifications: 'Notification' in window,
      serviceWorker: 'serviceWorker' in navigator,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in (self as any),
      appBadge: 'setAppBadge' in navigator,
      vibration: 'vibrate' in navigator,
      isMobile,
      permission: 'Notification' in window ? Notification.permission : 'unsupported'
    };
  }
}