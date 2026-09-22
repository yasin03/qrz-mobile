import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { format, isValid } from "date-fns";
import { Field } from "./field";
import { NativeDatePicker } from "../native-date-picker";

function parseDateValue(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return isValid(value) ? value : undefined;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : undefined;
  }
  return undefined;
}

type FormDatePickerProps<T extends FieldValues = FieldValues> = {
  // react-hook-form modu — ikisi birlikte verilirse Controller kullanılır
  control?: Control<T>;
  name?: FieldPath<T>;

  // standalone mod — control verilmezse bunlar kullanılır
  value?: Date | string | null;
  onChange?: (date: Date) => void;

  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
  vertical?: boolean;
  // form değerinin string olarak saklanma formatı (RHF modunda kullanılır)
  dateFormat?: string;
};

export function FormDatePicker<T extends FieldValues = FieldValues>({
  control,
  name,
  value,
  onChange,
  label,
  placeholder,
  required,
  disabled,
  description,
  className,
  vertical = false,
  dateFormat = "yyyy-MM-dd",
}: FormDatePickerProps<T>) {
  // Mod 1: react-hook-form (control + name verilmiş)
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { value: fieldValue, onChange: fieldOnChange }, fieldState }) => (
          <Field
            label={label}
            required={required}
            description={description}
            error={fieldState.error?.message}
            vertical={vertical}
            className={className}
          >
            <NativeDatePicker
              value={parseDateValue(fieldValue)}
              onChange={(date) => fieldOnChange(format(date, dateFormat))}
              placeholder={placeholder}
              disabled={disabled}
            />
          </Field>
        )}
      />
    );
  }

  // Mod 2: standalone — control verilmemiş, value/onChange direkt kullanılır
  return (
    <Field
      label={label}
      required={required}
      description={description}
      vertical={vertical}
      className={className}
    >
      <NativeDatePicker
        value={parseDateValue(value)}
        onChange={(date) => onChange?.(date)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </Field>
  );
}