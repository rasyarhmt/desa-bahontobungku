import { useState } from "react";
import { FaExternalLinkAlt, FaSpinner } from "react-icons/fa";

import { authApi } from "@/lib/api/auth";

interface PortalWargaLinkProps {
  className?: string;
  label?: string;
}

export default function PortalWargaLink({
  className,
  label = "Lihat Portal Warga",
}: PortalWargaLinkProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isLeaving) return;

    setIsLeaving(true);
    await authApi.logout();
    window.location.href = "/";
  };

  return (
    <a
      href="/"
      onClick={(event) => void handleClick(event)}
      aria-busy={isLeaving}
      className={className}
    >
      {isLeaving ? (
        <FaSpinner className="animate-spin text-xs" />
      ) : (
        <FaExternalLinkAlt className="text-xs" />
      )}
      <span>{isLeaving ? "Memproses..." : label}</span>
    </a>
  );
}
