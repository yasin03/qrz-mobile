import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { X } from "lucide-react-native";

// ---- formSheet olarak açılan form ekranları (izin/avans ekle vb.) ----------
//
// Projede sorunsuz çalışan ParametreForm (eklentiler/kesintiler ekle) ile
// birebir aynı yapı:
//  - Ekranın KÖK elemanı doğrudan (KeyboardAware)ScrollView (dışında sarmalayıcı View yok),
//  - başlık ve gönder butonu ScrollView'in içinde,
//  - sheet yüksekliği için özel detent yok (varsayılan tam yükseklik).
//
// Denenip bırakılanlar (hepsi react-native-screens'in sheet içeriğini ölçme /
// yerleştirmesiyle çakıştı): "fitToContents" (Android içerik büyüyünce yanlış
// ölçüp ya altı ekran dışında bırakıyor ya da başlığı select'in altına
// taşıyordu), sarmalayıcı View + flex-1 (içerik 0 yüksekliğe düşüyordu),
// sabit detent + piksel yükseklik.

export const FORM_SHEET_OPTIONS = {
  presentation: "formSheet" as const,
  sheetGrabberVisible: true,
  sheetCornerRadius: 24,
};

type FormSheetScreenProps = {
  title: string;
  children: ReactNode;
  /** Formun en altında duran alan (gönder butonu). */
  footer?: ReactNode;
};

export function FormSheetScreen({
  title,
  children,
  footer,
}: FormSheetScreenProps) {
  return (
    // Klavye açılınca odaklanan input klavyenin üstüne kaydırılır (iOS + Android).
    // Üçüncü parti bileşen olduğu için className yerine style kullanılıyor.
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      contentContainerStyle={{ padding: 24, paddingTop: 32 }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-qrz-navy">{title}</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <X size={22} color="#0f172a" />
        </Pressable>
      </View>

      <View className="mt-6 gap-4">{children}</View>

      {footer && <View className="mb-6 mt-6">{footer}</View>}
    </KeyboardAwareScrollView>
  );
}
