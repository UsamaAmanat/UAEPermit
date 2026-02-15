"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AlertTriangle, X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = true,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[80]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/55 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-[0.98] translate-y-2"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-[0.98] translate-y-2"
            >
              <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#050818] shadow-[0_25px_70px_rgba(0,0,0,0.7)]">
                <div className="flex items-start justify-between gap-3 px-5 pt-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        "mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border",
                        danger
                          ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
                          : "border-sky-400/30 bg-sky-500/10 text-sky-200",
                      ].join(" ")}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </div>

                    <div>
                      <Dialog.Title className="text-sm font-semibold text-white">
                        {title}
                      </Dialog.Title>
                      {description && (
                        <p className="mt-1 text-xs text-slate-400">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-slate-300 hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 border-t border-white/10 px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                    >
                      {cancelText}
                    </button>

                    <button
                      type="button"
                      onClick={onConfirm}
                      disabled={loading}
                      className={[
                        "rounded-full px-4 py-2 text-xs font-semibold shadow disabled:opacity-50",
                        danger
                          ? "bg-rose-500 text-white hover:bg-rose-600"
                          : "bg-sky-500 text-white hover:bg-sky-600",
                      ].join(" ")}
                    >
                      {loading ? "Working…" : confirmText}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
