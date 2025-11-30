import { useState, useEffect } from "react";
import { X, Bell, Clock, Smartphone, Pill, TestTube, MessageCircle, Vibrate } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { MobileNotificationService, MobileMedicineData } from "@/services/mobileNotificationService";

const Notifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const [mobileSupport, setMobileSupport] = useState<any>(null);

  useEffect(() => {
    checkMobileSupport();
    setupMessageListener();
  }, []);

  const checkMobileSupport = () => {
    const support = MobileNotificationService.checkMobileSupport();
    setMobileSupport(support);
    console.log('Mobile support check:', support);
  };

  const setupMessageListener = () => {
    // Listen untuk messages dari Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from Service Worker:', event.data);
        
        if (event.data.type === 'MEDICINE_TAKEN_MOBILE') {
          setTestResult(`✅ ${event.data.medicineName} ditandai sudah diminum`);
        } else if (event.data.type === 'MEDICINE_SNOOZED_MOBILE') {
          setTestResult(`⏰ ${event.data.medicineName} ditunda 10 menit`);
        }
      });
    }
  };

  const testSingleMobilePopup = async () => {
    setIsLoading(true);
    setTestResult("");
    
    try {
      const medicineData: MobileMedicineData = {
        id: 'mobile-test-' + Date.now(),
        name: 'Panadol',
        dose: '1 tablet 500mg',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        priority: 'medium'
      };

      const success = await MobileNotificationService.triggerMobilePopup(medicineData);
      
      if (success) {
        setTestResult("✅ Popup mobile berhasil dikirim! Cek notifikasi di atas.");
      } else {
        setTestResult("❌ Gagal mengirim popup mobile.");
      }
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testMultipleMobilePopups = async () => {
    setIsLoading(true);
    setTestResult("");
    
    try {
      const results = await MobileNotificationService.testMobileNotifications();
      const successCount = results.filter(r => r.success).length;
      
      setTestResult(
        `✅ ${successCount}/${results.length} popup mobile berhasil!\n` +
        results.map(r => `• ${r.medicine} (${r.type}): ${r.success ? '✅' : '❌'}`).join('\n')
      );
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testScheduledMobilePopup = async () => {
    setIsLoading(true);
    setTestResult("");
    
    try {
      const medicineData: MobileMedicineData = {
        id: 'mobile-scheduled-' + Date.now(),
        name: 'Vitamin C',
        dose: '1 kapsul 1000mg',
        time: 'Test Terjadwal',
        priority: 'low'
      };

      const success = await MobileNotificationService.scheduleMobileNotification(medicineData, 15);
      
      if (success) {
        setTestResult("✅ Popup mobile dijadwalkan 15 detik lagi! (Bisa tutup app)");
      } else {
        setTestResult("❌ Gagal menjadwalkan popup mobile.");
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
          <h1 className="text-xl font-bold">Notifikasi Mobile</h1>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Mobile Support Info */}
          {mobileSupport && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Status Notifikasi Mobile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Device:</span>
                  <span className={mobileSupport.isMobile ? "text-success" : "text-warning"}>
                    {mobileSupport.isMobile ? "📱 Mobile" : "💻 Desktop"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Worker:</span>
                  <span className={mobileSupport.serviceWorker ? "text-success" : "text-destructive"}>
                    {mobileSupport.serviceWorker ? "✅" : "❌"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Vibration:</span>
                  <span className={mobileSupport.vibration ? "text-success" : "text-warning"}>
                    {mobileSupport.vibration ? "✅" : "⚠️"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Permission:</span>
                  <span className={
                    mobileSupport.permission === 'granted' ? "text-success" :
                    mobileSupport.permission === 'denied' ? "text-destructive" : "text-warning"
                  }>
                    {mobileSupport.permission}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mobile Testing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Test Notifikasi Mobile
              </CardTitle>
              <CardDescription>
                Notifikasi akan muncul dari atas seperti WhatsApp di mobile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={testSingleMobilePopup}
                disabled={isLoading}
                className="w-full gap-2"
              >
                <Bell className="h-4 w-4" />
                Test Single Popup Mobile
              </Button>
              
              <Button 
                onClick={testMultipleMobilePopups}
                disabled={isLoading}
                variant="outline"
                className="w-full gap-2"
              >
                <Vibrate className="h-4 w-4" />
                Test Multiple Popups (Priority)
              </Button>

              <Button 
                onClick={testScheduledMobilePopup}
                disabled={isLoading}
                variant="outline"
                className="w-full gap-2"
              >
                <Clock className="h-4 w-4" />
                Test Scheduled Popup (15 detik)
              </Button>

              {testResult && (
                <div className={`p-3 rounded-lg text-sm whitespace-pre-line ${
                  testResult.includes('✅') 
                    ? 'bg-success/10 text-success border border-success/20' 
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                  {testResult}
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• <strong>Single Popup:</strong> Satu notifikasi seperti WA</p>
                <p>• <strong>Multiple Popups:</strong> Test dengan priority berbeda</p>
                <p>• <strong>Scheduled Popup:</strong> Akan muncul meski app ditutup</p>
                <p>• Pastikan mengizinkan notifikasi di browser mobile</p>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview Mobile Notification</CardTitle>
              <CardDescription>
                Seperti inilah notifikasi di mobile device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-b from-blue-500 to-blue-600 rounded-2xl p-4 shadow-2xl border-2 border-blue-300">
                <div className="bg-white rounded-xl p-3 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Pill className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-gray-900">Pengingat Obat</h3>
                        <span className="text-xs text-gray-500">baru saja</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Waktunya minum Panadol 500mg
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button className="flex-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                          ✅ Sudah Minum
                        </button>
                        <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                          ⏰ Tunda 10m
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white mt-2 text-center">
                  ↑ Akan muncul dari atas layar seperti WhatsApp ↑
                </p>
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