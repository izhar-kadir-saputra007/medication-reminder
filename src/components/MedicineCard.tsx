import { Pill, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicineCardProps {
  name: string;
  dose: string;
  time: string;
  taken: boolean;
  onToggle: () => void;
}

const MedicineCard = ({ name, dose, time, taken, onToggle }: MedicineCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 flex items-center gap-4 transition-all hover:shadow-md">
      <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
        <Pill className="h-7 w-7 text-primary" />
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-foreground text-lg">{name}</h3>
        <p className="text-muted-foreground text-sm">{dose}</p>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
          <Clock className="h-4 w-4" />
          <span>{time}</span>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
          taken
            ? "bg-success border-success text-success-foreground"
            : "border-muted-foreground/30 hover:border-primary"
        )}
      >
        {taken && <Check className="h-6 w-6" strokeWidth={3} />}
      </button>
    </div>
  );
};

export default MedicineCard;
