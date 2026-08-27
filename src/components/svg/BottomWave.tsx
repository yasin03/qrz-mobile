import Svg, { Path, Defs, Filter, FeDropShadow } from "react-native-svg";

import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function BottomWave() {
  return (
    <Svg
      width={width}
      height={140}
      viewBox={`0 0 ${width} 140`}
      style={{ position: "absolute", bottom: 0 }}
    >
      <Defs>
        <Filter id="waveShadow" x="-10%" y="-10%" width="140%" height="140%">
          <FeDropShadow
            dx="0"
            dy="-4"
            stdDeviation="6"
            floodColor="#000000"
            floodOpacity="0.05"
          />
        </Filter>
      </Defs>

      <Path
        d={`M0,80 C${width * 0.3},140 ${width * 0.7},20 ${width},80 L${width},140 L0,140 Z`}
        fill="#EAF9FD"
      />
      <Path
        d={`M0,100 C${width * 0.25},60 ${width * 0.75},140 ${width},90 L${width},140 L0,140 Z`}
        fill="#EAF9FD"
        filter="url(#waveShadow)"
      />
    </Svg>
  );
}
