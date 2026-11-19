const { withAndroidManifest } = require("expo/config-plugins");

// Google Play, bazı izin/ayarlardan donanım özelliklerini "zorunlu" sayıp
// o özelliği olmayan cihazlarda (Android TV, Chromebook, XR vb.) uygulamayı gizliyor:
// - android.hardware.wifi           ← NetInfo'nun ACCESS_WIFI_STATE izni
// - android.hardware.screen.portrait ← app.json "orientation": "portrait"
// Uygulama bunlar olmadan da çalıştığı için isteğe bağlı (required=false) beyan edilir.
const ISTEGE_BAGLI_OZELLIKLER = [
  "android.hardware.wifi",
  "android.hardware.screen.portrait",
];

module.exports = function withOptionalHardwareFeatures(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const ozellikler = (manifest["uses-feature"] ??= []);

    for (const ad of ISTEGE_BAGLI_OZELLIKLER) {
      const mevcut = ozellikler.find((f) => f.$?.["android:name"] === ad);
      if (mevcut) {
        mevcut.$["android:required"] = "false";
      } else {
        ozellikler.push({
          $: { "android:name": ad, "android:required": "false" },
        });
      }
    }

    return config;
  });
};
