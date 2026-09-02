import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { applyFormat, applyMoneyFormat, formatMoneyDisplay, padMoneyApiValue, type InputFormat } from "@/lib/input-format";
import { Eye, EyeOff } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Pressable, View, type KeyboardTypeOptions } from "react-native";

import { Field } from "./field";

export type FormInputType = "text" | "email" | "password" | "tel" | "url" | "number" | "textarea";

const TYPE_KEYBOARD: Partial<Record<FormInputType, KeyboardTypeOptions>> = {
  email: "email-address",
  tel: "phone-pad",
  url: "url",
  number: "numeric",
};

const FORMAT_KEYBOARD: Partial<Record<InputFormat, KeyboardTypeOptions>> = {
  tcno: "numeric",
  vergino: "numeric",
  tel: "phone-pad",
  number: "numeric",
  money: "decimal-pad",
};

const FORMAT_MAXLENGTH: Partial<Record<InputFormat, number>> = {
  tcno: 11,
  vergino: 10,
  tel: 13,
};

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  type?: FormInputType;
  format?: InputFormat;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
  maxLength?: number;
  vertical?: boolean;
};

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  format,
  required,
  disabled,
  description,
  className,
  maxLength,
  vertical = false,
}: FormInputProps<T>) {
  const isPassword = type === "password";
  const isMoney = format === "money";
  const isTextarea = type === "textarea";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState }) => {
        const content = isMoney ? (
          <MoneyInput
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
          />
        ) : (
          <View className="relative">
            <Input
              value={value ?? ""}
              onChangeText={(text) => {
                const next = format ? applyFormat(text, format) : text;
                onChange(next);
              }}
              onBlur={onBlur}
              placeholder={placeholder}
              editable={!disabled}
              secureTextEntry={isPassword && !showPassword}
              multiline={isTextarea}
              numberOfLines={isTextarea ? 4 : undefined}
              keyboardType={FORMAT_KEYBOARD[format!] ?? TYPE_KEYBOARD[type]}
              maxLength={FORMAT_MAXLENGTH[format!] ?? maxLength}
              className={cn(isPassword && "pr-10", isTextarea && "h-24 py-2")}
            />
            {isPassword && (
              <Pressable
                onPress={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Icon as={showPassword ? EyeOff : Eye} className="text-muted-foreground size-4" />
              </Pressable>
            )}
          </View>
        );

        return (
          <Field
            label={label}
            required={required}
            description={description}
            error={fieldState.error?.message}
            vertical={vertical}
            className={className}
          >
            {content}
          </Field>
        );
      }}
    />
  );
}

// Money alanı: ekranda Türkçe formatlı ("1.250,50"), form değeri API formatında ("1250.50")
function MoneyInput({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [text, setText] = useState(() => formatMoneyDisplay(value));
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setText(formatMoneyDisplay(value));
      lastEmitted.current = value;
    }
  }, [value]);

  return (
    <Input
      value={text}
      onChangeText={(raw) => {
        const { display, api } = applyMoneyFormat(raw);
        setText(display);
        lastEmitted.current = api;
        onChange(api);
      }}
      onBlur={() => {
        const padded = padMoneyApiValue(lastEmitted.current ?? "");
        lastEmitted.current = padded;
        onChange(padded);
        setText(formatMoneyDisplay(padded));
        onBlur();
      }}
      keyboardType="decimal-pad"
      placeholder={placeholder ?? "0,00"}
      editable={!disabled}
    />
  );
}