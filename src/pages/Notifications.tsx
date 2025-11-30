import { useState, useEffect } from "react";
import { X, Bell, Clock, Smartphone, Pill, TestTube, MessageCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { NotificationService, MedicineData } from "@/services/notificationService";

const Notifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const [supportInfo, setSupportInfo] = useState<any>(null);

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    const info = await NotificationService.checkPopupSupport();
    setSupportInfo(info);
  };

  const testSinglePopup = async () => {
    setIsLoading(true);
    setTestResult("");
    
    try {
      const medicineData: MedicineData = {
        id: 'test-' + Date.now(),
        name: 'Panadol',
        dose: '1 tablet 500mg',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      const success = await NotificationService.triggerPopupNotification(medicineData);
      
      if (success) {
        setTestResult("✅ Popup notifikasi berhasil dikirim! Cek pojok kanan atas.");
      } else {
        setTestResult("❌ Gagal mengirim popup notifikasi.");
      }
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testMultiplePopups = async () => {
    setIsLoading(true);
    setTestResult("");
    
    try {
      const results = await NotificationService.testPopupNotifications();
      const successCount = results.filter(r => r.success).length;
      
      setTestResult(`✅ ${successCount}/${results.length} popup notifikasi berhasil dikirim!`);
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testScheduledPopup = async () => {
    setIsLoading(true);
    setTestResult("");
    
    try {
      const medicineData: MedicineData = {
        id: 'scheduled-test-' + Date.now(),
        name: 'Vitamin C',
        dose: '1 kapsul 1000mg',
        time: 'Test'
      };

      // Schedule 15 detik dari sekarang
      const triggerTime = new Date(Date.now() + 15000);
      
      const success = await NotificationService.schedulePopupNotification(medicineData, triggerTime);
      
      if (success) {
        setTestResult("✅ Popup notifikasi dijadwalkan untuk 15 detik lagi!");
      } else {
        setTestResult("❌ Gagal menjadwalkan popup notifikasi.");
      }
    } catch (error: any) {
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
          <h1 className="text-xl font-bold">Notifikasi Popup</h1>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Support Info */}
          {supportInfo && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Status Notifikasi Popup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service Worker:</span>
                  <span className={supportInfo.serviceWorker ? "text-success" : "text-destructive"}>
                    {supportInfo.serviceWorker ? "✅" : "❌"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Permission:</span>
                  <span className={
                    supportInfo.permission === 'granted' ? "text-success" :
                    supportInfo.permission === 'denied' ? "text-destructive" : "text-warning"
                  }>
                    {supportInfo.permission}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Push API:</span>
                  <span className={supportInfo.pushManager ? "text-success" : "text-warning"}>
                    {supportInfo.pushManager ? "✅" : "⚠️"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Testing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-primary" />
                Test Notifikasi Popup
              </CardTitle>
              <CardDescription>
                Test notifikasi yang muncul dari atas seperti WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={testSinglePopup}
                disabled={isLoading}
                className="w-full gap-2"
              >
                <Bell className="h-4 w-4" />
                Test Single Popup
              </Button>
              
              <Button 
                onClick={testMultiplePopups}
                disabled={isLoading}
                variant="outline"
                className="w-full gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Test Multiple Popups
              </Button>

              <Button 
                onClick={testScheduledPopup}
                disabled={isLoading}
                variant="outline"
                className="w-full gap-2"
              >
                <Clock className="h-4 w-4" />
                Test Scheduled Popup (15 detik)
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
                <p>• <strong>Single Popup:</strong> Satu notifikasi seperti WA</p>
                <p>• <strong>Multiple Popups:</strong> Beberapa notifikasi berturut-turut</p>
                <p>• <strong>Scheduled Popup:</strong> Notifikasi terjadwal 15 detik</p>
                <p>• Pastikan mengizinkan notifikasi di browser</p>
              </div>
            </CardContent>
          </Card>

          {/* Phone Mockup - Show how it should look */}
          <Card>
            <CardHeader>
              <CardTitle>Preview Popup Notification</CardTitle>
              <CardDescription>
                Seperti inilah notifikasi akan muncul di device Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2rem] p-4 shadow-2xl">
                <div className="bg-black rounded-[1.5rem] p-3 relative">
                  <div className="bg-slate-950 rounded-[1rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-slate-950 px-4 py-2 flex items-center justify-between text-white text-xs">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-3 h-1.5 bg-white rounded-sm"></div>
                        <div className="w-4 h-1.5 bg-white rounded-sm"></div>
                        <div className="w-4 h-1.5 bg-white rounded-sm"></div>
                      </div>
                    </div>

                    {/* Notification Preview */}
                    <div className="p-4">
                      <div className="bg-white rounded-xl p-3 shadow-lg border">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Pill className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-slate-900 text-sm">Pengingat Obat</h3>
                              <span className="text-xs text-slate-500">baru saja</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Waktunya minum Panadol 500mg
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 text-center">
                        ↑ Akan muncul dari atas seperti ini ↑
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;