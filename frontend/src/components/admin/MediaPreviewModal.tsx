import { useEffect, useState } from "react";
import { CircleX, Download, LoaderCircle, TriangleAlert } from "lucide-react";

import { adminMediaUtils } from "@/lib/api/admin";
import { formatDateLong } from "@/lib/format";
import { toast } from "@/lib/toast";

import { getMediaIcon, type MediaItem } from "./mediaShared";

interface MediaPreviewModalProps {
  isOpen: boolean;
  item: MediaItem | null;
  onClose: () => void;
}

export default function MediaPreviewModal({
  isOpen,
  item,
  onClose,
}: MediaPreviewModalProps) {
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMediaLoading(true);
      setMediaError(false);
    }
  }, [isOpen, item]);

  const handleDownload = (
    e: React.MouseEvent,
    fileUrl: string,
    filename?: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = filename || "download";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      toast.info("Gagal mengunduh file. Silakan coba lagi.");
    }
  };

  const renderMediaContent = () => {
    if (!item) return null;

    const mediaUrl = adminMediaUtils.getMediaUrl(item.file);

    const mediaTypeMap: Record<string, React.JSX.Element> = {
      foto: (
        <div>
          <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-100">
            {mediaLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/90">
                <LoaderCircle
                  aria-hidden="true"
                  className="size-10 animate-spin text-[#0b6393]"
                />
              </div>
            )}
            <img
              src={mediaUrl || "/placeholder.svg?height=600&width=800"}
              alt={item.nama}
              className="max-h-[70vh] max-w-full object-contain"
              onLoad={() => setMediaLoading(false)}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                setMediaLoading(false);
                setMediaError(true);
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/placeholder.svg?height=600&width=800";
              }}
            />
          </div>
          <p className="mt-3 text-base font-medium text-slate-700">
            Foto: {item.nama}
          </p>
        </div>
      ),
      video: (
        <div>
          <div className="relative overflow-hidden rounded-xl bg-slate-100">
            {mediaLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/90">
                <LoaderCircle
                  aria-hidden="true"
                  className="size-10 animate-spin text-[#0b6393]"
                />
              </div>
            )}
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="w-full max-h-[70vh]"
              poster={adminMediaUtils.getVideoThumbnail(item)}
              onLoadedData={() => setMediaLoading(false)}
              onError={() => {
                setMediaLoading(false);
                setMediaError(true);
              }}
            >
              Browser Anda tidak mendukung pemutaran video.
            </video>
            {mediaError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                <TriangleAlert
                  aria-hidden="true"
                  className="mb-4 size-12 text-red-700"
                />
                <p className="mb-4 text-base font-semibold text-slate-900">
                  Video tidak dapat dimuat
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(mediaUrl, "_blank")}
                    className="min-h-11 rounded-xl bg-[#0b6393] px-5 py-2 font-semibold text-white transition-colors hover:bg-[#0a577f]"
                  >
                    Buka di Tab Baru
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 text-base font-medium text-slate-700">
            Video: {item.nama}
          </p>
        </div>
      ),
      dokumen: (
        <div>
          <div className="relative overflow-hidden rounded-xl bg-slate-100">
            {mediaLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/90">
                <LoaderCircle
                  aria-hidden="true"
                  className="size-10 animate-spin text-[#0b6393]"
                />
              </div>
            )}
            <iframe
              src={mediaUrl}
              className="h-[70vh] w-full"
              title={item.nama}
              onLoad={() => setMediaLoading(false)}
              onError={() => {
                setMediaLoading(false);
                setMediaError(true);
              }}
            />
            {mediaError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                <TriangleAlert
                  aria-hidden="true"
                  className="mb-4 size-12 text-red-700"
                />
                <p className="mb-4 text-base font-semibold text-slate-900">
                  Dokumen tidak dapat dimuat
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(mediaUrl, "_blank")}
                    className="min-h-11 rounded-xl bg-[#0b6393] px-5 py-2 font-semibold text-white transition-colors hover:bg-[#0a577f]"
                  >
                    Buka di Tab Baru
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 text-base font-medium text-slate-700">
            Dokumen: {item.nama}
          </p>
        </div>
      ),
    };

    return (
      mediaTypeMap[item.tipe ?? ""] || (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-slate-100">
          <TriangleAlert
            aria-hidden="true"
            className="mb-4 size-12 text-amber-700"
          />
          <p className="text-base font-semibold text-slate-800">
            Format media tidak didukung
          </p>
        </div>
      )
    );
  };

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">
          <h3 className="flex min-w-0 items-center gap-2 text-xl font-bold text-slate-900">
            {getMediaIcon(item.tipe ?? "")}
            <span className="truncate">{item.nama}</span>
          </h3>
          <button
            onClick={onClose}
            aria-label="Tutup preview"
            title="Tutup preview"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
          >
            <CircleX aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="overflow-auto p-6">
          <div className="mb-4">{renderMediaContent()}</div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-4 text-base text-slate-700">{item.deskripsi}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600">Tipe</p>
                <p className="text-base font-semibold text-slate-900">
                  {item.tipe}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Tanggal Dibuat
                </p>
                <p className="text-base font-semibold text-slate-900">
                  {item.created_at ? formatDateLong(item.created_at) : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-end gap-3 border-t border-slate-200 bg-white p-4">
          <button
            onClick={onClose}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Tutup
          </button>
          <button
            onClick={(e) =>
              handleDownload(
                e,
                adminMediaUtils.getMediaUrl(item.file),
                item.file.split("/").pop(),
              )
            }
            className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-5 py-2 font-semibold text-white transition-colors hover:bg-[#0a577f]"
          >
            <Download aria-hidden="true" className="size-5" />
            <span>Unduh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
