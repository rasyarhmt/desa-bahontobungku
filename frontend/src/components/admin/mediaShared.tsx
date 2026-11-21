import type { JSX } from "react";
import { FileText, Image as ImageIcon, Video } from "lucide-react";

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
    foto: (
      <ImageIcon aria-hidden="true" className="size-5 text-[#0b6393]" />
    ),
    video: <Video aria-hidden="true" className="size-5 text-[#0b6393]" />,
    dokumen: (
      <FileText aria-hidden="true" className="size-5 text-[#0b6393]" />
    ),
  };

  return (
    iconMap[type.toLowerCase()] || (
      <FileText aria-hidden="true" className="size-5 text-slate-500" />
    )
  );
};
