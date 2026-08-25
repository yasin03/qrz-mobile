import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff, LogIn } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useLogin } from "@/hooks/use-login";
import { loginSchema, type LoginFormValues } from "@/schemas/auth-schema";

export default function LoginScreen() {
  const router = useRouter();
  const loginMutation = useLogin();

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white justify-center items-center"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo */}
        <View className="mb-10 items-center">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-[#052346]">
            <LogIn size={36} color="#01BBE6" />
          </View>

          <Text className="text-3xl font-bold text-[#052346]">QR Zaman</Text>

          <Text className="mt-2 text-center text-gray-500">
            Personel uygulamasına hoş geldiniz
          </Text>
        </View>

        {/* Username */}
        <View className="mb-4">
          <Text className="mb-2 font-medium text-[#1981f7]">Kullanıcı Adı</Text>

          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <TextInput
                className="h-14 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base"
                placeholder="Kullanıcı adınızı girin"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />

          {errors.username && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.username.message}
            </Text>
          )}
        </View>

        {/* Password */}
        <View className="mb-6">
          <Text className="mb-2 font-medium text-[#052346]">Şifre</Text>

          <View className="relative">
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <TextInput
                  className="h-14 rounded-xl border border-gray-200 bg-gray-50 px-4 pr-12 text-base"
                  placeholder="Şifrenizi girin"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />

            <Pressable
              className="absolute right-4 top-4"
              onPress={() => setShowPassword((value) => !value)}
            >
              {showPassword ? (
                <EyeOff size={22} color="#6B7280" />
              ) : (
                <Eye size={22} color="#6B7280" />
              )}
            </Pressable>
          </View>

          {errors.password && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* Login */}
        <Pressable
          className="h-14 items-center justify-center rounded-xl bg-[#052346]"
          disabled={loginMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-semibold text-white">
              Giriş Yap
            </Text>
          )}
        </Pressable>

        {loginMutation.isError && (
          <Text className="mt-4 text-center text-sm text-red-500">
            Giriş sırasında bir hata oluştu.
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
