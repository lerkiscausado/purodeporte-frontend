import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { FaFutbol, FaChartLine, FaCalendarAlt, FaTrophy, FaNewspaper } from "react-icons/fa";
import { cookies } from "next/headers";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";

export async function Navbar() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");
  const isAuthenticated = !!sessionToken;

  // Leer datos del usuario desde la cookie
  let user = { name: "Usuario", email: "", role: "user", foto: "" };
  if (isAuthenticated) {
    const userDataCookie = cookieStore.get("user_data");
    if (userDataCookie?.value) {
      try {
        user = JSON.parse(userDataCookie.value);
      } catch { }
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[oklch(0.20_0.06_255)] shadow-lg shadow-black/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/purodeporte.png"
            alt="Puro Deporte"
            width={180}
            height={45}
            className="h-9 w-auto object-contain brightness-0 invert"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide">
          <Link href="/" className="flex items-center gap-2 hover:text-primary transition-colors text-white/70 hover:scale-105 transform duration-200">
            <FaFutbol className="h-4 w-4" /> Inicio
          </Link>
          <Link href="/torneos" className="flex items-center gap-2 hover:text-primary transition-colors text-white/70 hover:scale-105 transform duration-200">
            <FaTrophy className="h-4 w-4" /> Torneos
          </Link>
          <Link href="/resultados" className="flex items-center gap-2 hover:text-primary transition-colors text-white/70 hover:scale-105 transform duration-200">
            <FaChartLine className="h-4 w-4" /> Resultados
          </Link>
          <Link href="/programacion" className="flex items-center gap-2 hover:text-primary transition-colors text-white/70 hover:scale-105 transform duration-200">
            <FaCalendarAlt className="h-4 w-4" /> Programación
          </Link>
          <Link href="/noticias" className="flex items-center gap-2 hover:text-primary transition-colors text-white/70 hover:scale-105 transform duration-200">
            <FaNewspaper className="h-4 w-4" /> Noticias
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center">
              <UserMenu
                userName={user.name}
                userEmail={user.email}
                userRole={user.role}
                userFoto={(user as any).foto}
              />
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-bold rounded-full text-white hover:text-primary hover:bg-white/10 px-4 border border-white/30 hover:border-white/60 transition-colors">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" className="font-bold rounded-full px-6 shadow-primary/25 shadow-lg">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}

          <div className="md:hidden">
            <MobileMenu isAuthenticated={isAuthenticated} user={user} />
          </div>
        </div>
      </div>
    </nav>
  );
}
