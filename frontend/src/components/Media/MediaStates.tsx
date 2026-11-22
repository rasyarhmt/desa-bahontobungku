import { FaExclamationTriangle, FaSpinner } from "react-icons/fa";

export function MediaLoading() {
  return (
    <div className="flex justify-center py-20">
      <FaSpinner className="size-10 animate-spin text-primary" />
    </div>
  );
}

export function MediaError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <FaExclamationTriangle className="mb-3 size-10 text-tertiary-container" />
      <p className="text-sm text-on-surface-variant">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary transition-colors hover:bg-tertiary-container"
      >
        Coba Lagi
      </button>
    </div>
  );
}

export function MediaEmpty() {
  return (
    <div className="rounded-3xl bg-surface-container-lowest p-16 text-center shadow-sm">
      <p className="text-sm text-on-surface-variant">
        Tidak ada media yang cocok dengan pencarian atau filter ini.
      </p>
    </div>
  );
}
