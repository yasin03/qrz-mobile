const {
  withDangerousMod,
  withAndroidManifest,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

function withCopyCertAndConfig(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformRoot = config.modRequest.platformProjectRoot;

      // 1. Sertifikayı res/raw'a kopyala
      const rawDir = path.join(platformRoot, "app/src/main/res/raw");
      fs.mkdirSync(rawDir, { recursive: true });
      fs.copyFileSync(
        path.join(projectRoot, "assets/certs/ssl_com_root_2022.pem"),
        path.join(rawDir, "ssl_com_root_2022.crt"),
      );

      // 2. network_security_config.xml'i res/xml'e kopyala
      const xmlDir = path.join(platformRoot, "app/src/main/res/xml");
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.copyFileSync(
        path.join(projectRoot, "network_security_config.xml"),
        path.join(xmlDir, "network_security_config.xml"),
      );

      return config;
    },
  ]);
}

function withManifestNetworkSecurityConfig(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application[0];
    application.$["android:networkSecurityConfig"] =
      "@xml/network_security_config";
    return config;
  });
}

module.exports = function withNetworkSecurityConfig(config) {
  config = withCopyCertAndConfig(config);
  config = withManifestNetworkSecurityConfig(config);
  return config;
};
