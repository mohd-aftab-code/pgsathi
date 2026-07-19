"use client";

export function MonthFilterInput({
  defaultValue,
  className = "input-base max-w-[170px]",
}: {
  defaultValue: string;
  className?: string;
}) {
  return (
    <input
      type="month"
      name="month"
      defaultValue={defaultValue}
      className={className}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    />
  );
}
