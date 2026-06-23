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
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-30" />
        <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-brand/10 via-brand/5 to-transparent" />
        <div className="relative px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-amber-500/90">
              OUTREACH CRM
            </span>
          </div>
          <h1 className="text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[2.5rem]">
            Agency Acquisition Pipeline
          </h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
            Drag cards across stages to move leads through the funnel. New leads
            land in Possible Clients automatically. On mobile, use the stage menu
            on each card to move it without dragging.
          </p>
          <div className="mt-5 flex items-center gap-1.5 text-[13px] text-muted-foreground/70">
            <Sparkles className="h-3 w-3" />
            <span>
              Live: {leads.length} leads across {columns.length} stages
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-none px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {loading ? (
          <LoadingBoard columns={columns} />
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            {/* Horizontally scrollable row of fixed-width columns. */}
            <div className="flex gap-3 overflow-x-auto pb-8">
              {columns.map((stage) => (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  leads={byStage[stage] ?? []}
                />
              ))}
            </div>
            <DragOverlay>
              {active ? <LeadCard lead={active} dragging /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>
    </>
  );
}

function LoadingBoard({ columns }: { columns: Stage[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-8">
      {columns.map((stage) => {
        const meta = STAGE_META[stage];
        const tone = STAGE_TONES[meta.tone];
        return (
          <div key={stage} className="flex w-[260px] shrink-0 flex-col sm:w-[280px]">
            <div
              className={cn(
                "mb-2 flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5",
                tone.bg,
              )}
            >
              <span
                className={cn(
                  "text-[13px] font-semibold leading-snug tracking-[0.1em]",
                  tone.fg,
                )}
              >
                {meta.label}
              </span>
            </div>
            <div className="flex min-h-[120px] flex-col gap-2 rounded-lg border border-border/40 bg-surface-1/30 p-1.5">
              <div className="h-16 animate-pulse rounded-md border border-border/60 bg-surface-2/60" />
              <div className="h-16 animate-pulse rounded-md border border-border/60 bg-surface-2/40" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanColumn({ stage, leads }: { stage: Stage; leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const meta = STAGE_META[stage];
  const tone = STAGE_TONES[meta.tone];
  return (
    <div id={stage} className="flex w-[260px] shrink-0 flex-col sm:w-[280px]">
      <div
        className={cn(
          "mb-2 flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5",
          tone.bg,
        )}
      >
        <span
          className={cn(
            "text-[13px] font-semibold leading-snug tracking-[0.1em]",
            tone.fg,
          )}
        >
          {meta.label}
        </span>
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 font-mono text-[12px] tabular-nums",
            tone.chip,
            tone.fg,
          )}
        >
          {leads.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-col gap-2 rounded-lg border border-border/40 p-1.5 transition",
          isOver ? "border-border-strong bg-surface-2" : "bg-surface-1/30",
        )}
      >
        {leads.map((l) => (
          <DraggableCard key={l.id} lead={l} />
        ))}
        {leads.length === 0 && (
          <div className="px-2 py-3 text-[13px] text-muted-foreground/60">
            No leads
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableCard({ lead }: { lead: Lead }) {
  const { setNodeRef, listeners, attributes, transform, isDragging } =
    useDraggable({ id: lead.id });
  const style: React.CSSProperties = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : {};
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(isDragging && "opacity-40")}
    >
      <LeadCard lead={lead} />
    </div>
  );
}

function LeadCard({ lead, dragging }: { lead: Lead; dragging?: boolean }) {
  const tone = STAGE_TONES[STAGE_META[lead.stage].tone];
  const sub = [lead.niche, lead.funnel].filter(Boolean).join(" · ");

  // The fallback move menu must not start a drag or trigger card navigation.
  const stopDrag = (e: React.PointerEvent | React.MouseEvent) =>
    e.stopPropagation();
  const onMove = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Stage;
    if (next && next !== lead.stage) await moveStage(lead.id, next);
  };

  return (
    <Link
      href={`/leads/${lead.id}`}
      onClick={(e) => dragging && e.preventDefault()}
      className={cn(
        "block rounded-md border border-border/60 p-2.5 text-[14px] leading-snug shadow-subtle transition hover:border-border-strong",
        dragging && "rotate-1 shadow-2xl",
        tone.bg,
      )}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="font-semibold text-foreground">
          {lead.name || "Untitled lead"}
        </div>
        {/* Lightweight move affordance — keyboard/touch friendly drag fallback. */}
        <select
          aria-label="Move to stage"
          value={lead.stage}
          onChange={onMove}
          onClick={stopDrag}
          onPointerDown={stopDrag}
          onMouseDown={stopDrag}
          className="shrink-0 rounded border border-border/60 bg-black/20 px-1 py-0.5 font-mono text-[11px] tabular-nums text-foreground/80 outline-none transition hover:border-border-strong focus:border-border-strong"
        >
          {pipelineColumns().map((s) => (
            <option key={s} value={s}>
              {STAGE_META[s].label}
            </option>
          ))}
        </select>
      </div>

      {sub && (
        <div className="font-mono text-[12px] text-muted-foreground">{sub}</div>
      )}

      <div className="mt-1 flex items-center gap-2 text-[12px] tabular-nums text-muted-foreground">
        <span className="font-mono">{formatDate(lead.date)}</span>
        {lead.ig && (
          <span className="inline-flex items-center gap-1 text-muted-foreground/90">
            <Instagram className="h-3 w-3 shrink-0" />
            IG
          </span>
        )}
        {lead.youtube && (
          <span className="inline-flex items-center gap-1 text-muted-foreground/90">
            <Youtube className="h-3 w-3 shrink-0" />
            YT
          </span>
        )}
      </div>
    </Link>
  );
}
