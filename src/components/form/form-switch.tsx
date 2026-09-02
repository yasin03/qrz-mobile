import { Switch } from "@/components/ui/switch";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { Field } from "./field";

type FormSwitchProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
  vertical?: boolean;
};

export function FormSwitch<T extends FieldValues>({
  control,
  name,
  label,
  required,
  disabled,
  description,
  className,
  vertical = false,
}: FormSwitchProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState }) => (
        <Field
          label={label}
          required={required}
          description={description}
          error={fieldState.error?.message}
          vertical={vertical}
          className={className}
        >
          <Switch checked={value} onCheckedChange={onChange} disabled={disabled} />
        </Field>
      )}
    />
  );
}