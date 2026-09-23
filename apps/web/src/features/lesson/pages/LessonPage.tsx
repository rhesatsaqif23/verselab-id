// LessonPage: wires a lesson's screens to the player and awards progress on completion.
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import LessonPlayer, { type AnswerResult } from "#/engine/player/LessonPlayer.tsx";
import { useLessonStore } from "#/engine/player/lessonStore.ts";
import { XP_PER_LESSON, XP_PER_SCREEN, useProgressStore } from "#/engine/progress/progressStore.ts";
import { useLessonCompleteStore } from "#/features/lesson-complete/store/lessonCompleteStore.ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog.tsx";
import { checkAnswer } from "../hooks/checkAnswer.ts";
import { renderScreen } from "../components/renderScreen.tsx";
import type { LessonWithUnit } from "#/libs/content-fns.ts";

type LessonPageProps = {
  lessonId: string;
  lesson?: LessonWithUnit;
};

export default function LessonPage({ lessonId, lesson: lessonProp }: LessonPageProps) {
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = useState(false);

  const found = lessonProp;

  if (!found) {
    return (
      <div className="page-wrap flex min-h-screen items-center justify-center px-4">
        <p className="text-lg text-muted">Lesson tidak ditemukan</p>
      </div>
    );
  }

  const lesson = found;
  const unitId = found.unitId;
  const unitSlug = found.unitSlug;
  const unitTitle = found.unitTitle;
  const results = useLessonStore((s) => s.results);
  const xpEarned = Object.values(results)
    .filter((r) => r?.correct)
    .reduce((sum) => sum + XP_PER_SCREEN, 0);

  function handleExit() {
    setShowExitDialog(true);
  }

  function confirmExit() {
    useLessonStore.getState().clear();
    navigate({ to: "/home" });
  }

  function handleComplete(results: readonly AnswerResult[]) {
    const answerResults = results.filter((r) => r.screen.type !== "concept");

    const correctCount = answerResults.filter((r) => r.correct).length;
    const wrongScreens = answerResults
      .filter((r) => !r.correct)
      .map((r) => ({ prompt: r.screen.prompt, explain: r.screen.explain }));

    const masteryBefore = useProgressStore.getState().mastery[unitId] ?? null;
    for (const result of answerResults) {
      useProgressStore.getState().awardScreenResult(unitId, result.correct);
    }
    useProgressStore.getState().awardLessonCompletion(unitId, lessonId);
    const masteryAfter = useProgressStore.getState().mastery[unitId] ?? null;

    const totalXpEarned = correctCount * XP_PER_SCREEN + XP_PER_LESSON;

    useLessonCompleteStore.getState().setSummary({
      unitId,
      unitSlug,
      unitName: unitTitle,
      totalScreens: answerResults.length,
      correctCount,
      wrongScreens,
      xpEarned: totalXpEarned,
      masteryBefore,
      masteryAfter,
    });
    navigate({ to: "/lesson-complete" });
  }

  return (
    <>
      <LessonPlayer
        screens={lesson.screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={handleExit}
        onComplete={handleComplete}
        xpEarned={xpEarned}
      />

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              Progress belajar saat ini tidak akan tersimpan. Kamu bisa mengulang dari awal kapan
              saja.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Lanjut Belajar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit}>Keluar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
