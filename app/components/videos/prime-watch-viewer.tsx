'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ChevronLeft, Info, X } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

type PrimeWatchViewerProps = {
  open: boolean
  onClose: () => void
  title: string
  meta?: string
  children: ReactNode
  bottomRail: ReactNode
  paywallOverlay?: ReactNode
  detailsPanel?: ReactNode
}

export default function PrimeWatchViewer({
  open,
  onClose,
  title,
  meta,
  children,
  bottomRail,
  paywallOverlay,
  detailsPanel,
}: PrimeWatchViewerProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    if (!open) setDetailsOpen(false)
  }, [open])

  const handleClose = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {})
    }
    onClose()
  }, [onClose])

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          'flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col border-0 bg-[var(--ariome-bg)] p-0 shadow-none',
          'left-0 top-0 translate-x-0 translate-y-0 rounded-none sm:max-w-none',
          'data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100',
        )}
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="absolute inset-x-0 top-0 z-40 flex items-center gap-3 bg-gradient-to-b from-[var(--ariome-bg)] via-[var(--ariome-bg)]/80 to-transparent px-3 pb-10 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
            <DialogClose
              onClick={handleClose}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--ariome-text)] transition hover:bg-[var(--ariome-surface)]"
              aria-label="Back"
            >
              <ChevronLeft className="size-7" strokeWidth={1.75} />
            </DialogClose>
            <div className="min-w-0 flex-1">
              <h1 className="ariome-display truncate text-lg font-semibold sm:text-xl">{title}</h1>
              {meta ? <p className="truncate text-xs text-[var(--ariome-text-muted)]">{meta}</p> : null}
            </div>
            {detailsPanel ? (
              <button
                type="button"
                onClick={() => setDetailsOpen((v) => !v)}
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full transition',
                  detailsOpen
                    ? 'bg-[var(--ariome-gold-muted)] text-[var(--ariome-gold)]'
                    : 'text-[var(--ariome-text-muted)] hover:bg-[var(--ariome-surface)]',
                )}
                aria-label="Details"
                aria-expanded={detailsOpen}
              >
                <Info className="size-5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleClose}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--ariome-text-muted)] hover:bg-[var(--ariome-surface)] lg:hidden"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1 bg-black">{children}</div>

          {paywallOverlay}

          <div className="shrink-0 border-t border-[var(--ariome-border)] bg-[var(--ariome-bg-elevated)] px-3 py-4 sm:px-5">
            <p className="ariome-label mb-3">Continue watching</p>
            {bottomRail}
          </div>

          {detailsPanel && detailsOpen ? (
            <div className="absolute inset-x-0 bottom-0 z-50 max-h-[45vh] overflow-y-auto border-t border-[var(--ariome-border)] bg-[var(--ariome-bg-elevated)] px-4 py-4 shadow-[var(--ariome-shadow)] sm:max-h-[50vh]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="ariome-display text-lg font-semibold">Discussion</h2>
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className="rounded-full p-2 text-[var(--ariome-text-faint)] hover:bg-[var(--ariome-surface)]"
                  aria-label="Close details"
                >
                  <X className="size-4" />
                </button>
              </div>
              {detailsPanel}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
