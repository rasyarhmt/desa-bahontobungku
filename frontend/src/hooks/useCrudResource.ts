import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { useDisclosure, type UseDisclosureResult } from "./useDisclosure";

export type CrudMode = "add" | "edit";

export interface CrudMessages {
  created: string;
  updated: string;
  deleted: string;
  saveError: string;
  deleteError: string;
}

export interface UseCrudResourceOptions<TItem extends { id: number }, TForm> {
  items: TItem[];
  initialForm: TForm;
  toForm: (item: TItem) => TForm;
  /** Kembalikan pesan bila form tidak valid, atau null bila valid. */
  validate?: (form: TForm, mode: CrudMode) => string | null;
  /** Kembalikan pesan bila aksi tidak diizinkan (mis. belum login), atau null. */
  guard?: () => string | null;
  create: (form: TForm) => Promise<unknown>;
  update: (form: TForm, item: TItem) => Promise<unknown>;
  remove: (item: TItem) => Promise<unknown>;
  refetch: () => Promise<unknown> | void;
  messages: CrudMessages;
}

export interface UseCrudResourceResult<TItem, TForm> {
  addModal: UseDisclosureResult;
  editModal: UseDisclosureResult;
  deleteModal: UseDisclosureResult;
  currentItem: TItem | null;
  formData: TForm;
  setFormData: Dispatch<SetStateAction<TForm>>;
  isActionLoading: boolean;
  handleAdd: () => void;
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
  saveNewItem: () => Promise<void>;
  saveEditedItem: () => Promise<void>;
  confirmDelete: () => Promise<void>;
  /** Jalankan aksi tambahan (mis. toggle status) dengan guard/loading/refetch/toast. */
  runAction: (
    action: () => Promise<unknown>,
    successMessage: string,
    errorMessage: string,
  ) => Promise<boolean>;
}

/**
 * Orkestrasi CRUD admin: state modal/item/form, loading, dan alur
 * simpan/hapus (guard -> aksi -> refetch -> toast). Mapping form/payload
 * diserahkan ke pemanggil via opsi.
 */
export function useCrudResource<TItem extends { id: number }, TForm>(
  options: UseCrudResourceOptions<TItem, TForm>,
): UseCrudResourceResult<TItem, TForm> {
  const {
    items,
    initialForm,
    toForm,
    validate,
    guard,
    create,
    update,
    remove,
    refetch,
    messages,
  } = options;

  const addModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [currentItem, setCurrentItem] = useState<TItem | null>(null);
  const [formData, setFormData] = useState<TForm>(initialForm);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleAdd = () => {
    setFormData(initialForm);
    addModal.open();
  };

  const handleEdit = (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setCurrentItem(item);
    setFormData(toForm(item));
    editModal.open();
  };

  const handleDelete = (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setCurrentItem(item);
    deleteModal.open();
  };

  const runAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
    errorMessage: string,
  ): Promise<boolean> => {
    const guardMessage = guard?.();
    if (guardMessage) {
      toast.warning(guardMessage);
      return false;
    }
    try {
      setIsActionLoading(true);
      await action();
      await refetch();
      toast.success(successMessage);
      return true;
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, errorMessage));
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  const run = async (
    action: () => Promise<unknown>,
    successMessage: string,
    errorMessage: string,
    close: () => void,
  ) => {
    if (await runAction(action, successMessage, errorMessage)) {
      close();
    }
  };

  const isFormValid = (mode: CrudMode): boolean => {
    const message = validate?.(formData, mode);
    if (message) {
      toast.info(message);
      return false;
    }
    return true;
  };

  const saveNewItem = async () => {
    if (!isFormValid("add")) return;
    await run(() => create(formData), messages.created, messages.saveError, addModal.close);
  };

  const saveEditedItem = async () => {
    if (!currentItem || !isFormValid("edit")) return;
    await run(
      () => update(formData, currentItem),
      messages.updated,
      messages.saveError,
      editModal.close,
    );
  };

  const confirmDelete = async () => {
    if (!currentItem) return;
    await run(
      () => remove(currentItem),
      messages.deleted,
      messages.deleteError,
      deleteModal.close,
    );
  };

  return {
    addModal,
    editModal,
    deleteModal,
    currentItem,
    formData,
    setFormData,
    isActionLoading,
    handleAdd,
    handleEdit,
    handleDelete,
    saveNewItem,
    saveEditedItem,
    confirmDelete,
    runAction,
  };
}
