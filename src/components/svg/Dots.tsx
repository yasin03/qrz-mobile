// components/TopRightDots.tsx
import Svg, { Circle } from "react-native-svg";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const SIZE = width * 0.55;
const VIEWBOX = 200;

function generateDots() {
  const dots: { x: number; y: number; r: number; opacity: number }[] = [];
  const spacing = 10; // noktalar arası mesafe
  const centerX = 80;
  const centerY = 80;
  const maxRadius = 95;

  for (let x = 0; x <= VIEWBOX; x += spacing) {
    for (let y = 0; y <= VIEWBOX; y += spacing) {
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      if (dist <= maxRadius) {
        // merkeze yakın noktalar biraz daha büyük/belirgin, kenara doğru küçülüp soluklaşıyor
        const ratio = dist / maxRadius;
        dots.push({
          x,
          y,
          r: 2.2 - ratio * 0.8,
          opacity: 1 - ratio * 0.7,
        });
      }
    }
  }

  return dots;
}

const dots = generateDots();

export default function TopRightDots() {
  return (
    <Svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      style={{ position: "absolute", top: -70, right: -70 }}
      pointerEvents="none"
    >
      {dots.map((dot, i) => (
        <Circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill="#3B82F6"
          opacity={dot.opacity}
        />
      ))}
    </Svg>
  );
}
