export type LessonStatus = "previous" | "current" | "unlocked";

export type LessonNodePosition = {
  id: string;
  x: number;
  y: number;
  col: number;
  row: number;
};

export type ConnectionLine = {
  fromId: string;
  toId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isCompleted: boolean;
};
