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
    return <FaEnvelopeOpen className="text-blue-500" />;
  }
  return <FaEnvelope className="text-green-500" />;
};
