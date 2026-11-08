import { http } from "../client";
import {
  AnyDataSchema,
  SuratTemplateListSchema,
  SuratTemplateSchema,
  TemplateFieldsSchema,
  TemplateFieldsUpdateSchema,
  type TemplateFieldUpdate,
} from "../schemas";

// ============================================================================
// Admin: template surat
// ============================================================================

export const adminTemplateApi = {
  getAllTemplates: async () =>
    http.getOr("/v1/surat-template/", SuratTemplateListSchema, []),

  getTemplateById: async (id: number | string) => {
    try {
      return await http.get(`/v1/surat-template/${id}`, SuratTemplateSchema);
    } catch {
      return null;
    }
  },

  addTemplate: (formData: FormData) =>
    http.postForm("/v1/surat-template/", formData, AnyDataSchema),

  updateTemplate: (id: number | string, formData: FormData) =>
    http.putForm(`/v1/surat-template/${id}`, formData, AnyDataSchema),

  toggleStatus: (id: number | string) =>
    http.put(`/v1/surat-template/${id}/toggle-status`, null, AnyDataSchema),

  deleteTemplate: (id: number | string) =>
    http.delete(`/v1/surat-template/${id}`, AnyDataSchema),

  previewTemplate: async (id: number | string): Promise<Blob> =>
    http.getBlob(`/v1/surat-template/${id}/preview`),

  getFields: async (id: number | string) =>
    http.getOr(`/v1/surat-template/${id}/fields`, TemplateFieldsSchema, []),

  updateFields: async (id: number | string, fields: TemplateFieldUpdate[]) =>
    http.put(
      `/v1/surat-template/${id}/fields`,
      TemplateFieldsUpdateSchema.parse({ fields }),
      AnyDataSchema,
    ),
};
