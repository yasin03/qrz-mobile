import { Icon, Label, Stack } from "expo-router";
import { NativeTabs } from "expo-router/build/native-tabs";

export default function ProtectedLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Ana Sayfa</Label>
        <Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="izinler">
        <Label>İzinler</Label>
        <Icon sf="calendar" md="event" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="qr-tara">
        <Label>QR Tara</Label>
        <Icon sf="qrcode.viewfinder" md="qr_code_scanner" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="avanslar">
        <Label>Avanslar</Label>
        <Icon sf="banknote.fill" md="payments" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Profil</Label>
        <Icon sf="person.fill" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
