// Footer: rich site footer with complete navigation and high-contrast typography.
import { Link } from "@tanstack/react-router";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t-2 border-border bg-card text-foreground shadow-lg">
      <div className="page-wrap py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12">
          {/* Brand & Value Proposition Column */}
          <div className="flex flex-col gap-4 md:col-span-6">
            <Link to="/" className="flex items-center w-fit no-underline">
              <img
                src="/assets/horizontal_logo_dark.svg"
                alt="Verselab"
                className="h-9 w-auto dark:hidden"
              />
              <img
                src="/assets/horizontal_logo_light.svg"
                alt="Verselab"
                className="hidden h-9 w-auto dark:block"
              />
            </Link>

            <p className="text-sm sm:text-base font-semibold leading-relaxed text-foreground/75 max-w-sm">
              Platform belajar interaktif berbasis visual dan micro-learning. Kuasai berbagai materi
              esensial lewat latihan interaktif dan simulasi langsung di browser.
            </p>
          </div>

          {/* Materi Belajar Column */}
          <div className="flex flex-col gap-3 md:col-span-3">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground uppercase">
              Materi
            </h3>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              <li>
                <Link
                  to="/units/$unitSlug"
                  params={{ unitSlug: "keuangan" }}
                  className="text-sm sm:text-base font-semibold text-foreground/75 transition-colors hover:text-primary hover:underline underline-offset-4"
                >
                  Keuangan
                </Link>
              </li>
              <li>
                <Link
                  to="/units/$unitSlug"
                  params={{ unitSlug: "akuntansi" }}
                  className="text-sm sm:text-base font-semibold text-foreground/75 transition-colors hover:text-primary hover:underline underline-offset-4"
                >
                  Akuntansi
                </Link>
              </li>
              <li>
                <Link
                  to="/units/$unitSlug"
                  params={{ unitSlug: "manajemen-produk" }}
                  className="text-sm sm:text-base font-semibold text-foreground/75 transition-colors hover:text-primary hover:underline underline-offset-4"
                >
                  Manajemen Produk
                </Link>
              </li>
              <li>
                <Link
                  to="/units/$unitSlug"
                  params={{ unitSlug: "kewirausahaan" }}
                  className="text-sm sm:text-base font-semibold text-foreground/75 transition-colors hover:text-primary hover:underline underline-offset-4"
                >
                  Kewirausahaan
                </Link>
              </li>
            </ul>
          </div>

          {/* Eksplorasi & Navigasi Column */}
          <div className="flex flex-col gap-3 md:col-span-3">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground uppercase">
              Navigasi
            </h3>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              <li>
                <Link
                  to="/home"
                  className="text-sm sm:text-base font-semibold text-foreground/75 transition-colors hover:text-primary hover:underline underline-offset-4"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  to="/material"
                  className="text-sm sm:text-base font-semibold text-foreground/75 transition-colors hover:text-primary hover:underline underline-offset-4"
                >
                  Peta Kurikulum
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-sm sm:text-base font-semibold text-foreground/75 transition-colors hover:text-primary hover:underline underline-offset-4"
                >
                  Profil & Statistik
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-sm sm:text-base font-semibold text-foreground/75 transition-colors hover:text-primary hover:underline underline-offset-4"
                >
                  Mode Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Medium/Dark Grey Text */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t-2 border-border pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-xs sm:text-base font-semibold text-foreground/70">
            &copy; {year} Verselab. Belajar interaktif tanpa batas.
          </p>
          <p className="text-xs sm:text-base font-semibold text-muted-foreground flex items-center gap-2">
            <span>Dibuat untuk pembelajaran yang menyenangkan</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
