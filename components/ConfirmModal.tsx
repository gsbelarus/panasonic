'use client';

import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleId="confirm-modal-title"
    >
      <p className="text-[var(--muted)] mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 text-sm font-medium text-[var(--foreground)] bg-white border border-[var(--border)] rounded-[10px] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="px-4 py-2.5 text-sm font-medium text-white bg-[var(--primary)] rounded-[10px] hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
