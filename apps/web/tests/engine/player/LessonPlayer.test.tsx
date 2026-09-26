// Interaction tests for the lesson player flow.
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LessonPlayer from "#/engine/player/LessonPlayer.tsx";
import { useLessonStore } from "#/engine/player/lessonStore.ts";
import type { Screen } from "#/engine/types.ts";

const screens: Screen[] = [
  {
    type: "choice",
    prompt: "Pertanyaan pertama",
    options: [
      { id: "a", label: "Opsi A" },
      { id: "b", label: "Opsi B" },
    ],
    correctId: "a",
    explain: "Karena A benar.",
  },
  {
    type: "choice",
    prompt: "Pertanyaan kedua",
    options: [
      { id: "a", label: "Opsi C" },
      { id: "b", label: "Opsi D" },
    ],
    correctId: "b",
    explain: "Karena D benar.",
  },
];

function renderScreen(screen: Screen, onChange: (answer: unknown) => void): React.ReactNode {
  return (
    <div>
      <p>{screen.type === "choice" ? screen.prompt : ""}</p>
      {screen.type === "choice" &&
        screen.options.map((option) => (
          <button key={option.id} onClick={() => onChange(option.id)}>
            {option.label}
          </button>
        ))}
    </div>
  );
}

function checkAnswer(screen: Screen, answer: unknown): boolean {
  return screen.type === "choice" && answer === screen.correctId;
}

function checkMixedAnswer(screen: Screen, answer: unknown): boolean {
  switch (screen.type) {
    case "choice":
      return answer === screen.correctId;
    case "numeric":
      return (
        typeof answer === "number" &&
        answer >= screen.acceptRange[0] &&
        answer <= screen.acceptRange[1]
      );
    default:
      return false;
  }
}

const mixedScreens: Screen[] = [
  {
    type: "choice",
    prompt: "Pertanyaan pilihan",
    options: [
      { id: "a", label: "Opsi A" },
      { id: "b", label: "Opsi B" },
    ],
    correctId: "a",
    explain: "Karena A benar.",
  },
  {
    type: "concept",
    prompt: "Ini konsep yang dijelaskan.",
    explain: "Konsep tidak perlu dijawab.",
  },
  {
    type: "numeric",
    prompt: "Berapa 2 tambah 3?",
    unit: "angka",
    acceptRange: [4, 6],
    explain: "Karena 2 + 3 = 5.",
  },
];

function renderMixedScreen(screen: Screen, onChange: (answer: unknown) => void): React.ReactNode {
  switch (screen.type) {
    case "choice":
      return (
        <div>
          <p>{screen.prompt}</p>
          {screen.options.map((option) => (
            <button key={option.id} onClick={() => onChange(option.id)}>
              {option.label}
            </button>
          ))}
        </div>
      );
    case "concept":
      return <p>{screen.prompt}</p>;
    case "numeric":
      return (
        <div>
          <p>{screen.prompt}</p>
          <button onClick={() => onChange(5)}>Jawab 5</button>
        </div>
      );
    default:
      return null;
  }
}

