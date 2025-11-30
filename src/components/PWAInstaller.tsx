import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Cek jika app sudah diinstall
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    // Deteksi device type
    const userAgent = navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    
    setIsIOS(isIos);
    setIsMobile(isMobileDevice);

    // Handle beforeinstallprompt event (Chrome/Edge desktop & mobile)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Untuk desktop, tunggu beberapa detik sebelum show prompt
      // Untuk mobile, show immediately
      if (isMobileDevice) {
        setShowInstall(true);
      } else {
        // Desktop: tunggu 5 detik agar tidak mengganggu
        setTimeout(() => {
          setShowInstall(true);
        }, 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Untuk iOS dan browser tanpa install prompt, tampilkan setelah delay
    if ((isIos || !isMobileDevice) && !deferredPrompt) {
      const timer = setTimeout(() => {
        // Cek lagi sebelum show (mungkin user sudah install)
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShowInstall(true);
        }
      }, 8000); // Delay lebih lama untuk desktop
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [deferredPrompt]);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setDeferredPrompt(null);
        setShowInstall(false);
      }
    }
    
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowInstall(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toDateString());
  };

  // Jangan tampilkan jika app sudah diinstall atau user baru saja dismiss
  if (isStandalone) return null;
  
  const today = new Date().toDateString();
  if (localStorage.getItem('pwa-install-dismissed') === today) {
    return null;
  }

  const getInstallInstructions = () => {
    if (isIOS) {
      return {
        icon: <Smartphone className="h-5 w-5" />,
        title: "Install di iOS",
        description: "Tap share icon lalu pilih 'Add to Home Screen'",
        steps: [
          "Tap icon share (kotak dengan panah ke atas)",
          "Scroll down, pilih 'Add to Home Screen'",
          "Tap 'Add' di pojok kanan atas"
        ]
      };
    } else if (isMobile) {
      return {
        icon: <Smartphone className="h-5 w-5" />,
        title: "Install di Android",
        description: "Install aplikasi untuk pengalaman mobile yang lebih baik",
        steps: [
          "Notifikasi install akan muncul otomatis",
          "Tap 'Install' untuk melanjutkan",
          "Aplikasi akan tersedia di home screen Anda"
        ]
      };
    } else {
      return {
        icon: <Monitor className="h-5 w-5" />,
        title: "Install di Desktop",
        description: "Install aplikasi untuk akses cepat dan pengalaman native",
        steps: [
          "Browser akan menampilkan prompt install",
          "Klik 'Install' untuk melanjutkan",
          "Aplikasi akan tersedia di desktop/dock Anda"
        ]
      };
    }
  };

  const instructions = getInstallInstructions();

  return (
    <Dialog open={showInstall} onOpenChange={setShowInstall}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {instructions.icon}
            <DialogTitle>{instructions.title}</DialogTitle>
          </div>
          <DialogDescription>
            {instructions.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Steps */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Cara Install:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Keuntungan Install */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Keuntungan:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                Notifikasi yang lebih handal
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                Bekerja secara offline
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                {isMobile ? "Akses cepat dari home screen" : "Akses cepat dari desktop/dock"}
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                Pengalaman seperti aplikasi native
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-col gap-2">
          {/* Tombol Install untuk Chrome/Edge desktop & mobile */}
          {!isIOS && deferredPrompt && (
            <Button onClick={installApp} className="w-full gap-2">
              <Download className="h-4 w-4" />
              Install Aplikasi
            </Button>
          )}
          
          {/* Untuk iOS, Firefox, Safari yang tidak support install prompt */}
          {(isIOS || !deferredPrompt) && (
            <Button 
              onClick={() => setShowInstall(false)}
              className="w-full gap-2"
              variant="outline"
            >
              Mengerti, akan install manual
            </Button>
          )}

          <Button 
            onClick={handleClose}
            variant="outline" 
            className="w-full gap-2"
          >
            <X className="h-4 w-4" />
            Nanti Saja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}