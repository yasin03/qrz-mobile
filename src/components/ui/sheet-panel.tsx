import type { ReactNode } from "react";
import Animated, { Easing, ReduceMotion, SlideInDown } from "react-native-reanimated";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

// Alttan açılan pencerelerin içerik paneli.
// Modal "fade" ile açılır (karartma tüm ekranda aynı anda belirir), panel ise aşağıdan kayar.
export function SheetPanel({ children, className }: Props) {
  return (
    <Animated.View
      entering={SlideInDown.duration(260)
        .easing(Easing.out(Easing.cubic))
        .reduceMotion(ReduceMotion.System)}
      className={cn("w-full", className)}
    >
      {children}
    </Animated.View>
  );
}
