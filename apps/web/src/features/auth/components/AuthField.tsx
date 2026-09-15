// AuthField: reusable controlled text field for auth forms (email, password).
// Composed from shadcn Form primitives + Input; renders label, field, and
// inline validation message from react-hook-form errors.
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "#/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "#/components/ui/form";
import { Input } from "#/components/ui/input";

export function AuthField({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const form = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1.5">
          <FormLabel>{label}</FormLabel>
          <div className="relative flex items-center">
            <FormControl>
              <Input
                type={inputType}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                className={isPassword ? "pr-10" : undefined}
                {...field}
              />
            </FormControl>
            {isPassword && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword((prev) => !prev);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                disabled={disabled}
                className="absolute right-1 z-10 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? (
                  <Eye className="size-4 shrink-0" />
                ) : (
                  <EyeOff className="size-4 shrink-0" />
                )}
              </Button>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
