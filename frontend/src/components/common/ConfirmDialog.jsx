import {
  AlertTriangle,
  X,
} from "lucide-react";

import Button from "./Button";

const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                {title}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {message}
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant="danger"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;