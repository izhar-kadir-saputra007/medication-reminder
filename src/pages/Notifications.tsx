import { useState, useEffect } from "react";
import { X, Bell, Clock, Smartphone, Pill, TestTube, MessageCircle, Vibrate, Badge, Lock, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import BottomNav from "@/components/BottomNav";
import { MobileNotificationService, MobileMedicineData } from "@/services/mobileNotificationService";

const Notifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const [mobileFeatures, setMobileFeatures] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    checkMobileFeatures();
    setupMessageListener();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTesting && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsTesting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTesting, countdown]);

  const checkMobileFeatures = () => {
    const features = MobileNotificationService.checkMobileFeatures();
    setMobileFeatures(features);
    console.log('Mobile features check:', features);
  };

  const setupMessageListener = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from Service Worker:', event.data);
        
        if (event.data.type === 'MEDICINE_TAKEN') {
          setTestResult(`✅ ${event.data.medicineName} ditandai sudah diminum`);
        } else if (event.data.type === 'MEDICINE_SNOOZED') {
          setTestResult(`⏰ ${event.data.medicineName} ditunda 10 menit`);
        }
      });
    }
  };

  const testBackgroundNotification = async () => {
    setIsLoading(true);
    setIsTesting(true);
    setCountdown(15);
    setTestResult("");
    
    try {
      const success = await MobileNotificationService.testBackgroundNotification();
      
      if (success) {
        setTestResult(
          "✅ Background notification dijadwalkan!\n\n" +
          "📱 **Anda bisa menutup app sekarang**\n" +
          "⏰ Notifikasi akan muncul dalam 15 detik\n" +
          "🎯 Akan muncul meski app ditutup\n" +
          "🔔 Dengan semua fitur mobile (badge, vibrate, dll)"
        );
      } else {
        setTestResult("❌ Gagal menjadwalkan background notification");
        setIsTesting(false);
      }
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
      setIsTesting(false);
    } finally {
      setIsLoading(false);
    }
  };

  const testInstantNotification = async () => {
    setIsLoading(true);
    setTestResult("");
    
    try {
      const medicineData: MobileMedicineData = {
        id: 'instant-test-' + Date.now(),
        name: 'Vitamin C',
        dose: '1 kapsul 1000mg',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        priority: 'medium'
      };

      const success = await MobileNotificationService.triggerMobilePopup(medicineData);
      
      if (success) {
        setTestResult("✅ Instant notification berhasil! Cek notifikasi di atas.");
      } else {
        setTestResult("❌ Gagal mengirim instant notification.");
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
          {/* Mobile Features Info */}
          {mobileFeatures && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Fitur Notifikasi Mobile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Bell className="h-3 w-3" />
                    Notifications
                  </span>
                  <span className={mobileFeatures.notifications ? "text-success" : "text-destructive"}>
                    {mobileFeatures.notifications ? "✅" : "❌"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-3 w-3" />
                    Background Sync
                  </span>
                  <span className={mobileFeatures.backgroundSync ? "text-success" : "text-warning"}>
                    {mobileFeatures.backgroundSync ? "✅" : "⚠️"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Badge className="h-3 w-3" />
                    App Badge
                  </span>
                  <span className={mobileFeatures.appBadge ? "text-success" : "text-warning"}>
                    {mobileFeatures.appBadge ? "✅" : "⚠️"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Vibrate className="h-3 w-3" />
                    Vibration
                  </span>
                  <span className={mobileFeatures.vibration ? "text-success" : "text-warning"}>
                    {mobileFeatures.vibration ? "✅" : "⚠️"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Permission:</span>
                  <span className={
                    mobileFeatures.permission === 'granted' ? "text-success" :
                    mobileFeatures.permission === 'denied' ? "text-destructive" : "text-warning"
                  }>
                    {mobileFeatures.permission}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Countdown Progress */}
          {isTesting && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="flex justify-center items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                    <span className="font-semibold text-blue-700">Testing Background Notification</span>
                  </div>
                  
                  <Progress value={((15 - countdown) / 15) * 100} className="h-2" />
                  
                  <div className="text-2xl font-bold text-blue-600">
                    {countdown}s
                  </div>
                  
                  <p className="text-sm text-blue-600">
                    Notifikasi akan muncul dalam {countdown} detik...
                    <br />
                    <span className="font-semibold">Anda bisa menutup app sekarang!</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Testing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-primary" />
                Test Notifikasi Background
              </CardTitle>
              <CardDescription>
                Test notifikasi yang bekerja di background meski app ditutup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testBackgroundNotification}
                disabled={isLoading || isTesting}
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
              >
                <Clock className="h-4 w-4" />
                Test Background Notification (15 detik)
              </Button>
              
              <Button 
                onClick={testInstantNotification}
                disabled={isLoading || isTesting}
                variant="outline"
                className="w-full gap-2"
              >
                <Bell className="h-4 w-4" />
                Test Instant Notification
              </Button>

              {testResult && (
                <div className={`p-4 rounded-lg text-sm whitespace-pre-line ${
                  testResult.includes('✅') 
                    ? 'bg-success/10 text-success border border-success/20' 
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                  {testResult}
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  <span><strong>Background Test:</strong> Akan muncul meski app ditutup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="h-3 w-3" />
                  <span><strong>Fitur Lengkap:</strong> Laci notifikasi, badge, status bar, lock screen</span>
                </div>
                <div className="flex items-center gap-2">
                  <Vibrate className="h-3 w-3" />
                  <span><strong>Vibration & Sound:</strong> Getar dan suara notifikasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-3 w-3" />
                  <span><strong>Instant Test:</strong> Langsung muncul untuk testing cepat</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview Notifikasi Mobile</CardTitle>
              <CardDescription>
                Notifikasi akan muncul dengan semua fitur mobile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-b from-green-500 to-green-600 rounded-2xl p-4 shadow-2xl border-2 border-green-300">
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Pill className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-gray-900">💊 Pengingat Obat</h3>
                        <span className="text-xs text-gray-500">baru saja</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Waktunya minum Panadol 500mg
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
                          ✅ Sudah Minum
                        </button>
                        <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                          ⏰ Tunda 10m
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-center">
                <div className="bg-blue-100 text-blue-700 p-2 rounded">
                  📱 <strong>Laci Notifikasi</strong>
                </div>
                <div className="bg-purple-100 text-purple-700 p-2 rounded">
                  🔔 <strong>Status Bar</strong>
                </div>
                <div className="bg-orange-100 text-orange-700 p-2 rounded">
                  📍 <strong>App Badge</strong>
                </div>
                <div className="bg-red-100 text-red-700 p-2 rounded">
                  🔒 <strong>Lock Screen</strong>
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