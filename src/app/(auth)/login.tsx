import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";

import { useLogin } from "@/hooks/use-login";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin();

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("Uyarı", "Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    loginMutation.mutate({
      username,
      password,
    });
  };

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="mb-6 text-3xl font-bold">QR Zaman</Text>

      <TextInput
        className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3"
        placeholder="Kullanıcı adı"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3"
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
        onPress={handleLogin}
        disabled={loginMutation.isPending}
      />
    </View>
  );
}
