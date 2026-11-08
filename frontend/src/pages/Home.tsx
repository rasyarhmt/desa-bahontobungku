import { Link } from "react-router-dom";
import { Bell, BookOpen, ClipboardList, Users } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pengumuman from "@/components/Pengumuman";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Bg from "@/assets/bg-bahontobungku.jpg";

function Home() {
  return (
    <div style={{ fontFamily: "poppins" }}>
      <Navbar />
      <div className="relative">
        <HeroSection />
        <Pengumuman />
      </div>
      <InfoSection />
      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section
      className="py-8 px-4 pt-24 pb-11 md:px-8"
      style={{ fontFamily: "Poppins" }}
    >
      <div
        className="relative mx-auto h-[40rem] w-full max-w-9xl overflow-hidden rounded-3xl bg-cover bg-center shadow-xl md:h-[37rem]"
        style={{ backgroundImage: `url(${Bg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-green-400 to-blue-500 opacity-80" />
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-green-400 opacity-80" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <h2 className="mb-2 text-[2.5rem] font-bold tracking-tight text-shadow-lg md:mb-4 md:text-[5rem]">
            DESA DIGITAL
          </h2>
          <p className="text-[1.5rem] font-bold tracking-wide text-shadow-md md:text-[3.5rem]">
            BAHONTOBUNGKU
          </p>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-200 md:text-lg">
            Menuju desa yang modern, transparan, dan berkelanjutan melalui
            transformasi digital
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full shadow-lg">
              <Link to="/ProfilDesa">Jelajahi</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <Link to="/Pelayanan">Layanan Desa</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface InfoLink {
  to: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  chip: string;
}

const INFO_LINKS: InfoLink[] = [
  {
    to: "/Information",
    title: "Berita",
    description: "Baca berbagai berita terbaru tentang desa bahontobungku",
    icon: BookOpen,
    chip: "bg-primary/10 text-primary",
  },
  {
    to: "/ProfilDesa",
    title: "Aparatur",
    description:
      "Ketahui profil singkat dari para perangkat pemerintahan desa bahontobungku",
    icon: Users,
    chip: "bg-yellow-100 text-yellow-700",
  },
  {
    to: "/Information",
    title: "Pengumuman",
    description:
      "Informasi terkait pengumuman untuk masyarakat desa bahontobungku",
    icon: Bell,
    chip: "bg-pink-100 text-pink-700",
  },
  {
    to: "/Infografis",
    title: "Fasilitas",
    description:
      "Lihat data statistik terkait fasilitas yang ada di desa bahontobungku",
    icon: ClipboardList,
    chip: "bg-green-100 text-green-700",
  },
];

function InfoSection() {
  return (
    <div className="relative bg-white px-5 pt-10 md:pt-28">
      <div className="relative mx-auto flex h-full w-full flex-col text-center md:block md:h-[50rem]">
        <svg
          width="1100"
          height="600"
          viewBox="0 0 200 150"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-y-0 top-28 right-0 z-10 hidden md:flex"
        >
          <path
            d="M0,40 A40,40 0 0,1 40,0 H200 V110 A40,40 0 0,1 160,150 H0 Z"
            fill="#F4F9FF"
          />
        </svg>

        <div className="relative z-10 flex w-full flex-col justify-center px-6 md:flex md:w-2/5 md:pl-20">
          <h2 className="w-full text-left text-3xl font-bold leading-12 text-gray-800 md:w-3/4 md:text-4xl">
            Dapatkan Informasi Terbaru terkait desa
          </h2>
          <p className="mt-3 text-justify text-gray-500 md:text-left">
            Desa digital sebagai sarana penunjang kebutuhan informasi dan
            pelayanan masyarakat.
          </p>
        </div>

        <div className="relative z-10 mt-8 flex w-full flex-col items-center justify-center gap-6 md:w-3/5 md:flex-row md:gap-0">
          <div className="flex w-full flex-col items-center gap-6 md:w-1/2 md:pt-20">
            <InfoCard link={INFO_LINKS[0]} />
            <InfoCard link={INFO_LINKS[1]} />
          </div>
          <div className="flex w-full flex-col items-center gap-6 md:w-1/2">
            <InfoCard link={INFO_LINKS[2]} />
            <InfoCard link={INFO_LINKS[3]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ link }: { link: InfoLink }) {
  const Icon = link.icon;
  return (
    <Link to={link.to}>
      <Card className="flex h-56 w-64 flex-col items-center justify-center text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-xl md:w-full md:max-w-sm">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
          <div
            className={`flex h-20 w-28 items-center justify-center rounded-2xl ${link.chip}`}
          >
            <Icon size={40} strokeWidth={1} />
          </div>
          <h3 className="text-xl font-semibold">{link.title}</h3>
          <p className="text-gray-500">{link.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default Home;
