import { useMemo } from "react";

import Pengumuman from "@/components/Pengumuman";
import ApparatusSection from "@/components/home/ApparatusSection";
import HeroSection from "@/components/home/HeroSection";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import InfoModulesSection from "@/components/home/InfoModulesSection";
import NewsSection from "@/components/home/NewsSection";
import SelfServiceSection from "@/components/home/SelfServiceSection";
import {
  toApparatusItems,
  toHeroMetrics,
  toNewsItems,
  toSelfServices,
} from "@/content/home";
import { useHomeData } from "@/hooks/useHomeData";

function Home() {
  const { data } = useHomeData();

  const view = useMemo(() => {
    const activeServiceCount = data.pelayanan.filter(
      (item) => item.status === "aktif",
    ).length;

    return {
      heroMetrics: toHeroMetrics(
        data.summary,
        activeServiceCount,
        data.aparatur.length,
      ),
      newsItems: toNewsItems(data.berita),
      apparatusItems: toApparatusItems(data.aparatur),
      selfServices: toSelfServices(data.pelayanan),
      activeServiceCount,
    };
  }, [data]);

  return (
    <div className="home-theme min-h-screen bg-surface font-sans text-on-surface antialiased">
      <HomeHeader />
      <main className="w-full pt-28">
        <HeroSection metrics={view.heroMetrics} />
        <Pengumuman />
        <InfoModulesSection />
        <SelfServiceSection
          services={view.selfServices}
          total={view.activeServiceCount}
        />
        <NewsSection items={view.newsItems} />
        <ApparatusSection items={view.apparatusItems} />
      </main>
      <HomeFooter />
    </div>
  );
}

export default Home;
