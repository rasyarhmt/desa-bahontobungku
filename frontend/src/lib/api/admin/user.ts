import { http } from "../client";
import { AdminUserListSchema, AdminUserSchema, AnyDataSchema } from "../schemas";

// ============================================================================
// Admin: user / manajemen akun
// ============================================================================

export const adminUserApi = {
  getAllUsers: async () =>
    http.getOr("/v1/user/all", AdminUserListSchema, []),

  getCurrentUser: async () => {
    try {
      return await http.get("/v1/user/current-user", AdminUserSchema);
    } catch {
      return null;
    }
  },

  deleteUser: (id: number | string) =>
    http.delete(`/v1/user/${id}`, AnyDataSchema),

  transferSuperadmin: (toId: number | string) =>
    http.post(
      "/v1/user/transfer-superadmin",
      { to_id: toId },
      AnyDataSchema,
    ),

  addUser: (nama: string, email: string, password: string) =>
    http.post(
      "/v1/user/add",
      { nama, email, password },
      AnyDataSchema,
    ),

  update: (userData: { nama?: string; password?: string }) =>
    http.put("/v1/user/update", userData, AnyDataSchema),
};
