import * as Location from "expo-location";

export function parseQrPayload(qrText: string) {
  const [idBolumLokasyon, idBolum, enlem, boylam] = qrText.split("|");
  return {
    idBolumLokasyon: Number(idBolumLokasyon),
    idBolum: Number(idBolum),
    enlem: Number(enlem),
    boylam: Number(boylam),
  };
}

export function getPositionWithTimeout(
  options: Location.LocationOptions,
  timeoutMs: number,
): Promise<Location.LocationObject> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(async () => {
      const lastKnownPosition = await Location.getLastKnownPositionAsync({
        maxAge: 60_000,
        requiredAccuracy: 100,
      });

      if (lastKnownPosition) {
        resolve(lastKnownPosition);
      } else {
        reject(new Error("LOCATION_TIMEOUT"));
      }
    }, timeoutMs);

    Location.getCurrentPositionAsync(options).then(
      (position) => {
        clearTimeout(timeout);
        resolve(position);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}
