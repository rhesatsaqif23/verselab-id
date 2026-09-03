// lessonLayout: pure functions that derive canvas node positions and connection lines from lesson data.
import type { LessonNodePosition, ConnectionLine } from "./types.ts";

/** Card dimensions used for positioning and connection anchor math. */
export const CARD_WIDTH = 340;
export const CARD_HEIGHT = 180;

const HORIZONTAL_GAP = 90;
const VERTICAL_STEP = 110;

/**
 * Maps each lesson to an absolute (x, y) position on the canvas using a
 * simple alternating-row zig-zag pattern.
 */
export function buildNodes(lessonIds: string[]): LessonNodePosition[] {
  return lessonIds.map((id, idx) => ({
    id,
    x: idx * (CARD_WIDTH + HORIZONTAL_GAP),
    y: (idx % 2) * VERTICAL_STEP,
    col: idx,
    row: idx % 2,
  }));
}

/**
 * Derives the connector lines between sequential lesson nodes.
 * Each connection carries its completion state for styling.
 */
export function buildConnections(
  nodes: LessonNodePosition[],
  completedLessonIds: string[],
): ConnectionLine[] {
  const connections: ConnectionLine[] = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i];
    const to = nodes[i + 1];
    if (!from || !to) continue;

    connections.push({
      fromId: from.id,
      toId: to.id,
      fromX: from.x + CARD_WIDTH,
      fromY: from.y + CARD_HEIGHT / 2,
      toX: to.x,
      toY: to.y + CARD_HEIGHT / 2,
      isCompleted: completedLessonIds.includes(from.id),
    });
  }

  return connections;
}
