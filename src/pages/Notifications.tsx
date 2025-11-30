import { useState } from "react";
import { X, Bell, Clock, Smartphone, Pill, TestTube } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { NotificationService } from "@/services/notificationService";

const Notifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>("");

  const testNotification = async () => {
    setIsLoading(true);
    setTestResult("");
    
    try {
      const success = await NotificationService.showMedicineReminder(
        "Panadol",
        "1 tablet 500mg",
        "08:00"
      );
      
      if (success) {
        setTestResult("✅ Notifikasi berhasil dikirim!");
      } else {
        setTestResult("❌ Gagal mengirim notifikasi. Cek permission browser.");
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testScheduledNotification = async () => {
    setIsLoading(true);
    setTestResult("");
    
    try {
      // Schedule 10 detik dari sekarang
      const triggerTime = new Date(Date.now() + 10000);
      const success = await NotificationService.scheduleNotification(
        "Vitamin C",
        "1 kapsul 1000mg",
        triggerTime
      );
      
      if (success) {
        setTestResult("✅ Notifikasi dijadwalkan untuk 10 detik lagi!");
      } else {
        setTestResult("❌ Gagal menjadwalkan notifikasi.");
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-border bg-card">
          <h1 className="text-xl font-bold">Preview Notifikasi</h1>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Testing Section */}
          <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              Testing Notifikasi
            </h2>
            
            <div className="space-y-3">
              <Button 
                onClick={testNotification}
                disabled={isLoading}
                className="w-full gap-2"
              >
                <Bell className="h-4 w-4" />
                Test Notifikasi Sekarang
              </Button>
              
              <Button 
                onClick={testScheduledNotification}
                disabled={isLoading}
                variant="outline"
                className="w-full gap-2"
              >
                <Clock className="h-4 w-4" />
                Test Notifikasi Terjadwal (10 detik)
              </Button>

              {testResult && (
                <div className={`p-3 rounded-lg text-sm ${
                  testResult.includes('✅') 
                    ? 'bg-success/10 text-success border border-success/20' 
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                  {testResult}
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Pastikan browser mengizinkan notifikasi</p>
                <p>• Untuk testing terjadwal, tunggu 10 detik</p>
                <p>• Notifikasi akan muncul meski app ditutup</p>
              </div>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-[3rem] p-4 shadow-2xl">
            <div className="bg-black rounded-[2.5rem] p-3 relative">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-10"></div>
              
              {/* Screen */}
              <div className="bg-slate-950 rounded-[2rem] overflow-hidden">
                {/* Status Bar */}
                <div className="bg-slate-950 px-6 py-3 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                    <div className="w-6 h-2 bg-white rounded-sm"></div>
                    <div className="w-6 h-2 bg-white rounded-sm"></div>
                  </div>
                </div>

                {/* Notification */}
                <div className="bg-slate-900/50 p-3 mx-3 mt-2 mb-20 rounded-2xl backdrop-blur-xl">
                  <div className="bg-white rounded-xl p-4 shadow-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-slate-900">Pengingat Obat</h3>
                          <span className="text-xs text-slate-500">sekarang</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          Waktunya minum Panadol 500mg
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-success text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Tandai Sudah Diminum
                      </button>
                      <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                        Tunda 10m
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-card rounded-2xl shadow-sm border border-border/50">
            <h2 className="text-lg font-bold px-6 py-4 border-b border-border">
              Pengaturan Notifikasi
            </h2>
            
            <div className="divide-y divide-border">
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Notifikasi Push</h3>
                  <p className="text-sm text-muted-foreground">Dapatkan pengingat saat waktunya</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Opsi Tunda</h3>
                  <p className="text-sm text-muted-foreground">5, 10, 15, 30 menit</p>
                </div>
              </div>

              <div className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Suara & Getar</h3>
                  <p className="text-sm text-muted-foreground">Nada pengingat lembut</p>
                </div>
              </div>
            </div>
          </div>

          {/* Example Notifications */}
          <div>
            <h2 className="text-lg font-bold mb-4">Contoh Notifikasi</h2>
            <div className="space-y-3">
              <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Pill className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Waktunya minum Vitamin D 1000 IU</h3>
                  <p className="text-sm text-muted-foreground">Pengingat harian • 8:00 AM</p>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Pill className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Waktunya minum Aspirin 100mg</h3>
                  <p className="text-sm text-muted-foreground">Pengingat harian • 7:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;