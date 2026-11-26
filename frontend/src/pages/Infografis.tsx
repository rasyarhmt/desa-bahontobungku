import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

import APBDes from "@/components/Infografis/APBDes";
import InfografisHero, {
  type InfografisTab,
} from "@/components/Infografis/InfografisHero";
import Penduduk from "@/components/Infografis/Penduduk";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import { CONTAINER_CLASS, INNER_BREADCRUMB_CLASS } from "@/lib/utils";

export default function Infografis() {
  const [activeTab, setActiveTab] = useState<InfografisTab>("demografi");

  return (
    <div className="home-theme min-h-screen bg-surface font-sans text-on-surface antialiased">
      <HomeHeader />

      <main className="w-full pt-28">
        <nav
          aria-label="Breadcrumb"
          className={`flex items-center gap-2 text-xs font-semibold text-on-surface-variant ${INNER_BREADCRUMB_CLASS} ${CONTAINER_CLASS}`}
        >
          <Link to="/" className="flex items-center gap-1.5 hover:text-primary">
            <Home className="size-4" />
            Beranda
          </Link>
          <ChevronRight className="size-4 text-outline" />
          <span className="text-primary">Infografis Desa</span>
        </nav>

        <InfografisHero activeTab={activeTab} onSelect={setActiveTab} />
        <Penduduk />
        <APBDes />
      </main>

      <HomeFooter />
    </div>
  );
}
