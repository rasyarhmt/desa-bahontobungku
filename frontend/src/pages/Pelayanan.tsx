import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

import ApplicationSteps from "@/components/Pelayanan/ApplicationSteps";
import HelpBanner from "@/components/Pelayanan/HelpBanner";
import PelayananHero from "@/components/Pelayanan/PelayananHero";
import ServiceCatalog from "@/components/Pelayanan/ServiceCatalog";
import { toServiceItems } from "@/components/Pelayanan/pelayananView";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import { usePelayananData } from "@/hooks/usePelayananData";
import { CONTAINER_CLASS } from "@/lib/utils";

export default function Pelayanan() {
  const [query, setQuery] = useState("");
  const { data, isLoading, error, refetch } = usePelayananData();
  const serviceItems = useMemo(() => toServiceItems(data.layanan), [data.layanan]);

  return (
    <div className="home-theme min-h-screen bg-surface font-sans text-on-surface antialiased">
      <HomeHeader />

      <main className="w-full pt-28">
        <nav
          aria-label="Breadcrumb"
          className={`flex items-center gap-2 pb-4 pt-8 text-xs font-semibold text-on-surface-variant ${CONTAINER_CLASS}`}
        >
          <Link to="/" className="flex items-center gap-1.5 hover:text-primary">
            <Home className="size-4" />
            Beranda
          </Link>
          <ChevronRight className="size-4 text-outline" />
          <span className="text-primary">Pelayanan Mandiri</span>
        </nav>

        <PelayananHero query={query} onQueryChange={setQuery} />
        <ServiceCatalog
          items={serviceItems}
          query={query}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
        />
        <ApplicationSteps />
        <HelpBanner contact={data.contact} />
      </main>

      <HomeFooter />
    </div>
  );
}
