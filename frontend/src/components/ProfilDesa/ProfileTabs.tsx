import { useEffect, useState } from "react";

import { CONTAINER_CLASS } from "@/lib/utils";

const PROFILE_TABS = [
  { id: "visi-misi", label: "Visi & Misi" },
  { id: "struktur-aparatur", label: "Struktur Organisasi & Aparatur" },
  { id: "geografis", label: "Kondisi Geografis" },
];

export default function ProfileTabs() {
  const [active, setActive] = useState(PROFILE_TABS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-170px 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    PROFILE_TABS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="top-28 z-30 border-y border-surface-container bg-surface/95 backdrop-blur-xl">
      <nav
        aria-label="Navigasi profil desa"
        className={`scrollbar-hide flex gap-2 overflow-x-auto py-3 ${CONTAINER_CLASS}`}
      >
        {PROFILE_TABS.map((tab) => (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            onClick={() => setActive(tab.id)}
            aria-current={active === tab.id ? "true" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
              active === tab.id
                ? "bg-primary text-on-primary shadow-[0_4px_12px_rgba(0,105,72,0.18)]"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
