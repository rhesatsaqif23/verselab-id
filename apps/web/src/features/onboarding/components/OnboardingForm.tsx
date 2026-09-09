// OnboardingForm: the 3-field learning-profile wizard (display name, starting
// unit, daily goal). Uses react-hook-form + the shadcn Form primitives.
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Wrench, type LucideIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import { cn } from "#/libs/utils.ts";
import { onboardingSchema } from "@verselab/shared/schemas/profile";
import { DAILY_GOAL_OPTIONS, START_UNIT_OPTIONS } from "../constants.ts";
import { useOnboarding } from "../hook/use-onboarding.ts";

type OnboardingValues = z.infer<typeof onboardingSchema>;

function SelectableCard({
  selected,
  onSelect,
  icon: Icon,
  title,
  subtitle,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border-2 bg-card p-4 text-left outline-none transition-colors",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border hover:border-primary/40",
        className,
      )}
    >
      {Icon && (
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent text-white",
            !selected && "opacity-60",
          )}
        >
          <Icon className="size-5" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-start justify-between gap-2">
          <span className="text-base font-bold text-foreground">{title}</span>
          {selected && <Check className="mt-0.5 size-5 shrink-0 text-primary" />}
        </span>
        {subtitle && (
          <span className="mt-1 text-sm leading-5 text-muted-foreground">{subtitle}</span>
        )}
      </span>
    </button>
  );
}

export function OnboardingForm({ defaultName }: { defaultName?: string }) {
  const { submit, submitting, error } = useOnboarding();
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: defaultName ?? "",
      startUnitId: undefined,
      dailyGoal: undefined,
    },
  });
  const { handleSubmit, watch } = form;
  const values = watch();

  const valid = values.displayName?.trim()
    && values.startUnitId != null
    && values.dailyGoal != null;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel>Nama panggilan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nama kamu"
                  autoComplete="nickname"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startUnitId"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel>Unit awal</FormLabel>
              <div className="grid gap-2">
                {START_UNIT_OPTIONS.map((unit) => (
                  <SelectableCard
                    key={unit.id}
                    selected={field.value === unit.id}
                    onSelect={() => field.onChange(unit.id)}
                    icon={unit.icon}
                    title={unit.title}
                    subtitle={unit.description}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dailyGoal"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel>Target harian</FormLabel>
              <div className="grid gap-2 sm:grid-cols-3">
                {DAILY_GOAL_OPTIONS.map((option) => (
                  <SelectableCard
                    key={option.value}
                    selected={field.value === option.value}
                    onSelect={() => field.onChange(option.value)}
                    title={option.label}
                    subtitle={option.description}
                    className="flex-col items-start"
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="w-full font-bold" disabled={!valid || submitting}>
          {submitting ? <Wrench className="size-4 animate-spin" /> : null}
          Mulai belajar
        </Button>
      </form>
    </Form>
  );
}
