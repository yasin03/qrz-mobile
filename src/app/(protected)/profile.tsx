import { View, Text, TouchableOpacity } from "react-native";
import { useAuthStore } from "@/stores/auth-store";

const Profile = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-medium text-qrz-navy">Profile</Text>
      <TouchableOpacity
        onPress={logout}
        className="rounded-lg bg-red-500 px-6 py-3"
      >
        <Text className="font-semibold text-white">Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;
