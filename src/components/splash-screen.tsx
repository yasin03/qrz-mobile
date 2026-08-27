import { useEffect, useRef } from "react";
import { Animated, Easing, View, Image } from "react-native";
import { Text } from "@/components/ui/text"; // reactnativereusables text component

export function CustomSplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Animated.View
        style={{ opacity, transform: [{ scale }] }}
        className="items-center gap-3"
      >
        <Image
          source={require("@/assets/logos/logo-icon.png")}
          className="h-32 w-auto"
          resizeMode="contain"
        />
        {/* Logo yerine kendi asset'inizi koyun */}
        <View className="h-20 w-20 rounded-2xl bg-primary items-center justify-center">
          <Text
            variant="h2"
            className="text-primary-foreground text-2xl font-bold"
          >
            QRZ
          </Text>
        </View>
        <Text className="text-muted-foreground text-sm">Yükleniyor...</Text>
      </Animated.View>
    </View>
  );
}
