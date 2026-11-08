import { useEffect, useState } from "react";
import { FaSpinner, FaTimes, FaSave } from "react-icons/fa";
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
    <div className="fixed inset-0 bg-gray-700/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Atur Field Template
            </h3>
            <p className="text-sm text-gray-500">
              {templateName || "Template"} — label, tipe input, dan opsi select.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
            title="Tutup"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-10">
              <FaSpinner className="animate-spin text-indigo-500 text-3xl mx-auto mb-3" />
              <p className="text-gray-500">Memuat field...</p>
            </div>
          ) : fields.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Template ini tidak memiliki field selain nama dan NIK.
            </p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.key}
                  className="border rounded-xl p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <code className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      {`{{ ${field.key} }}`}
                    </code>
                    <label className="text-xs text-gray-500 flex items-center gap-1">
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
                        className="w-16 px-2 py-1 border rounded text-sm"
                      />
                    </label>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Label
                      </label>
                      <input
                        value={field.label}
                        onChange={(e) =>
                          updateField(index, { label: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tipe
                      </label>
                      <select
                        value={field.tipe}
                        onChange={(e) =>
                          updateField(index, {
                            tipe: e.target.value as TemplateField["tipe"],
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">
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
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="Laki-laki, Perempuan"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Field mengikuti placeholder di file template. Untuk menambah field,
            ganti file template.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-60"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Simpan
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
