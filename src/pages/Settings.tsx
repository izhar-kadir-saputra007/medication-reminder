import { User, Bell, Smartphone, Moon, UserCircle, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-4 py-6 border-b border-border bg-card">
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola preferensi pengingat obat Anda
          </p>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Profile Card */}
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg">John Doe</h2>
                <p className="text-muted-foreground text-sm">john.doe@email.com</p>
                <p className="text-success text-sm mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Semua pengingat aktif
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">
                Edit
              </Button>
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 px-1">
              Notifikasi
            </h3>
            <div className="bg-card rounded-2xl shadow-sm border border-border/50 divide-y divide-border">
              <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors rounded-t-2xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold">Pengaturan Pengingat</h4>
                  <p className="text-sm text-muted-foreground">Kelola waktu notifikasi</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors rounded-b-2xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold">Suara & Getar</h4>
                  <p className="text-sm text-muted-foreground">Sesuaikan suara pengingat</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Appearance Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 px-1">
              Tampilan
            </h3>
            <div className="bg-card rounded-2xl shadow-sm border border-border/50">
              <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Moon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold">Mode Gelap</h4>
                  <p className="text-sm text-muted-foreground">Beralih ke tema gelap</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 px-1">
              Akun
            </h3>
            <div className="bg-card rounded-2xl shadow-sm border border-border/50 divide-y divide-border">
              <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors rounded-t-2xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold">Profil</h4>
                  <p className="text-sm text-muted-foreground">Informasi pribadi</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors rounded-b-2xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold">Privasi</h4>
                  <p className="text-sm text-muted-foreground">Pengaturan keamanan</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
