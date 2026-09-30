// LessonTrackScrollbar: presentational custom scrollbar for the materi lesson
// track. Always visible while the track overflows, since native bars auto-hide
// on some platforms. Grey, bold, full width. All behavior comes from props.
type LessonTrackScrollbarProps = {
  barRef: React.RefObject<HTMLDivElement | null>;
  progress: number;
  thumbWidthPct: number;
  thumbLeftPct: number;
  onBarClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onBarKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onThumbPointerDown: (e: React.PointerEvent) => void;
  onThumbPointerMove: (e: React.PointerEvent) => void;
  onThumbPointerUp: () => void;
};

export default function LessonTrackScrollbar({
  barRef,
  progress,
  thumbWidthPct,
  thumbLeftPct,
  onBarClick,
  onBarKeyDown,
  onThumbPointerDown,
  onThumbPointerMove,
  onThumbPointerUp,
}: LessonTrackScrollbarProps) {
  return (
    <div
      ref={barRef}
      data-testid="lesson-scrollbar"
      role="scrollbar"
      aria-orientation="horizontal"
      aria-label="Geser daftar lesson"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={0}
      onClick={onBarClick}
      onKeyDown={onBarKeyDown}
      className="relative mt-3 h-2.5 w-full cursor-pointer rounded-full bg-input outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        data-testid="lesson-scrollbar-thumb"
        onPointerDown={onThumbPointerDown}
        onPointerMove={onThumbPointerMove}
        onPointerUp={onThumbPointerUp}
        onPointerCancel={onThumbPointerUp}
        className="absolute top-0 h-full min-w-12 cursor-grab rounded-full bg-muted active:cursor-grabbing"
        style={{ width: `${thumbWidthPct}%`, left: `${thumbLeftPct}%` }}
      />
    </div>
  );
}
