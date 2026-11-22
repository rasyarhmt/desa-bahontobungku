import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Megaphone } from "lucide-react";

import { pengumumanApi } from "@/lib/api/pengumuman";
import { useAsyncData } from "@/hooks";
import { CONTAINER_CLASS } from "@/lib/utils";

interface Announcement {
  id: number;
  judul: string;
  isi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}

const REFRESH_MS = 5 * 60 * 1000;

export default function Pengumuman() {
  const {
    data: announcements,
    isLoading: loading,
    refetch: fetchAnnouncements,
  } = useAsyncData<Announcement[]>(
    async () => pengumumanApi.getActivePengumuman(),
    [],
    { errorMessage: "Gagal memuat pengumuman" },
  );

  const [, setCurrentIndex] = useState(0);

  useEffect(() => {
    void fetchAnnouncements();
    const intervalId = setInterval(fetchAnnouncements, REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [fetchAnnouncements]);

  useEffect(() => {
    if (announcements.length > 1) {
      const rotationInterval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 15_000);
      return () => clearInterval(rotationInterval);
    }
  }, [announcements.length]);

  const items = announcements.length > 0 ? announcements : [];

  return (
    <section className={`${CONTAINER_CLASS} relative z-20 -mt-6`}>
      <div className="flex items-center gap-4 overflow-hidden rounded-2xl bg-inverse-surface p-4 text-inverse-on-surface shadow-xl">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-md">
          <Megaphone className="size-5" />
        </span>
        <div className="flex flex-1 items-center gap-3 overflow-hidden text-left">
          <span className="hidden shrink-0 rounded bg-surface-container-lowest/15 px-2.5 py-1 text-xs font-semibold text-primary-fixed sm:inline-block">
            Pengumuman
          </span>
          <div className="overflow-hidden whitespace-nowrap text-sm">
            {loading ? (
              "Memuat pengumuman..."
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  className="inline-flex gap-x-96"
                  initial={{ x: "100%" }}
                  animate={{ x: "-100%" }}
                  transition={{
                    duration: 50,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {items.length > 0 ? (
                    [...items, ...items].map((item, index) => (
                      <p key={`${item.id}-${index}`} className="shrink-0">
                        <span className="font-semibold text-on-primary">
                          {item.judul} :{" "}
                        </span>
                        {item.isi}
                      </p>
                    ))
                  ) : (
                    <p>Saat ini: belum ada pengumuman aktif.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
