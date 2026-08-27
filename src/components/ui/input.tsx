import * as React from "react";
import { View, TextInput, Platform } from "react-native";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<typeof TextInput> & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  containerClassName?: string;
};

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, containerClassName, startIcon, endIcon, editable, ...props }, ref) => {
    return (
      <View
        className={cn(
          "border-input bg-background dark:bg-input/30 h-10 w-full flex-row items-center rounded-md border px-3 shadow-sm shadow-black/5 sm:h-9",
          editable === false && "opacity-50",
          containerClassName
        )}
      >
        {startIcon ? <View className="mr-2">{startIcon}</View> : null}

        <TextInput
          ref={ref}
          editable={editable}
          className={cn(
            "text-foreground flex-1 text-base leading-5",
            "placeholder:text-muted-foreground/50",
            Platform.select({
              web: "outline-none placeholder:text-muted-foreground md:text-sm",
              native: "",
            }),
            className
          )}
          {...props}
        />

        {endIcon ? <View className="ml-2">{endIcon}</View> : null}
      </View>
    );
  }
);
Input.displayName = "Input";

export { Input };