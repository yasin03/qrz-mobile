import { useState } from "react";
import { Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth-store";
import { useRole } from "@/hooks/use-role";
import { DetailScreenHeader } from "@/components/detail-screen-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IzinListesi from "@/components/izin/IzinListesi";
import IzinTalepListesi from "@/components/izin/IzinTalepListesi";

export default function Izinler() {
  const { isPersonel, isAdmin, isYonetici } = useRole();
  const isYoneticiVeyaAdmin = isAdmin || isYonetici;
  const user = useAuthStore((state) => state.user);
  const [tabValue, setTabValue] = useState("talep");
  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-white px-4">
      <DetailScreenHeader
        title="İzinler"
        right={
          <Pressable
            onPress={() => router.push("/izinler/ekle")}
            className="flex-row items-center gap-1 rounded-lg bg-qrz-navy px-3 py-2"
          >
            <Plus size={16} color="white" />
            <Text className="text-xs font-medium text-white">Yeni Talep</Text>
          </Pressable>
        }
      />
      <Tabs
        value={tabValue}
        onValueChange={setTabValue}
        className="mt-3 flex-1"
      >
        <TabsList className="w-full flex-row">
          <TabsTrigger value="talep" className="flex-1 items-center">
            <Text>Taleplerim</Text>
          </TabsTrigger>
          <TabsTrigger value="avans" className="flex-1 items-center">
            <Text>İzinler</Text>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="talep" className="flex-1">
          <IzinTalepListesi user={user} />
        </TabsContent>

        <TabsContent value="avans" className="flex-1">
          <IzinListesi user={user} />
        </TabsContent>
      </Tabs>
    </SafeAreaView>
  );
}
