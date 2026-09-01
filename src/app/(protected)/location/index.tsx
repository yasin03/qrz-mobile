import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Ad, MapPinPlus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useBolumler } from "@/hooks/use-kurumsal";

const Index = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="">
      <View className="flex-row items-center justify-between px-4 py-2 ">
        <Button
          variant="secondary"
          onPress={() => router.push("/location/save")}
        >
          <MapPinPlus size={20} />
        </Button>
        <Text>Index</Text>
      </View>
    </SafeAreaView>
  );
};

export default Index;
