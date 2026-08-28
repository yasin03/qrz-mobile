import Svg, { Path } from "react-native-svg";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const BLOB_WIDTH = width * 0.85;
const BLOB_HEIGHT = width * 0.85;

export default function SplashTopWave() {
  return (
    <Svg
      width={BLOB_WIDTH}
      height={BLOB_HEIGHT}
      viewBox={`0 0 ${BLOB_WIDTH} ${BLOB_HEIGHT}`}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* Ana blob — açık mavi */}
      <Path
        d={`M0,0
            L${BLOB_WIDTH * 0.55},0
            C${BLOB_WIDTH * 0.8},${BLOB_HEIGHT * 0.08} ${BLOB_WIDTH * 0.72},${BLOB_HEIGHT * 0.42} ${BLOB_WIDTH * 0.35},${BLOB_HEIGHT * 0.5}
            C${BLOB_WIDTH * 0.1},${BLOB_HEIGHT * 0.56} ${BLOB_WIDTH * 0.05},${BLOB_HEIGHT * 0.75} 0,${BLOB_HEIGHT * 0.72}
            Z`}
        fill="#DFF1F9"
      />
    </Svg>
  );
}
