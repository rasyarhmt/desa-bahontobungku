import { UsersRound } from "lucide-react";

import CarouselAparatur from "@/components/ProfilDesa/CarouselProfil";
import CarouselVisiMisi from "@/components/ProfilDesa/CarouselVisiMisi";
import GeographySection from "@/components/ProfilDesa/GeographySection";
import ProfileHero from "@/components/ProfilDesa/ProfileHero";
import ProfileTabs from "@/components/ProfilDesa/ProfileTabs";
import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import { SectionHeading } from "@/components/home/shared";
import { useProfileData } from "@/hooks/useProfileData";
import { CONTAINER_CLASS, INNER_SECTION_CLASS } from "@/lib/utils";

export default function ProfilDesa() {
  const { data, isLoading, error } = useProfileData();

  return (
    <div className="home-theme min-h-screen bg-surface font-sans text-on-surface antialiased">
      <HomeHeader />

      <main className="w-full pt-28">
        <ProfileHero />
        <ProfileTabs />

        <div id="visi-misi" className="scroll-mt-40">
          <CarouselVisiMisi />
        </div>

        <section
          id="struktur-aparatur"
          className={`scroll-mt-40 border-t border-surface-container bg-surface ${INNER_SECTION_CLASS}`}
        >
          <div className={`${CONTAINER_CLASS}`}>
            <SectionHeading
              eyebrow="Pemerintahan Desa"
              icon={UsersRound}
              title="Struktur Organisasi & Aparatur"
              description="Kenali perangkat pemerintahan desa yang melayani masyarakat Bahontobungku."
            />
            <div className="mt-10 md:mt-12">
              <CarouselAparatur />
            </div>
          </div>
        </section>

        <GeographySection summary={data} isLoading={isLoading} error={error} />
      </main>

      <HomeFooter />
    </div>
  );
}
