import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  titulo: string;
  acciones?: React.ReactNode;
}

function Modal({ isOpen, onClose, children, titulo, acciones}: ModalProps) {
  if (!isOpen) return null;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      <dialog
        open={isOpen}
        className="modal"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-box w-full max-w-3xl">
          <h3 className="text-2xl text-center mb-8 pb-4 border-b border-gray-400">{titulo}</h3>
          <div className="">{children}</div>
          
          <div className="flex justify-end gap-8 mt-10">
            <button className="btn" onClick={onClose}>
              Cerrar
            </button>
            {acciones}
          </div>
        </div>
      </dialog>
    </>
  );
}

export default Modal;
