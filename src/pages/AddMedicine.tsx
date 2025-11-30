import { useState } from "react";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

const AddMedicine = () => {
  const navigate = useNavigate();
  const [medicineName, setMedicineName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("");
  const [repeat, setRepeat] = useState("daily");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName || !dose || !time) {
      toast.error("Mohon lengkapi semua data");
      return;
    }
    toast.success("Obat berhasil ditambahkan!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-border bg-card">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Tambah Obat</h1>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 space-y-5">
            <div>
              <Label htmlFor="medicine-name" className="text-base font-semibold">
                Nama Obat
              </Label>
              <Input
                id="medicine-name"
                placeholder="contoh: Panadol, Vitamin D"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                className="mt-2 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="dose" className="text-base font-semibold">
                Dosis
              </Label>
              <Input
                id="dose"
                placeholder="contoh: 500mg, 2 tablet"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="mt-2 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="time" className="text-base font-semibold">
                Waktu Pengingat
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-2 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="repeat" className="text-base font-semibold">
                Ulangi
              </Label>
              <Select value={repeat} onValueChange={setRepeat}>
                <SelectTrigger className="mt-2 h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl">
              Tambah Obat
            </Button>
          </form>

          {/* Tips Card */}
          <div className="bg-success/10 border border-success/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-success mb-2">Tips untuk pengingat yang lebih baik</h3>
                <ul className="space-y-2 text-sm text-success/90">
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">•</span>
                    <span>Atur pengingat di sekitar waktu makan untuk kepatuhan yang lebih baik</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">•</span>
                    <span>Gunakan dosis spesifik (contoh: "500mg" bukan "1 pil")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">•</span>
                    <span>Pertimbangkan untuk mengatur beberapa pengingat untuk obat penting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AddMedicine;
