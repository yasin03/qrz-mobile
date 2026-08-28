import Svg, { Path, Defs, Filter, FeDropShadow } from "react-native-svg";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const HEIGHT = 230;

export default function SplashWave() {
  return (
    <Svg
      width={width}
      height={HEIGHT}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      style={{ position: "absolute", bottom: 0 }}
    >
      <Defs>
        <Filter id="splashWaveShadow" x="-10%" y="-20%" width="120%" height="150%">
          <FeDropShadow
            dx="0"
            dy="-6"
            stdDeviation="8"
            floodColor="#0B1F3A"
            floodOpacity="0.12"
          />
        </Filter>
      </Defs>

      {/* Üstte ince açık mavi dalga şeridi */}
      <Path
        d={`M0,${HEIGHT * 0.32} C${width * 0.28},${HEIGHT * 0.02} ${width * 0.72},${HEIGHT * 0.58} ${width},${HEIGHT * 0.22} L${width},${HEIGHT} L0,${HEIGHT} Z`}
        fill="#4FB4DE"
      />

      {/* Ana lacivert dolgu */}
      <Path
        filter="url(#splashWaveShadow)"
        d={`M0,${HEIGHT * 0.5} C${width * 0.3},${HEIGHT * 0.78} ${width * 0.68},${HEIGHT * 0.3} ${width},${HEIGHT * 0.46} L${width},${HEIGHT} L0,${HEIGHT} Z`}
        fill="#0F2A4D"
      />
    </Svg>
  );
}