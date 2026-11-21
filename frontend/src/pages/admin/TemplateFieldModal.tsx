import { useEffect, useState } from "react";
import { LoaderCircle, Save, X } from "lucide-react";
import type { TemplateField } from "@/lib/api/schemas";
import { adminTemplateApi } from "@/lib/api/admin";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Atur Field Template
            </h3>
            <p className="text-base text-slate-600">
              {templateName || "Template"} — label, tipe input, dan opsi select.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100"
            aria-label="Tutup"
            title="Tutup"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-10 text-center">
              <LoaderCircle
                className="mx-auto mb-3 size-8 animate-spin text-[#0b6393]"
                aria-hidden="true"
              />
              <p className="text-base text-slate-600">Memuat field...</p>
            </div>
          ) : fields.length === 0 ? (
            <p className="py-8 text-center text-base text-slate-600">
              Template ini tidak memiliki field selain nama dan NIK.
            </p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.key}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <code className="rounded-md bg-[#0b6393]/10 px-2 py-1 text-sm font-semibold text-[#0b6393]">
                      {`{{ ${field.key} }}`}
                    </code>
                    <label className="flex items-center gap-2 text-base font-semibold text-slate-700">
                      Urutan
                      <input
                        type="number"
                        min={1}
                        value={field.urutan || index + 1}
                        onChange={(e) =>
                          updateField(index, {
                            urutan: Number(e.target.value) || 0,
                          })
                        }
                        className="min-h-11 w-20 rounded-lg border border-slate-300 px-3 text-base text-slate-900"
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-base font-semibold text-slate-700">
                        Label
                      </label>
                      <input
                        value={field.label}
                        onChange={(e) =>
                          updateField(index, { label: e.target.value })
                        }
                        className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-base font-semibold text-slate-700">
                        Tipe
                      </label>
                      <select
                        value={field.tipe}
                        onChange={(e) =>
                          updateField(index, {
                            tipe: e.target.value as TemplateField["tipe"],
                          })
                        }
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900"
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
                      <label className="mb-2 block text-base font-semibold text-slate-700">
                        Opsi (pisahkan dengan koma)
                      </label>
                      <input
                        value={field.options.join(", ")}
                        onChange={(e) =>
                          updateField(index, {
                            options: e.target.value
                              .split(",")
                              .map((o) => o.trim()),
                          })
                        }
                        className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900"
                        placeholder="Laki-laki, Perempuan"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Field mengikuti placeholder di file template. Untuk menambah field,
            ganti file template.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="min-h-11 rounded-xl bg-slate-100 px-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 text-base font-semibold text-white transition-colors hover:bg-[#084f73] disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle
                  className="size-5 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Save className="size-5" aria-hidden="true" />
              )}
              Simpan
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 pb-4">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
