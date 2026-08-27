import Svg, { Circle } from "react-native-svg";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function Circles() {
  return (
    <Svg
      width={width * 0.7}
      height={width * 0.7}
      viewBox="0 0 240 240"
      style={{ position: "absolute", top: -30, right: -30 }}
    >
      {/* en büyük, en açık daire — arka katman */}
      <Circle cx="180" cy="60" r="110" fill="#EAF9FD" opacity={0.6} />

      {/* orta boy daire */}
      <Circle cx="200" cy="90" r="70" fill="#B9E7F5" opacity={0.5} />

      {/* küçük, daha koyu daire — ön katman, vurgu */}
      <Circle cx="150" cy="40" r="30" fill="#3B82F6" opacity={0.15} />

      {/* minik detay dairesi */}
      <Circle cx="220" cy="150" r="12" fill="#052346" opacity={0.08} />
    </Svg>
  );
}
