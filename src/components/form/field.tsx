import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { View } from "react-native";

type FieldProps = {
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  vertical?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({
  label,
  required,
  description,
  error,
  vertical = false,
  className,
  children,
}: FieldProps) {
  const hasLabel = Boolean(label);

  const labelNode = hasLabel && (
    <Text
      className={cn(
        "text-sm font-medium text-qrz-navy",
        vertical && "w-1/4 shrink-0",
      )}
    >
      {label}
      {required && <Text className="text-red-500"> *</Text>}
    </Text>
  );

  const descriptionNode = description && (
    <Text className="text-xs text-muted-foreground">{description}</Text>
  );

  const errorNode = error && <Text className="text-xs text-red-500">{error}</Text>;

  if (!hasLabel) {
    return (
      <View className={cn("gap-1.5", className)}>
        {descriptionNode}
        {children}
        {errorNode}
      </View>
    );
  }

  if (vertical) {
    return (
      <View className={cn("flex-row items-center gap-3", className)}>
        {labelNode}
        <View className="flex-1 gap-1.5">
          {descriptionNode}
          {children}
          {errorNode}
        </View>
      </View>
    );
  }

  return (
    <View className={cn("gap-1.5", className)}>
      {labelNode}
      {descriptionNode}
      {children}
      {errorNode}
    </View>
  );
}