import { http } from "./client";
import { AparaturListSchema, AparaturSchema, type Aparatur } from "./schemas";
import { formatAparatData, type AparatFormatted } from "./mappers";

export type { AparatFormatted, AparatFormatted as AparaturFormatted };

export const aparaturApi = {
  getAllAparat: async (): Promise<Aparatur[]> =>
    http.getOr("/v1/aparatur/", AparaturListSchema, []),

  getAparatById: async (id: number): Promise<Aparatur | null> => {
    try {
      return await http.get(`/v1/aparatur/${id}`, AparaturSchema);
    } catch {
      return null;
    }
  },

  formatAparatData,
};
