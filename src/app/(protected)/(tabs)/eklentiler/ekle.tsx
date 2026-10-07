import { Redirect } from "expo-router";
import { ParametreForm } from "@/components/bordro-parametre/ParametreForm";
import { useRole } from "@/hooks/use-role";

// Ekleme / düzenleme sadece admin ve yönetici içindir
export default function EklentiEkle() {
  const { isPersonel } = useRole();
  if (isPersonel) return <Redirect href="/eklentiler" />;
  return <ParametreForm tur="eklenti" />;
}
