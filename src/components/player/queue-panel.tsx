"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePlayerStore } from "@/stores/player-store";
import type { Track } from "@/types/audio";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface QueuePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QueuePanel({ open, onOpenChange }: QueuePanelProps): React.ReactElement {
  const tracks = usePlayerStore((s) => s.queue.tracks);
  const currentIndex = usePlayerStore((s) => s.queue.currentIndex);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const skipToIndex = usePlayerStore((s) => s.skipToIndex);
  const moveInQueue = usePlayerStore((s) => s.moveInQueue);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromAbsolute = Number(active.id);
    const toAbsolute = Number(over.id);
    if (Number.isNaN(fromAbsolute) || Number.isNaN(toAbsolute)) return;
    // Never move onto the active row — it owns currentIndex.
    const active_idx = Math.max(0, currentIndex);
    if (fromAbsolute === active_idx || toAbsolute === active_idx) return;
    moveInQueue(fromAbsolute, toAbsolute);
  }

  // currentIndex of -1 means no active track; treat slice bounds safely.
  const safeCurrentIndex = currentIndex < 0 ? 0 : currentIndex;
  const history = currentIndex > 0 ? tracks.slice(0, currentIndex) : [];
  const upcoming = currentIndex < 0 ? [] : tracks.slice(safeCurrentIndex);

  function handleClose(): void {
    onOpenChange(false);
  }

  function handleJump(absoluteIndex: number): void {
    void skipToIndex(absoluteIndex);
  }

  function handleRemove(absoluteIndex: number): void {
    removeFromQueue([absoluteIndex]);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface-raised border-border-divider w-[380px] border-l p-0">
        <aside className="flex h-full w-full flex-col">
          <header className="border-border-divider flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-foreground text-base font-bold">Up Next</h2>
              <span className="text-muted-foreground text-xs font-medium">
                {upcoming.length} {upcoming.length === 1 ? "track" : "tracks"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearQueue}
                className="text-muted-foreground hover:text-foreground duration-fast ease-standard rounded px-2 py-1 text-xs font-semibold transition-colors"
              >
                Clear queue
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close queue"
                className="text-muted-foreground hover:bg-surface-sunken flex h-8 w-8 items-center justify-center rounded-lg"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {history.length > 0 ? (
              <div className="border-border-divider border-b">
                <button
                  type="button"
                  onClick={() => setHistoryExpanded((v) => !v)}
                  className="hover:bg-surface-sunken duration-fast ease-standard flex w-full items-center justify-between px-5 py-3 text-left transition-colors"
                >
                  <span className="text-muted-foreground text-[11px] font-bold tracking-[0.08em] uppercase">
                    History · {history.length}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-muted-foreground duration-fast transition-transform ${
                      historyExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {historyExpanded ? (
                  <ul className="pb-2">
                    {history.map((track, i) => (
                      <QueueRow
                        key={`history-${track.id}-${i}`}
                        track={track}
                        isActive={false}
                        onJump={() => handleJump(i)}
                        onRemove={() => handleRemove(i)}
                      />
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {upcoming.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={upcoming.map((_, offset) => String(safeCurrentIndex + offset))}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="py-2">
                    {upcoming.map((track, offset) => {
                      const absoluteIndex = safeCurrentIndex + offset;
                      const isActive = offset === 0 && currentIndex >= 0;
                      return (
                        <SortableQueueRow
                          key={`up-${track.id}-${absoluteIndex}`}
                          id={String(absoluteIndex)}
                          track={track}
                          isActive={isActive}
                          draggable={!isActive}
                          onJump={() => handleJump(absoluteIndex)}
                          onRemove={() => handleRemove(absoluteIndex)}
                        />
                      );
                    })}
                  </ul>
                </SortableContext>
              </DndContext>
            ) : null}

            {tracks.length === 0 ? (
              <div className="text-muted-foreground p-8 text-center">
                <p>Queue is empty</p>
                <p className="mt-1 text-xs">Select a reciter and surah to start listening</p>
              </div>
            ) : null}
          </div>
        </aside>
      </SheetContent>
    </Sheet>
  );
}

interface QueueRowProps {
  track: Track;
  isActive: boolean;
  onJump: () => void;
  onRemove: () => void;
}

function QueueRow({ track, isActive, onJump, onRemove }: QueueRowProps): React.ReactElement {
  return (
    <li className="group/qrow relative">
      <QueueRowBody track={track} isActive={isActive} onJump={onJump} onRemove={onRemove} />
    </li>
  );
}

interface SortableQueueRowProps extends QueueRowProps {
  id: string;
  draggable: boolean;
}

function SortableQueueRow({
  id,
  track,
  isActive,
  draggable,
  onJump,
  onRemove,
}: SortableQueueRowProps): React.ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !draggable,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } as React.CSSProperties;
  return (
    <li ref={setNodeRef} style={style} className="group/qrow relative">
      <QueueRowBody
        track={track}
        isActive={isActive}
        onJump={onJump}
        onRemove={onRemove}
        dragHandle={
          draggable ? (
            <span
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              className="text-muted-foreground hover:text-foreground absolute top-1/2 left-1 flex h-7 w-5 -translate-y-1/2 cursor-grab items-center justify-center rounded-md opacity-0 transition-opacity group-hover/qrow:opacity-100 active:cursor-grabbing"
            >
              <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
                <circle cx="2" cy="2" r="1.25" />
                <circle cx="8" cy="2" r="1.25" />
                <circle cx="2" cy="7" r="1.25" />
                <circle cx="8" cy="7" r="1.25" />
                <circle cx="2" cy="12" r="1.25" />
                <circle cx="8" cy="12" r="1.25" />
              </svg>
            </span>
          ) : null
        }
      />
    </li>
  );
}

interface QueueRowBodyProps extends QueueRowProps {
  dragHandle?: React.ReactNode;
}

function QueueRowBody({
  track,
  isActive,
  onJump,
  onRemove,
  dragHandle,
}: QueueRowBodyProps): React.ReactElement {
  return (
    <>
      {dragHandle}
      <button
        type="button"
        onClick={onJump}
        className={`hover:bg-surface-sunken duration-fast ease-standard flex w-full items-center gap-3 py-3 pr-12 text-left transition-colors ${
          dragHandle ? "pl-8" : "pl-5"
        } ${isActive ? "bg-brand-light" : ""}`}
      >
        <div className="bg-surface-sunken h-10 w-10 shrink-0 overflow-hidden rounded-md">
          {track.artwork ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.artwork} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`truncate text-sm font-semibold ${
              isActive ? "text-brand-main" : "text-foreground"
            }`}
          >
            {track.title}
          </div>
          <div className="text-muted-foreground truncate text-xs">{track.reciterName}</div>
        </div>
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove from queue"
        className="text-muted-foreground hover:text-foreground hover:bg-surface-raised absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/qrow:opacity-100"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </>
  );
}
