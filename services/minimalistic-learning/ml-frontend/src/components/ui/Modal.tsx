import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="animate-in fade-in absolute inset-0 bg-black/40 backdrop-blur-sm duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-background border-theme-accent/10 animate-in zoom-in-95 relative z-10 mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] duration-200">
        {/* Header */}
        <div className="border-theme-accent/10 bg-theme-element-sec/50 flex items-center justify-between border-b px-6 py-5">
          <h2 className="text-foreground text-xl font-black">{title}</h2>
          <button
            onClick={onClose}
            className="bg-theme-element text-foreground/50 hover:text-foreground hover:bg-theme-accent/10 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="custom-scrollbar text-foreground/80 space-y-4 overflow-y-auto p-6 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};
