import { Home, Plus, Bell, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-md mx-auto flex items-center justify-around h-20 px-4">
        <NavLink
          to="/"
          end
          className="flex flex-col items-center gap-1 text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Home className="h-6 w-6" />
          <span className="text-xs font-medium">Beranda</span>
        </NavLink>

        <NavLink
          to="/tambah-obat"
          className="flex flex-col items-center gap-1 text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Plus className="h-6 w-6" />
          <span className="text-xs font-medium">Tambah Obat</span>
        </NavLink>

        <NavLink
          to="/notifikasi"
          className="flex flex-col items-center gap-1 text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Bell className="h-6 w-6" />
          <span className="text-xs font-medium">Notifikasi</span>
        </NavLink>

        <NavLink
          to="/pengaturan"
          className="flex flex-col items-center gap-1 text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <Settings className="h-6 w-6" />
          <span className="text-xs font-medium">Pengaturan</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
