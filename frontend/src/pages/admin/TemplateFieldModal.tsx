import { useEffect, useState } from "react";
import { FaSave, FaSpinner, FaTimes } from "react-icons/fa";

import {
  adminCardClass,
  adminFieldClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import ModalPortal from "@/components/admin/ModalPortal";
import { adminTemplateApi } from "@/lib/api/admin";
import type { TemplateField } from "@/lib/api/schemas";
import { getErrorMessage } from "@/lib/errors";

interface Props {
  templateId: number | null;
  templateName?: string;
  onClose: () => void;
}

const TIPE_OPTIONS = ["text", "textarea", "date", "number", "select"] as const;

export default function TemplateFieldModal({
  templateId,
  templateName,
  onClose,
}: Props) {
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    void adminTemplateApi
      .getFields(templateId)
      .then((data) => {
        if (!cancelled) setFields(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "Gagal memuat field template."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [templateId]);

  useEffect(() => {
    if (!templateId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [templateId, saving, onClose]);

  if (!templateId) return null;

  const updateField = (index: number, patch: Partial<TemplateField>) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    );
  };

  const handleSave = async () => {
    const invalid = fields.find(
      (f) =>
        !f.label.trim() ||
        (f.tipe === "select" && f.options.filter((o) => o.trim()).length === 0),
    );
    if (invalid) {
      setError(
        invalid.tipe === "select"
          ? `Field "${invalid.key}" bertipe select dan wajib punya minimal satu opsi.`
          : `Label field "${invalid.key}" wajib diisi.`,
      );
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await adminTemplateApi.updateFields(
        templateId,
        fields.map((f, i) => ({
          key: f.key,
          label: f.label.trim(),
          tipe: f.tipe,
          options:
            f.tipe === "select"
              ? f.options.map((o) => o.trim()).filter(Boolean)
              : [],
          required: f.required,
          urutan: f.urutan || i + 1,
        })),
      );
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menyimpan field template."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalPortal>
      <div
        aria-hidden="true"
        onClick={saving ? undefined : onClose}
        className="fixed inset-0 z-[70] bg-inverse-surface/50 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-field-title"
        className="fixed left-1/2 top-1/2 z-[80] flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-border bg-surface-container-lowest shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Konfigurasi Form Surat
            </p>
            <h2
              id="template-field-title"
              className="mt-1 text-xl font-semibold text-on-surface"
            >
              Atur Field Template
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {templateName || "Template"} — label, tipe input, dan opsi select.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <FaTimes />
          </button>
        </div>

        <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <FaSpinner className="animate-spin text-3xl text-primary" />
              Memuat field...
            </div>
          ) : fields.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border bg-surface-container-low px-6 text-center text-sm text-muted-foreground">
              Template ini tidak memiliki field selain nama dan NIK.
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={field.key} className={`${adminCardClass} p-4`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <code className="rounded-lg bg-primary-fixed px-2 py-1 text-xs font-medium text-on-primary-fixed">
                    {`{{ ${field.key} }}`}
                  </code>
                  <label
                    htmlFor={`urutan-${field.key}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    Urutan
                    <input
                      id={`urutan-${field.key}`}
                      type="number"
                      min={1}
                      value={field.urutan || index + 1}
                      onChange={(e) =>
                        updateField(index, {
                          urutan: Number(e.target.value) || 0,
                        })
                      }
                      className={`${adminFieldClass} w-20 px-2 py-1.5`}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`label-${field.key}`}
                      className="mb-1.5 block text-xs font-medium text-on-surface-variant"
                    >
                      Label
                    </label>
                    <input
                      id={`label-${field.key}`}
                      value={field.label}
                      onChange={(e) =>
                        updateField(index, { label: e.target.value })
                      }
                      className={adminFieldClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`tipe-${field.key}`}
                      className="mb-1.5 block text-xs font-medium text-on-surface-variant"
                    >
                      Tipe
                    </label>
                    <select
                      id={`tipe-${field.key}`}
                      value={field.tipe}
                      onChange={(e) =>
                        updateField(index, {
                          tipe: e.target.value as TemplateField["tipe"],
                        })
                      }
                      className={adminFieldClass}
                    >
                      {TIPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {field.tipe === "select" && (
                  <div className="mt-3">
                    <label
                      htmlFor={`opsi-${field.key}`}
                      className="mb-1.5 block text-xs font-medium text-on-surface-variant"
                    >
                      Opsi (pisahkan dengan koma)
                    </label>
                    <input
                      id={`opsi-${field.key}`}
                      value={field.options.join(", ")}
                      onChange={(e) =>
                        updateField(index, {
                          options: e.target.value
                            .split(",")
                            .map((o) => o.trim()),
                        })
                      }
                      className={adminFieldClass}
                      placeholder="Laki-laki, Perempuan"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {error && (
          <div className="shrink-0 px-6 pb-2">
            <p
              role="alert"
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
            >
              {error}
            </p>
          </div>
        )}

        <footer className="shrink-0 border-t border-border bg-surface-container-lowest px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Field mengikuti placeholder di file template. Untuk menambah
              field, ganti file template.
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={adminSecondaryButtonClass}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || loading}
                className={adminPrimaryButtonClass}
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Simpan
              </button>
            </div>
          </div>
        </footer>
      </aside>
    </ModalPortal>
  );
}
