import { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react-native";
import {
  addDays,
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { tr } from "date-fns/locale";

import { SheetPanel } from "@/components/ui/sheet-panel";
import { cn } from "@/lib/utils";

type NavigatorMode = "day" | "month";

/** Ay/yıl ile çalışan ekranlar için yardımcı tip (ay: 1..12). */
export type Donem = { yil: number; ay: number };

/** { yil: 2026, ay: 10 } → "2026-10" (mode="month" value'su) */
export const donemToValue = (donem: Donem) =>
  `${donem.yil}-${String(donem.ay).padStart(2, "0")}`;

/** "2026-10" → { yil: 2026, ay: 10 } */
export const valueToDonem = (value: string): Donem => {
  const [yil, ay] = value.split("-").map(Number);
  return { yil, ay };
};

export const buAy = (): Donem => {
  const now = new Date();
  return { yil: now.getFullYear(), ay: now.getMonth() + 1 };
};

const MODE_CONFIG: Record<
  NavigatorMode,
  {
    valueFormat: string;
    displayFormat: string;
    step: (date: Date, amount: number) => Date;
    jump: (date: Date, amount: number) => Date;
    stepLabel: [string, string];
    jumpLabel: [string, string];
    pickerTitle: string;
  }
> = {
  day: {
    valueFormat: "yyyy-MM-dd",
    displayFormat: "d MMMM yyyy, EEE",
    step: addDays,
    jump: addMonths,
    stepLabel: ["Önceki gün", "Sonraki gün"],
    jumpLabel: ["Önceki ay", "Sonraki ay"],
    pickerTitle: "Tarih Seç",
  },
  month: {
    valueFormat: "yyyy-MM",
    displayFormat: "MMMM yyyy",
    step: addMonths,
    jump: addYears,
    stepLabel: ["Önceki ay", "Sonraki ay"],
    jumpLabel: ["Önceki yıl", "Sonraki yıl"],
    pickerTitle: "Dönem Seç",
  },
};

const ICON_COLOR = "#0f172a";

type CustomDateNavigatorProps = {
  /**
   * - `"day"`   (default): "yyyy-MM-dd" — ‹ › gün, « » ay atlar, takvim açılır
   * - `"month"`: "yyyy-MM"    — ‹ › ay, « » yıl atlar, ay seçici açılır
   */
  mode?: NavigatorMode;
  /** mode="day" → "yyyy-MM-dd", mode="month" → "yyyy-MM" */
  value: string;
  onChange: (value: string) => void;
  /** Ortadaki tarih yazısı formatı. Default: day → "d MMMM yyyy, EEE", month → "MMMM yyyy" */
  displayFormat?: string;
  /** Tarihin altında gösterilecek bilgi (ör. bölüm adı) */
  subtitle?: string | null;
  /** Dıştaki « » atlama butonlarını göster (day: ay, month: yıl). Default: true */
  showJumpButtons?: boolean;
  disabled?: boolean;
  className?: string;
};

/**
 * Tarih gezgini — web'deki CustomDateNavigator ile aynı API.
 *
 *   « ‹   12 Ekim 2026, Pzt ⌄   › »     mode="day"
 *   « ‹       Ekim 2026 ⌄       › »     mode="month"
 *
 * Ortadaki yazıya basınca alttan takvim / ay seçici açılır.
 * Ay atlarken ay sonu taşarsa ayın son gününe oturur (31 Oca → 28 Şub).
 *
 *   <CustomDateNavigator value={tarih} onChange={setTarih} />
 *   <CustomDateNavigator
 *     mode="month"
 *     value={donemToValue(donem)}
 *     onChange={(v) => setDonem(valueToDonem(v))}
 *   />
 */
export function CustomDateNavigator({
  mode = "day",
  value,
  onChange,
  displayFormat,
  subtitle,
  showJumpButtons = true,
  disabled = false,
  className,
}: CustomDateNavigatorProps) {
  const config = MODE_CONFIG[mode];
  const [pickerOpen, setPickerOpen] = useState(false);

  const parsed = parse(value, config.valueFormat, new Date());
  const date = isValid(parsed) ? parsed : new Date();

  const go = (next: Date) => onChange(format(next, config.valueFormat));

  const navButton = (
    label: string,
    onPress: () => void,
    Icon: typeof ChevronLeft,
    small = false,
  ) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityLabel={label}
      className={cn(
        "items-center justify-center rounded-full bg-slate-100 active:bg-slate-200",
        small ? "h-8 w-8" : "h-9 w-9",
        disabled && "opacity-50",
      )}
    >
      <Icon size={small ? 16 : 20} color={ICON_COLOR} />
    </Pressable>
  );

  return (
    <>
      <View
        className={cn(
          "flex-row items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white p-3",
          className,
        )}
      >
        <View className="flex-row items-center gap-1.5">
          {showJumpButtons &&
            navButton(
              config.jumpLabel[0],
              () => go(config.jump(date, -1)),
              ChevronsLeft,
              true,
            )}
          {navButton(
            config.stepLabel[0],
            () => go(config.step(date, -1)),
            ChevronLeft,
          )}
        </View>

        <Pressable
          onPress={() => setPickerOpen(true)}
          disabled={disabled}
          accessibilityLabel={config.pickerTitle}
          className="flex-1 items-center rounded-xl px-2 py-1 active:bg-slate-100"
        >
          <View className="flex-row items-center gap-1">
            <Text
              className="text-base font-bold text-qrz-navy"
              numberOfLines={1}
            >
              {format(date, displayFormat ?? config.displayFormat, {
                locale: tr,
              })}
            </Text>
            <ChevronDown size={16} color="#052346" />
          </View>
          {subtitle ? (
            <Text className="text-xs text-slate-500" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </Pressable>

        <View className="flex-row items-center gap-1.5">
          {navButton(
            config.stepLabel[1],
            () => go(config.step(date, 1)),
            ChevronRight,
          )}
          {showJumpButtons &&
            navButton(
              config.jumpLabel[1],
              () => go(config.jump(date, 1)),
              ChevronsRight,
              true,
            )}
        </View>
      </View>

      <PickerSheet
        visible={pickerOpen}
        title={config.pickerTitle}
        todayLabel={mode === "day" ? "Bugün" : "Bu Ay"}
        onClose={() => setPickerOpen(false)}
        onToday={() => {
          go(new Date());
          setPickerOpen(false);
        }}
      >
        {mode === "day" ? (
          <DayGrid
            value={date}
            onSelect={(d) => {
              go(d);
              setPickerOpen(false);
            }}
          />
        ) : (
          <MonthGrid
            value={date}
            onSelect={(d) => {
              go(d);
              setPickerOpen(false);
            }}
          />
        )}
      </PickerSheet>
    </>
  );
}

// ---- Alttan açılan seçici kabuğu --------------------------------------------

function PickerSheet({
  visible,
  title,
  todayLabel,
  onClose,
  onToday,
  children,
}: {
  visible: boolean;
  title: string;
  todayLabel: string;
  onClose: () => void;
  onToday: () => void;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <SheetPanel>
          {/* İçeriğe basınca kapanmasın */}
          <Pressable
            onPress={() => {}}
            className="rounded-t-3xl bg-white px-5 pt-5"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-base font-bold text-qrz-navy">{title}</Text>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
              >
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            {children}

            <Pressable
              onPress={onToday}
              className="mt-3 items-center rounded-xl border border-slate-200 py-3 active:bg-slate-50"
            >
              <Text className="font-medium text-slate-700">{todayLabel}</Text>
            </Pressable>
          </Pressable>
        </SheetPanel>
      </Pressable>
    </Modal>
  );
}

function GridHeader({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Pressable
        onPress={onPrev}
        hitSlop={8}
        className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
      >
        <ChevronLeft size={18} color={ICON_COLOR} />
      </Pressable>
      <Text className="text-base font-semibold capitalize text-slate-800">
        {label}
      </Text>
      <Pressable
        onPress={onNext}
        hitSlop={8}
        className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
      >
        <ChevronRight size={18} color={ICON_COLOR} />
      </Pressable>
    </View>
  );
}

// ---- mode="month": yıl gezintisi + 12 aylık grid ----------------------------

function MonthGrid({
  value,
  onSelect,
}: {
  value: Date;
  onSelect: (date: Date) => void;
}) {
  // Modal içeriği her açılışta yeniden mount olur → yıl seçili değerden başlar
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const now = new Date();

  return (
    <View>
      <GridHeader
        label={String(viewYear)}
        onPrev={() => setViewYear((y) => y - 1)}
        onNext={() => setViewYear((y) => y + 1)}
      />
      <View className="flex-row flex-wrap justify-between">
        {Array.from({ length: 12 }, (_, month) => {
          const monthDate = new Date(viewYear, month, 1);
          const aktif = isSameMonth(monthDate, value);
          const buDonem = isSameMonth(monthDate, now);

          return (
            <Pressable
              key={month}
              onPress={() => onSelect(monthDate)}
              className={cn(
                "mb-2 w-[31.5%] items-center rounded-xl border py-3",
                aktif
                  ? "border-qrz-navy bg-qrz-navy"
                  : buDonem
                    ? "border-qrz-blue bg-qrz-light"
                    : "border-slate-200 bg-white",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-semibold",
                  aktif ? "text-white" : "text-slate-700",
                )}
              >
                {format(monthDate, "LLLL", { locale: tr })}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---- mode="day": ay gezintisi + gün grid'i ----------------------------------

const HAFTA_GUNLERI = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function DayGrid({
  value,
  onSelect,
}: {
  value: Date;
  onSelect: (date: Date) => void;
}) {
  const [viewMonth, setViewMonth] = useState(startOfMonth(value));
  const now = new Date();

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 }),
      }),
    [viewMonth],
  );

  return (
    <View>
      <GridHeader
        label={format(viewMonth, "MMMM yyyy", { locale: tr })}
        onPrev={() => setViewMonth((m) => addMonths(m, -1))}
        onNext={() => setViewMonth((m) => addMonths(m, 1))}
      />

      <View className="mb-1 flex-row">
        {HAFTA_GUNLERI.map((gun) => (
          <Text
            key={gun}
            className="flex-1 text-center text-xs font-medium text-slate-400"
          >
            {gun}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day) => {
          const aktif = isSameDay(day, value);
          const bugun = isSameDay(day, now);
          const ayDisi = !isSameMonth(day, viewMonth);

          return (
            <View key={day.toISOString()} className="w-[14.28%] p-0.5">
              <Pressable
                onPress={() => onSelect(day)}
                className={cn(
                  "h-10 items-center justify-center rounded-xl",
                  aktif
                    ? "bg-qrz-navy"
                    : bugun
                      ? "border border-qrz-blue bg-qrz-light"
                      : "active:bg-slate-100",
                )}
              >
                <Text
                  className={cn(
                    "text-sm",
                    aktif
                      ? "font-semibold text-white"
                      : ayDisi
                        ? "text-slate-300"
                        : "text-slate-700",
                  )}
                >
                  {format(day, "d")}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
