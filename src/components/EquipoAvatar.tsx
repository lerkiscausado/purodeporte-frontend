import { getUploadUrl } from "@/lib/uploads";
import { cn } from "@/lib/utils";

export interface EquipoAvatarProps {
  nombre?: string | null;
  foto?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "h-5 w-5 text-[8px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-xs",
  xl: "h-12 w-12 text-sm",
};

const getInitials = (name: string) => {
  if (!name) return "EQ";
  const trimmed = name.trim();
  if (!trimmed) return "EQ";
  return trimmed.substring(0, 2).toUpperCase();
};

const getGradientBg = (name: string) => {
  const hash = (name || "EQ").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    "from-rose-500 to-orange-500",
    "from-violet-600 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-blue-600 to-cyan-500",
    "from-amber-500 to-yellow-500",
    "from-fuchsia-600 to-pink-600",
  ];
  return colors[hash % colors.length];
};

export function EquipoAvatar({
  nombre,
  foto,
  size = "md",
  className,
}: EquipoAvatarProps) {
  const initials = getInitials(nombre || "");
  const gradient = getGradientBg(nombre || "");
  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (foto) {
    const src = getUploadUrl("equipos", foto);
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden border border-border/60 shrink-0 bg-muted flex items-center justify-center",
          currentSizeClass,
          className
        )}
      >
        <img
          src={src}
          alt={nombre || "Equipo"}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center font-black text-white bg-gradient-to-br shadow-sm uppercase select-none",
        gradient,
        currentSizeClass,
        className
      )}
    >
      {initials}
    </div>
  );
}
