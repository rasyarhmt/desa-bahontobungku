import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { pengumumanApi } from "@/lib/api/pengumuman";
import { useAsyncData } from "@/hooks";

interface Announcement {
  id: number;
  judul: string;
  isi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}

const ROTATION_MS = 15_000;
const REFRESH_MS = 5 * 60 * 1000;

export default function Pengumuman() {
  const {
    data: announcements,
    isLoading: loading,
    refetch: fetchAnnouncements,
  } = useAsyncData<Announcement[]>(
    async () => {
      const data = await pengumumanApi.getActivePengumuman();
      return data;
    },
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
      }, ROTATION_MS);
      return () => clearInterval(rotationInterval);
    }
  }, [announcements.length]);

  return (
    <div
      className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-1/2 z-30
                 bg-gray-800 text-white py-3 px-4 rounded-xl shadow-lg
                 w-[96%] md:max-w-9xl flex items-center gap-3 overflow-hidden"
      style={{ fontFamily: "Poppins" }}
    >
      <div className="flex-shrink-0 absolute z-10 inset-0 bg-gray-800 top-2 w-fit px-3">
        <span className="text-2xl">📢</span>
      </div>

      {loading ? (
        <div className="ml-10 text-sm md:text-base">Memuat pengumuman...</div>
      ) : (
        <AnimatePresence mode="wait">
          <div className="relative overflow-hidden whitespace-nowrap z-0 ml-10">
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
              {announcements.length > 0 ? (
                [...announcements, ...announcements].map((a, idx) => (
                  <p
                    key={`${a.id}-${idx}`}
                    className="text-sm md:text-base flex-shrink-0"
                  >
                    {a.judul && (
                      <span className="font-semibold">{a.judul} : </span>
                    )}
                    {a.isi}
                  </p>
                ))
              ) : (
                <p>Saat ini belum ada pengumuman...</p>
              )}
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
