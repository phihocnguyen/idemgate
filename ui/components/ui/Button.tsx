import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "outline" | "ghost";

type Props = ComponentPropsWithoutRef<"a"> & {
  variant?: Variant;
};

const styles: Record<Variant, string> = {
  primary:
    "border border-primary bg-primary text-on-primary hover:bg-ink-hover hover:text-on-primary",
  outline: "border border-hairline bg-transparent text-ink hover:border-body-mid hover:text-ink-hover",
  ghost: "border border-transparent bg-transparent text-body hover:text-ink",
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <a
      className={[
        "inline-flex items-center justify-center rounded-pill px-5 py-2.5 text-button-md transition-colors duration-200",
        styles[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
