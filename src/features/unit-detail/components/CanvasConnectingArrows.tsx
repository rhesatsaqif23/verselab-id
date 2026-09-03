// CanvasConnectingArrows: renders dashed elbow/angled lines with arrowheads between cards.
import type { ConnectionLine } from "../types.ts";

type CanvasConnectingArrowsProps = {
  connections: ConnectionLine[];
};

export default function CanvasConnectingArrows({ connections }: CanvasConnectingArrowsProps) {
  return (
    <svg className="pointer-events-none absolute inset-0 overflow-visible h-full w-full">
      <defs>
        {/* Completed arrow marker */}
        <marker
          id="arrowhead-completed"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <polygon points="0 1, 7 4, 0 7" className="fill-primary" fillOpacity={1} />
        </marker>

        {/* Pending arrow marker */}
        <marker
          id="arrowhead-pending"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <polygon points="0 1, 7 4, 0 7" className="fill-muted-foreground" />
        </marker>
      </defs>

      {connections.map((c) => {
        // Build an elbow/stepped path between from (right or bottom) to target (left or top)
        const dx = c.toX - c.fromX;
        const dy = c.toY - c.fromY;

        let pathData = "";

        if (Math.abs(dy) < 30) {
          // Horizontal straight connection
          pathData = `M ${c.fromX} ${c.fromY} L ${c.toX} ${c.toY}`;
        } else if (dx > 0) {
          // Stepped horizontal-then-vertical-then-horizontal
          const midX = c.fromX + dx / 2;
          pathData = `M ${c.fromX} ${c.fromY} L ${midX} ${c.fromY} L ${midX} ${c.toY} L ${c.toX} ${c.toY}`;
        } else {
          // Backward / wrap step connection
          const exitX = c.fromX + 40;
          const entryX = c.toX - 40;
          const midY = c.fromY + dy / 2;
          pathData = `M ${c.fromX} ${c.fromY} L ${exitX} ${c.fromY} L ${exitX} ${midY} L ${entryX} ${midY} L ${entryX} ${c.toY} L ${c.toX} ${c.toY}`;
        }

        return (
          <path
            key={`${c.fromId}->${c.toId}`}
            d={pathData}
            fill="none"
            stroke={c.isCompleted ? "var(--color-primary)" : "var(--color-muted)"}
            strokeWidth="3"
            strokeDasharray={c.isCompleted ? "none" : "8,6"}
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd={c.isCompleted ? "url(#arrowhead-completed)" : "url(#arrowhead-pending)"}
          />
        );
      })}
    </svg>
  );
}
