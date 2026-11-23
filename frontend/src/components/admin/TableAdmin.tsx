import type { ReactNode } from "react";
import { FaEdit, FaExchangeAlt, FaTrash } from "react-icons/fa";

import { AdminStatusBadge, AdminTableShell } from "@/components/admin/admin-ui";

interface TableAdminProps {
  columns: string[];
  data: ({ [key: string]: string | number | boolean | null | undefined } & {
    role?: string | null;
  })[];
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  onTransfer?: (id: number) => void;
  loading?: boolean;
  footer?: ReactNode;
}

const actionButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary disabled:cursor-not-allowed disabled:opacity-50";

const headerLabels: Record<string, string> = {
  id: "ID",
  nama: "Nama",
  email: "Email",
  role: "Role",
  last_login: "Login Terakhir",
};

export default function TableAdmin({
  columns,
  data,
  onDelete,
  onEdit,
  onTransfer,
  loading = false,
  footer,
}: TableAdminProps) {
  return (
    <AdminTableShell
      loading={loading}
      empty={data.length === 0}
      emptyLabel="Tidak ada data admin."
      footer={footer}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-on-surface-variant">
          <thead>
            <tr className="border-b border-border bg-surface-container-low">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {headerLabels[col] ?? col}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr
                key={String(item.id)}
                className="transition-colors hover:bg-surface-container-low"
              >
                {columns.map((col, i) => (
                  <td key={i} className="px-4 py-3 text-on-surface">
                    {col === "role" ? (
                      <AdminStatusBadge
                        label={String(item[col] ?? "-")}
                        tone={
                          item.role === "superadmin" ? "primary" : "neutral"
                        }
                      />
                    ) : (
                      (item[col] ?? "-")
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {onEdit && item.role !== "superadmin" && (
                      <button
                        type="button"
                        onClick={() => onEdit(Number(item.id))}
                        className={actionButtonClass}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                    )}
                    {onTransfer && item.role !== "superadmin" && (
                      <button
                        type="button"
                        onClick={() => onTransfer(Number(item.id))}
                        className={actionButtonClass}
                        title="Jadikan Superadmin"
                      >
                        <FaExchangeAlt />
                      </button>
                    )}
                    {onDelete && item.role !== "superadmin" && (
                      <button
                        type="button"
                        onClick={() => onDelete(Number(item.id))}
                        className={`${actionButtonClass} hover:text-destructive`}
                        title="Hapus"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminTableShell>
  );
}
