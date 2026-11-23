import type { JSX } from "react";
import { FaEnvelope, FaEnvelopeOpen } from "react-icons/fa";

export interface SuratFormData {
  jenis: "Surat Masuk" | "Surat Keluar";
  nomor: string;
  perihal: string;
  pengirim: string;
  tanggal: string;
  file: File | null;
  fileUrl?: string;
}

export const getSuratIcon = (type: string): JSX.Element => {
  if (type === "Surat Masuk") {
    return <FaEnvelopeOpen className="text-primary" />;
  }
  return <FaEnvelope className="text-[var(--success-fg)]" />;
};
