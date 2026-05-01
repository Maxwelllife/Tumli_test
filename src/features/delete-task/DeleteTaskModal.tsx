import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Modal } from "../../shared/ui/Modal";
import { Button } from "../../shared/ui/Button";

type DeleteTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle?: string;
};

export function DeleteTaskModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
}: DeleteTaskModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      description={taskTitle}
      isOpen={isOpen}
      onClose={onClose}
      title={t("deleteTask.title")}
    >
      <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-red-900">
        <AlertTriangle aria-hidden className="mt-0.5 shrink-0" size={18} />
        <p className="text-sm">{t("deleteTask.body")}</p>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button onClick={onClose} type="button" variant="secondary">
          {t("actions.cancel")}
        </Button>
        <Button onClick={onConfirm} type="button" variant="danger">
          {t("actions.delete")}
        </Button>
      </div>
    </Modal>
  );
}
