"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Link from "next/link";
import { useLeads, moveStage } from "@/lib/leads-store";
import {
  STAGE_META,
  STAGE_TONES,
  pipelineColumns,
  type Stage,
  type Lead,
} from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { Instagram, Youtube, Sparkles } from "lucide-react";

export default function PipelinePage() {
  const { leads, loading } = useLeads();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const columns = useMemo(() => pipelineColumns(), []);

  const byStage = useMemo(() => {
    const map = {} as Record<Stage, Lead[]>;
    for (const stage of columns) map[stage] = [];
    for (const l of leads) (map[l.stage] ?? (map[l.stage] = [])).push(l);
    return map;
  }, [leads, columns]);

  const active = activeId ? leads.find((l) => l.id === activeId) ?? null : null;

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    if (!e.over) return;
    const id = String(e.active.id);
    const stage = e.over.id as Stage;
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.stage === stage) return;
    await moveStage(id, stage);
  };

  return (
    <main className="mx-auto w-full max-w-[1900px] px-4 py-4 sm:px-6 lg:px-8">
      {/* Compact header */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-amber-500/90">
              Outreach CRM
            </span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">
            Agency Acquisition Pipeline
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground/70">
          <Sparkles className="h-3 w-3" />
          <span>
            Live: {leads.length} leads across {columns.length} stages. Drag a card, or use its stage menu.
          </span>
        </div>
      </div>

      {loading ? (
        <BoardGrid>
          {columns.map((stage) => (
            <SkeletonColumn key={stage} stage={stage} />
          ))}
        </BoardGrid>
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <BoardGrid>
            {columns.map((stage) => (
              <KanbanColumn key={stage} stage={stage} leads={byStage[stage] ?? []} />
            ))}
          </BoardGrid>
          <DragOverlay>{active ? <LeadCard lead={active} dragging /> : null}</DragOverlay>
        </DndContext>
      )}
    </main>
  );
}

// Responsive grid: all 12 stages fit on one screen, no horizontal scroll.
function BoardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {children}
    </div>
  );
}

function SkeletonColumn({ stage }: { stage: Stage }) {
  const meta = STAGE_META[stage];
  const tone = STAGE_TONES[meta.tone];
  return (
    <div className="flex w-full flex-col">
      <div className={cn("mb-2 flex items-center justify-between gap-2 rounded-md px-2 py-1.5", tone.bg)}>
        <span className={cn("truncate text-[11px] font-semibold tracking-[0.06em]", tone.fg)}>
          {meta.label}
        </span>
      </div>
      <div className="flex min-h-[80px] flex-col gap-2 rounded-lg border border-border/40 bg-surface-1/30 p-1.5">
        <div className="h-14 animate-pulse rounded-md border border-border/60 bg-surface-2/60" />
      </div>
    </div>
  );
}

function KanbanColumn({ stage, leads }: { stage: Stage; leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const meta = STAGE_META[stage];
  const tone = STAGE_TONES[meta.tone];
  return (
    <div id={stage} className="flex w-full flex-col">
      <div className={cn("mb-2 flex items-center justify-between gap-1.5 rounded-md px-2 py-1.5", tone.bg)}>
        <span className={cn("truncate text-[11px] font-semibold leading-tight tracking-[0.05em]", tone.fg)}>
          {meta.label}
        </span>
        <span className={cn("shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] tabular-nums", tone.chip, tone.fg)}>
          {leads.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[80px] flex-col gap-2 rounded-lg border border-border/40 p-1.5 transition",
          isOver ? "border-border-strong bg-surface-2" : "bg-surface-1/30",
        )}
      >
        {leads.map((l) => (
          <DraggableCard key={l.id} lead={l} />
        ))}
        {leads.length === 0 && (
          <div className="px-1.5 py-2 text-[12px] text-muted-foreground/50">No leads</div>
        )}
      </div>
    </div>
  );
}

function DraggableCard({ lead }: { lead: Lead }) {
  const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({ id: lead.id });
  const style: React.CSSProperties = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : {};
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={cn(isDragging && "opacity-40")}>
      <LeadCard lead={lead} />
    </div>
  );
}

function LeadCard({ lead, dragging }: { lead: Lead; dragging?: boolean }) {
  const tone = STAGE_TONES[STAGE_META[lead.stage].tone];
  const sub = [lead.niche, lead.funnel].filter(Boolean).join(" / ");

  const stopDrag = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation();
  const onMove = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Stage;
    if (next && next !== lead.stage) await moveStage(lead.id, next);
  };

  return (
    <Link
      href={`/leads/${lead.id}`}
      onClick={(e) => dragging && e.preventDefault()}
      className={cn(
        "block rounded-md border border-border/60 p-2 text-[13px] leading-snug shadow-subtle transition hover:border-border-strong",
        dragging && "rotate-1 shadow-2xl",
        tone.bg,
      )}
    >
      <div className="mb-1 flex items-start justify-between gap-1.5">
        <div className="min-w-0 truncate font-semibold text-foreground">
          {lead.name || "Untitled lead"}
        </div>
        <select
          aria-label="Move to stage"
          value={lead.stage}
          onChange={onMove}
          onClick={stopDrag}
          onPointerDown={stopDrag}
          onMouseDown={stopDrag}
          className="h-5 shrink-0 cursor-pointer rounded border border-border/60 bg-black/30 px-1 text-[10px] text-foreground/70 outline-none hover:border-border-strong"
          title="Move to stage"
        >
          {pipelineColumns().map((s) => (
            <option key={s} value={s}>
              {STAGE_META[s].label}
            </option>
          ))}
        </select>
      </div>

      {sub && <div className="truncate font-mono text-[11px] text-muted-foreground">{sub}</div>}

      <div className="mt-1 flex items-center gap-2 text-[11px] tabular-nums text-muted-foreground">
        <span className="font-mono">{formatDate(lead.date)}</span>
        {lead.ig && <Instagram className="h-3 w-3 shrink-0" />}
        {lead.youtube && <Youtube className="h-3 w-3 shrink-0" />}
        {lead.added_by && <span className="ml-auto truncate text-[10px]">by {lead.added_by}</span>}
      </div>
    </Link>
  );
}
