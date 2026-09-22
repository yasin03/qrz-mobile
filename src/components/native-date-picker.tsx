import { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react-native";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { tr } from "date-fns/locale";

import { cn } from "@/lib/utils";

type NativeDatePickerProps = {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const QRZ_NAVY = "#052346";
const QRZ_BLUE = "#01BBE6";
const QRZ_LIGHT = "#EAF9FD";
const QRZ_GRAY = "#64748B";
const QRZ_BORDER = "#E2E8F0";

export function NativeDatePicker({
  value,
  onChange,
  placeholder = "Tarih seçin",
  disabled,
  className,
}: NativeDatePickerProps) {
  const [open, setOpen] = useState(false);

  const [displayMonth, setDisplayMonth] = useState(value ?? new Date());

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(displayMonth);

    const calendarStart = startOfWeek(monthStart, {
      weekStartsOn: 1,
    });

    const calendarEnd = endOfWeek(monthEnd, {
      weekStartsOn: 1,
    });

    const allDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    const result: Date[][] = [];

    for (let i = 0; i < allDays.length; i += 7) {
      result.push(allDays.slice(i, i + 7));
    }

    return result;
  }, [displayMonth]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(displayMonth);

    const calendarStart = startOfWeek(monthStart, {
      weekStartsOn: 1,
    });

    const calendarEnd = endOfWeek(monthEnd, {
      weekStartsOn: 1,
    });

    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });
  }, [displayMonth]);

  const handleOpen = () => {
    setDisplayMonth(value ?? new Date());
    setOpen(true);
  };

  const handleSelect = (date: Date) => {
    // Tarihi local olarak gün ortasına sabitle.
    const selectedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12,
      0,
      0,
      0,
    );

    onChange(selectedDate);
    setOpen(false);
  };

  const previousMonth = () => {
    setDisplayMonth((current) => subMonths(current, 1));
  };

  const nextMonth = () => {
    setDisplayMonth((current) => addMonths(current, 1));
  };

  return (
    <>
      {/* Input */}
      <Pressable
        disabled={disabled}
        onPress={handleOpen}
        className={cn(
          "h-11 flex-row items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5",
          disabled && "opacity-60",
          className,
        )}
      >
        <Text
          className={
            value ? "text-sm text-slate-900" : "text-sm text-slate-400"
          }
        >
          {value ? format(value, "dd.MM.yyyy", { locale: tr }) : placeholder}
        </Text>

        <CalendarDays size={17} color={QRZ_GRAY} strokeWidth={2} />
      </Pressable>

      {/* Calendar Modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 px-5"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="w-full max-w-[380px] rounded-3xl bg-white p-5"
            onPress={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-medium text-slate-400">
                  TARİH SEÇ
                </Text>

                <Text className="mt-1 text-xl font-semibold text-qrz-navy">
                  {format(displayMonth, "MMMM yyyy", {
                    locale: tr,
                  })}
                </Text>
              </View>

              <View className="flex-row gap-1">
                <Pressable
                  onPress={previousMonth}
                  className="h-9 w-9 items-center justify-center rounded-full bg-slate-50 active:bg-slate-100"
                >
                  <ChevronLeft size={19} color={QRZ_NAVY} strokeWidth={2} />
                </Pressable>

                <Pressable
                  onPress={nextMonth}
                  className="h-9 w-9 items-center justify-center rounded-full bg-slate-50 active:bg-slate-100"
                >
                  <ChevronRight size={19} color={QRZ_NAVY} strokeWidth={2} />
                </Pressable>
              </View>
            </View>

            {/* Week days */}
            <View className="mb-2 flex-row">
              <View className="mb-2 flex-row">
                {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map(
                  (day, index) => (
                    <View
                      key={`${day}-${index}`}
                      style={{ width: "14.2857%" }}
                      className="items-center"
                    >
                      <Text className="text-xs font-medium text-slate-400">
                        {day}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>

            {/* Days */}
            <View className="flex-row flex-wrap">
              <View>
                {weeks.map((week, weekIndex) => (
                  <View key={weekIndex} className="flex-row">
                    {week.map((day) => {
                      const selected = value ? isSameDay(day, value) : false;

                      const currentMonth = isSameMonth(day, displayMonth);

                      const today = isSameDay(day, new Date());

                      return (
                        <View
                          key={format(day, "yyyy-MM-dd")}
                          style={{ width: "14.2857%" }}
                          className="items-center py-1"
                        >
                          <Pressable
                            onPress={() => handleSelect(day)}
                            className={cn(
                              "h-10 w-10 items-center justify-center rounded-full",
                              selected && "bg-qrz-blue",
                              !selected && today && "border border-qrz-blue",
                            )}
                          >
                            <Text
                              className={cn(
                                "text-sm",
                                selected
                                  ? "font-semibold text-white"
                                  : currentMonth
                                    ? "text-qrz-navy"
                                    : "text-slate-300",
                              )}
                            >
                              {format(day, "d")}
                            </Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            {/* Footer */}
            <View className="mt-5 flex-row items-center justify-between border-t border-slate-100 pt-4">
              <Pressable
                onPress={() => setOpen(false)}
                className="rounded-lg px-4 py-2.5"
              >
                <Text className="text-sm font-medium text-slate-500">
                  İptal
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  const today = new Date();

                  const selectedToday = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    12,
                    0,
                    0,
                    0,
                  );

                  onChange(selectedToday);
                  setOpen(false);
                }}
                className="rounded-lg bg-qrz-light px-4 py-2.5"
              >
                <Text className="text-sm font-semibold text-qrz-navy">
                  Bugün
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
