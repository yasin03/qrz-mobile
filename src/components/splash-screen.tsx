import { useEffect, useRef } from "react";
import { Animated, Easing, View, Image, Dimensions } from "react-native";
import { Text } from "@/components/ui/text";
import SplashTopWave from "./svg/SplashTopWave";
import SplashWave from "./svg/SplashWave";

const { width } = Dimensions.get("window");

function LoadingDots() {
  const dots = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 180),
          Animated.timing(dot, {
            toValue: 1,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay((dots.length - 1 - index) * 180),
        ]),
      ),
    );

    Animated.stagger(0, animations).start();

    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View className="flex-row items-center gap-2">
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{ opacity: dot }}
          className="h-2 w-2 rounded-full bg-[#4FB4DE]"
        />
      ))}
    </View>
  );
}

export function CustomSplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const blobOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(blobOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-white overflow-hidden">
      <Animated.View style={{ opacity: blobOpacity }}>
        <SplashTopWave />
      </Animated.View>

      {/* Logo — ortaya yakın, biraz üst ağırlıklı */}
      <View
        className="flex-1 items-center justify-center px-8"
        style={{ marginBottom: width * 0.15 }}
      >
        <Animated.View
          style={{ opacity, transform: [{ scale }] }}
          className="items-center"
        >
          <Image
            source={require("@/assets/logos/logo-icon.png")}
            className="absolute h-36 bottom-24 "
            resizeMode="contain"
          />
          <View className="flex-row items-center justify-center gap-1 mt-16">
            <Text className="text-5xl font-bold text-black">QR</Text>
            <Text className="text-5xl font-medium text-qrz-blue">Zaman</Text>
          </View>

          <Text className="mt-2 text-center text-sm text-slate-500 ">
            PERSONEL TAKİBİNİN AKILLI YOLU
          </Text>
        </Animated.View>
      </View>

      <SplashWave />
      {/* Yükleniyor bölümü — dalganın hemen üstünde */}
      <View
        className="absolute w-full items-center gap-3"
        style={{ bottom: 300 }}
      >
        <LoadingDots />
        <Text className="text-sm text-[#5B6B7F]">Yükleniyor...</Text>
      </View>
    </View>
  );
}
