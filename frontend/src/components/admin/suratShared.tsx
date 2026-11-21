import type { JSX } from "react";
import { Mail, MailOpen } from "lucide-react";

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
    return (
      <MailOpen
        className="size-5 text-[#0b6393]"
        aria-hidden="true"
      />
    );
  }
  return <Mail className="size-5 text-emerald-700" aria-hidden="true" />;
};
