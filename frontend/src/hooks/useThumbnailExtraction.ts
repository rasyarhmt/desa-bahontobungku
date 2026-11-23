import { useState } from "react";

const extractThumbnailFromVideo = (videoFile: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      const videoUrl = URL.createObjectURL(videoFile);
      video.src = videoUrl;

      video.onloadedmetadata = () => {
        video.currentTime = 0.1;
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext("2d");
          ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(videoUrl);

              if (!blob) {
                reject(new Error("Failed to create thumbnail blob"));
                return;
              }

              const thumbnailFile = new File(
                [blob],
                `auto_thumbnail_${Date.now()}.jpg`,
                { type: "image/jpeg" },
              );

              resolve(thumbnailFile);
            },
            "image/jpeg",
            0.8,
          );
        } catch (err) {
          console.error("Error creating thumbnail:", err);
          reject(err);
        }
      };

      video.onerror = (err) => {
        console.error("Error loading video:", err);
        URL.revokeObjectURL(videoUrl);
        reject(err);
      };

      video.load();
    } catch (err) {
      console.error("Error in thumbnail extraction:", err);
      reject(err);
    }
  });
};

/**
 * Mengekstrak thumbnail dari video dengan indikator loading. Mengembalikan
 * `null` bila ekstraksi gagal (error sudah dicatat), sehingga pemanggil tidak
 * perlu try/catch sendiri.
 */
export function useThumbnailExtraction() {
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(false);

  const extractWithLoading = async (file: File): Promise<File | null> => {
    try {
      setIsThumbnailLoading(true);
      return await extractThumbnailFromVideo(file);
    } catch (err) {
      console.error("Failed to extract thumbnail:", err);
      return null;
    } finally {
      setIsThumbnailLoading(false);
    }
  };

  return { isThumbnailLoading, extractThumbnail: extractWithLoading };
}
