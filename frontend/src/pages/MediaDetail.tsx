import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import MediaDetailView from "@/components/Media/MediaDetailView";
import { MediaError, MediaLoading } from "@/components/Media/MediaStates";
import { mediaApi } from "@/lib/api/media";
import type { Media } from "@/lib/api/schemas";
import { CONTAINER_CLASS, SECTION_CLASS } from "@/lib/utils";

export default function MediaDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<Media | null>(null);
  const [related, setRelated] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    const load = async () => {
      const mediaId = Number(id);
      if (!Number.isFinite(mediaId)) {
        setError("Media tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      const [detail, all] = await Promise.all([
        mediaApi.getMediaById(mediaId),
        mediaApi.getAllMedia(),
      ]);

      if (!active) return;
      if (!detail) {
        setError("Media tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      const sameType = all.filter(
        (media) => media.id !== detail.id && media.tipe === detail.tipe,
      );
      const others = all.filter(
        (media) => media.id !== detail.id && media.tipe !== detail.tipe,
      );

      setItem(detail);
      setRelated([...sameType, ...others].slice(0, 3));
      setIsLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  return (
    <div className="home-theme min-h-screen bg-surface font-sans text-on-surface antialiased">
      <HomeHeader />
      <main className="min-h-screen w-full pt-28">
        {isLoading ? (
          <MediaLoading />
        ) : error ? (
          <div className={`${SECTION_CLASS} ${CONTAINER_CLASS}`}>
            <MediaError message={error} onRetry={() => setReloadKey((key) => key + 1)} />
          </div>
        ) : item ? (
          <MediaDetailView item={item} related={related} />
        ) : null}
      </main>
      <HomeFooter />
    </div>
  );
}
