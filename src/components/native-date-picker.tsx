import { useState } from "react";
import { Pressable, Text } from "react-native";
import { Calendar as CalendarIcon } from "lucide-react-native";
import DateTimePicker, {
  useDefaultClassNames,
} from "react-native-ui-datepicker";
import dayjs from "dayjs";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type NativeDatePickerProps = {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function NativeDatePicker({
  value,
  onChange,
  placeholder = "Tarih seçin",
  disabled,
  className,
}: NativeDatePickerProps) {
  const [, setOpen] = useState(false);
  const defaultClassNames = useDefaultClassNames();

  return (
    <Popover onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Pressable
          disabled={disabled}
          className={cn(
            "h-11 flex-row items-center justify-between rounded-md border border-slate-200 bg-white px-3.5",
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
          <CalendarIcon size={16} color="#64748b" />
        </Pressable>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-2" style={{zIndex:9999}}>
        <DateTimePicker
          mode="single"
          date={value ? dayjs(value) : undefined}
          locale="tr"
          onChange={({ date }) => {
            if (date) {
              onChange(dayjs(date).toDate());
              setOpen(false);
            }
          }}
          classNames={{
            ...defaultClassNames,
            selected: "bg-blue-500 border-blue-500",
            selected_label: "text-white",
            today: "border-blue-400",
          }}
          style={{zIndex:9999}}
        />
      </PopoverContent>
    </Popover>
  );
}
