import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useLogin } from "@/hooks/use-login";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin();

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(
        "Uyarı",
        "Kullanıcı adı ve şifre zorunludur.",
      );

      return;
    }

    loginMutation.mutate({
      username: username.trim(),
      password,
    });
  };

  const errorMessage =
    loginMutation.data?.Sonuc === "0"
      ? "Kullanıcı adı veya şifre hatalı."
      : null;

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <View className="mb-10">
        <Text className="text-4xl font-bold text-[#052346]">
          QR Zaman
        </Text>

        <Text className="mt-2 text-base text-gray-500">
          Personel uygulamasına hoş geldiniz
        </Text>
      </View>

      <View className="gap-4">
        <View>
          <Text className="mb-2 font-medium text-gray-700">
            Kullanıcı Adı
          </Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Kullanıcı adınızı girin"
            autoCapitalize="none"
            autoCorrect={false}
            className="rounded-xl border border-gray-300 px-4 py-4"
          />
        </View>

        <View>
          <Text className="mb-2 font-medium text-gray-700">
            Şifre
          </Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Şifrenizi girin"
            secureTextEntry
            className="rounded-xl border border-gray-300 px-4 py-4"
          />
        </View>

        {errorMessage ? (
          <Text className="text-sm text-red-500">
            {errorMessage}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loginMutation.isPending}
          className="mt-2 items-center rounded-xl bg-[#052346] py-4"
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-semibold text-white">
              Giriş Yap
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}