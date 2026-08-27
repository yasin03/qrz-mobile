import * as React from "react";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  formatValue,
  getKeyboardType,
  getMaxLength,
  InputFormat,
} from "@/lib/input-formatters";

type FormInputProps = React.ComponentProps<typeof Input> & {
  format?: InputFormat;
  value?: string;
  onChangeText?: (value: string) => void;
};

function FormInput({
  format = "text",
  value,
  onChangeText,
  ...props
}: FormInputProps) {
  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText?.(formatValue(format, text));
    },
    [format, onChangeText],
  );

  return (
    <Input
      value={value}
      onChangeText={handleChangeText}
      keyboardType={getKeyboardType(format)}
      maxLength={getMaxLength(format)}
      {...props}
    />
  );
}

export { FormInput };
