import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, LogIn, Phone, User } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
  Image,
} from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useLogin } from "@/hooks/use-login";
import { loginSchema, type LoginFormValues } from "@/schemas/auth-schema";
import BottomWave from "@/components/svg/BottomWave";
import TopRightDots from "@/components/svg/Dots";

export default function LoginScreen() {
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
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TopRightDots />
      <View className="flex-1 justify-center px-6">
        {/* Logo */}
        <View className="mb-10 items-center">
          <Image
            source={require("@/assets/logos/logo-icon.png")}
            className="h-32 w-auto"
            resizeMode="contain"
          />
          <View className="flex-row items-center justify-center gap-1 mt-4">
            <Text className="text-5xl font-bold text-qrz-navy">QR</Text>
            <Text className="text-5xl font-medium text-qrz-blue">Zaman</Text>
          </View>

          <Text className="mt-2 text-center text-sm text-slate-500 ">
            PERSONEL TAKİBİNİN AKILLI YOLU
          </Text>
        </View>

        {/* Username */}
        <View className="mb-5">
          <Text className="mb-2 font-medium text-qrz-navy">
            Kullanıcı Adı veya Telefon Numarası
          </Text>

          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <Input
                containerClassName="h-14 rounded-xl border-slate-200 bg-slate-50 px-4"
                placeholder="Kulllanıcı adı girin"
                autoCapitalize="none"
                autoCorrect={false}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                startIcon={<User size={20} color="#64748B" />}
              />
            )}
          />

          {errors.username && (
            <Text className="mt-1.5 text-sm text-red-500">
              {errors.username.message}
            </Text>
          )}
        </View>

        {/* Password */}
        <View className="mb-6">
          <Text className="mb-2 font-medium text-qrz-navy">Şifre</Text>

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input
                containerClassName="h-14 rounded-xl border-slate-200 bg-slate-50 px-4"
                placeholder="Şifrenizi girin"
                secureTextEntry={!showPassword}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                startIcon={<Lock size={20} color="#64748B" />}
                endIcon={
                  <Pressable
                    hitSlop={10}
                    onPress={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <EyeOff size={22} color="#64748B" />
                    ) : (
                      <Eye size={22} color="#64748B" />
                    )}
                  </Pressable>
                }
              />
            )}
          />

          {errors.password && (
            <Text className="mt-1.5 text-sm text-red-500">
              {errors.password.message}
            </Text>
          )}
        </View>
        <Pressable
          className="mb-6 flex-row justify-end"
          onPress={() =>
            alert("Şifremi Unuttum sayfası en kısa zamanda eklenecektir.")
          }
        >
          <Text className="text-sm font-medium text-qrz-blue">
            Şifremi Unuttum
          </Text>
        </Pressable>

        {/* Login */}
        <Button
          className="h-14 rounded-xl bg-qrz-blue"
          disabled={loginMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View className="flex-row items-center gap-2">
              <LogIn size={19} color="#FFFFFF" />

              <Text className="text-base font-semibold text-white">
                Giriş Yap
              </Text>
            </View>
          )}
        </Button>

        {/* Error */}
        {loginMutation.isError && (
          <Text className="mt-4 text-center text-sm text-red-500">
            Kullanıcı adı veya şifre hatalı.
          </Text>
        )}

        {/* Footer */}
        <Text className="mt-10 text-center text-xs text-slate-400">
          QR Zaman • Personel Yönetim Sistemi
        </Text>
      </View>

      <BottomWave />
    </KeyboardAvoidingView>
  );
}