describe("LessonPlayer", () => {
  beforeEach(() => {
    useLessonStore.getState().clear();
  });

  it("shows 1 / N and a progress bar at start", () => {
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={() => {}}
        xpEarned={0}
      />,
    );
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("starts with the Cek Jawaban button disabled", () => {
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={() => {}}
        xpEarned={0}
      />,
    );
    expect(screen.getByRole("button", { name: /cek jawaban/i })).toBeDisabled();
  });

  it("enables Cek Jawaban after an answer is selected", async () => {
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={() => {}}
        xpEarned={0}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /opsi a/i }));
    expect(screen.getByRole("button", { name: /cek jawaban/i })).toBeEnabled();
  });

  it("opens the explain dialog with explain text after Cek Jawaban", async () => {
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={() => {}}
        xpEarned={0}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /opsi a/i }));
    await user.click(screen.getByRole("button", { name: /cek jawaban/i }));
    await user.click(screen.getByRole("button", { name: /kenapa/i }));
    expect(screen.getByText(/karena a benar/i)).toBeInTheDocument();
  });

  it("switches the button to Lanjut in the same position after Cek Jawaban", async () => {
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={() => {}}
        xpEarned={0}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /opsi a/i }));
    await user.click(screen.getByRole("button", { name: /cek jawaban/i }));
    expect(screen.getByRole("button", { name: /lanjut/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cek jawaban/i })).not.toBeInTheDocument();
  });

  it("advances to the next screen on Lanjut", async () => {
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={() => {}}
        xpEarned={0}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /opsi a/i }));
    await user.click(screen.getByRole("button", { name: /cek jawaban/i }));
    await user.click(screen.getByRole("button", { name: /lanjut/i }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByText("Pertanyaan kedua")).toBeInTheDocument();
  });

  it("calls onComplete with results on the last screen", async () => {
    const onComplete = vi.fn();
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={onComplete}
        xpEarned={0}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /opsi a/i }));
    await user.click(screen.getByRole("button", { name: /cek jawaban/i }));
    await user.click(screen.getByRole("button", { name: /lanjut/i }));

    await user.click(screen.getByRole("button", { name: /opsi c/i }));
    await user.click(screen.getByRole("button", { name: /cek jawaban/i }));
    await user.click(screen.getByRole("button", { name: /lanjut/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ correct: true }),
        expect.objectContaining({ correct: false }),
      ]),
    );
  });

  it("calls onExit when the exit button is clicked", async () => {
    const onExit = vi.fn();
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={onExit}
        onComplete={() => {}}
        xpEarned={0}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /keluar/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});

describe("LessonPlayer mixed lesson (choice + concept + numeric)", () => {
  beforeEach(() => {
    useLessonStore.getState().clear();
  });

  it("excludes the concept screen from the onComplete payload", async () => {
    const onComplete = vi.fn();
    render(
      <LessonPlayer
        screens={mixedScreens}
        renderScreen={renderMixedScreen}
        checkAnswer={checkMixedAnswer}
        onExit={() => {}}
        onComplete={onComplete}
        xpEarned={0}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /opsi a/i }));
    await user.click(screen.getByRole("button", { name: /cek jawaban/i }));
    await user.click(screen.getByRole("button", { name: /lanjut/i }));

    await user.click(screen.getByRole("button", { name: /lanjut/i }));

    await user.click(screen.getByRole("button", { name: /jawab 5/i }));
    await user.click(screen.getByRole("button", { name: /cek jawaban/i }));
    await user.click(screen.getByRole("button", { name: /lanjut/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    const payload = onComplete.mock.calls[0][0];
    expect(payload).toHaveLength(2);
    expect(payload.map((r: { screen: Screen }) => r.screen.type).sort()).toEqual([
      "choice",
      "numeric",
    ]);
    expect(payload.some((r: { screen: Screen }) => r.screen.type === "concept")).toBe(false);
  });

  it("keeps the concept screen out of the wrong-result list", async () => {
    const onComplete = vi.fn();
    render(
      <LessonPlayer
        screens={mixedScreens}
        renderScreen={renderMixedScreen}
        checkAnswer={checkMixedAnswer}
        onExit={() => {}}
        onComplete={onComplete}
        xpEarned={0}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /opsi b/i }));
    await user.click(screen.getByRole("button", { name: /cek jawaban/i }));
    await user.click(screen.getByRole("button", { name: /lanjut/i }));

    await user.click(screen.getByRole("button", { name: /lanjut/i }));

    await user.click(screen.getByRole("button", { name: /jawab 5/i }));
    await user.click(screen.getByRole("button", { name: /cek jawaban/i }));
    await user.click(screen.getByRole("button", { name: /lanjut/i }));

    const payload = onComplete.mock.calls[0][0];
    const wrong = payload.filter((r: { correct: boolean }) => r.correct === false);
    expect(wrong).toHaveLength(1);
    expect(wrong[0].screen.type).toBe("choice");
  });
});
