import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaWhatsapp } from "react-icons/fa";

const socialLinks = [
  { href: "https://facebook.com", icon: FaFacebook, label: "Facebook" },
  { href: "https://instagram.com", icon: FaInstagram, label: "Instagram" },
  { href: "https://youtube.com", icon: FaYoutube, label: "YouTube" },
  { href: "https://tiktok.com", icon: FaTiktok, label: "TikTok" },
  { href: "https://wa.me/", icon: FaWhatsapp, label: "WhatsApp" },
];

const navLinks = [
  { href: "/torneos", label: "Torneos" },
  { href: "/resultados", label: "Resultados" },
  { href: "/programacion", label: "Programación" },
];

export function Footer() {
  return (
    <footer className="bg-[hsl(218_50%_14%)] border-t-4 border-primary/50 text-white/70">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

          {/* Logo + Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Image
              src="/purodeporte.png"
              alt="Puro Deporte"
              width={140}
              height={35}
              className="brightness-0 invert opacity-80"
            />
            <p className="text-xs text-white/40 mt-1">Tu Barrio, Tu Pasión</p>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold text-white/50 hover:text-primary transition-colors uppercase tracking-wider"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Redes Sociales */}
          <div className="flex items-center gap-2.5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex items-center justify-center w-8 h-8 rounded-sm text-white/40 hover:text-primary border border-white/10 hover:border-primary/40 transition-all duration-150"
              >
                <social.icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-white/8 text-center">
          <p className="text-[11px] text-white/30">
            © {new Date().getFullYear()} Puro Deporte. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
