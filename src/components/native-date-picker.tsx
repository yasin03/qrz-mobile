import { Platform } from "react-native";
import { Host as IOSHost, DatePicker as IOSDatePicker } from "@expo/ui/swift-ui";
import { Host as AndroidHost, DateTimePicker as AndroidDatePicker } from "@expo/ui/jetpack-compose";

type NativeDatePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

export function NativeDatePicker({ value, onChange }: NativeDatePickerProps) {
  if (Platform.OS === "ios") {
    return (
      <IOSHost style={{ height: 36 }}>
        <IOSDatePicker
          selection={value}
          displayedComponents={["date"]}
          onDateChange={onChange}
        />
      </IOSHost>
    );
  }

  return (
    <AndroidHost matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <AndroidDatePicker
        variant="input"
        displayedComponents="date"
        initialDate={value.toISOString()}
        onDateSelected={onChange}
      />
    </AndroidHost>
  );
}