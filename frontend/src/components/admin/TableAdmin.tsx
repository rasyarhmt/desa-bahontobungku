import { ArrowLeftRight, Trash2 } from "lucide-react";

interface TableAdminProps {
  columns: string[];
  data: ({ [key: string]: string | number | boolean | null | undefined } & {
    role?: string | null;
  })[];
  onDelete?: (idx: number) => void;
  onTransfer?: (idx: number) => void;
}

export default function TableAdmin({
  columns,
  data,
  onDelete,
  onTransfer,
}: TableAdminProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col, idx) => (
              <th key={idx} className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                {col}
              </th>
            ))}
            <th className="whitespace-nowrap px-4 py-4 text-right text-base font-bold text-slate-900">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-8 text-center text-base text-slate-600"
              >
                Tidak ada data admin.
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                {columns.map((col, i) => (
                  <td key={i} className="whitespace-nowrap px-4 py-4 text-base text-slate-800">
                    {item[col]}
                  </td>
                ))}
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {onTransfer && item.role !== "superadmin" && (
                      <button
                        type="button"
                        onClick={() => onTransfer(idx)}
                        title="Jadikan Superadmin"
                        aria-label="Jadikan Superadmin"
                        className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
                      >
                        <ArrowLeftRight aria-hidden="true" className="size-5" />
                        <span className="hidden xl:inline">Jadikan Superadmin</span>
                      </button>
                    )}
                    {onDelete && item.role !== "superadmin" && (
                      <button
                        type="button"
                        onClick={() => onDelete(idx)}
                        title="Hapus admin"
                        aria-label="Hapus admin"
                        className="flex min-h-11 items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                      >
                        <Trash2 aria-hidden="true" className="size-5" />
                        <span className="hidden xl:inline">Hapus</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
