import type { JSX } from "react";
import { FaImage, FaVideo, FaFileAlt } from "react-icons/fa";

import { type Media } from "@/lib/api/schemas";

export type MediaItem = Media;

export interface MediaFormState {
  nama: string;
  tipe: string;
  deskripsi: string;
  file: File | null;
  thumbnail: File | null;
}

export const getMediaIcon = (type: string): JSX.Element => {
  const iconMap: Record<string, JSX.Element> = {
    foto: <FaImage className="text-blue-500" />,
    video: <FaVideo className="text-red-500" />,
    dokumen: <FaFileAlt className="text-yellow-500" />,
  };

  return iconMap[type.toLowerCase()] || <FaFileAlt className="text-gray-500" />;
};
