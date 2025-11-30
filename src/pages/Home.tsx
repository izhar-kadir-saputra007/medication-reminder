import { useState } from "react";
import { Calendar, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import MedicineCard from "@/components/MedicineCard";
import BottomNav from "@/components/BottomNav";

interface Medicine {
  id: number;
  name: string;
  dose: string;
  time: string;
  taken: boolean;
}

const Home = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: 1, name: "Panadol", dose: "500mg", time: "08:00", taken: false },
    { id: 2, name: "Vitamin D", dose: "1000 IU", time: "09:00", taken: true },
    { id: 3, name: "Aspirin", dose: "100mg", time: "19:00", taken: false },
  ]);

  const toggleMedicine = (id: number) => {
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  const takenCount = medicines.filter((m) => m.taken).length;
  const totalCount = medicines.length;
  const progress = (takenCount / totalCount) * 100;

  const today = new Date();
  const dateString = today.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Selamat pagi!";
    if (hour < 18) return "Selamat siang!";
    return "Selamat malam!";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{greeting()}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{dateString}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Progres Hari Ini</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Obat yang diminum</span>
              <span className="text-lg font-semibold text-primary">
                {takenCount}/{totalCount}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>

        {/* Medicines List */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Obat Hari Ini</h2>
          <div className="space-y-3">
            {medicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                name={medicine.name}
                dose={medicine.dose}
                time={medicine.time}
                taken={medicine.taken}
                onToggle={() => toggleMedicine(medicine.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
