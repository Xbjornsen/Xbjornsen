import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AlertLevel } from '../types';
import { ALERT_COLORS } from '../constants/colors';

const SIZE = 200;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Arc goes from -225° to 45° (270° sweep, starting bottom-left)
const START_ANGLE = -225;
const SWEEP = 270;

function polarToXY(angle: number, r: number, cx: number, cy: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToXY(startAngle, r, cx, cy);
  const end = polarToXY(endAngle, r, cx, cy);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

interface Props {
  magnitude: number;
  alertLevel: AlertLevel;
  maxValue?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function RadialGauge({ magnitude, alertLevel, maxValue = 150 }: Props) {
  const pct = Math.min(magnitude / maxValue, 1);
  const sweepAngle = pct * SWEEP;
  const endAngle = START_ANGLE + sweepAngle;
  const color = ALERT_COLORS[alertLevel];

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    loopRef.current?.stop();
    const intensity = Math.min(magnitude / 100, 1);
    const duration = Math.max(150, 900 - magnitude * 6);

    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1 + 0.12 * intensity,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.15 + 0.5 * intensity,
            duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.05,
            duration,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    loopRef.current.start();

    return () => loopRef.current?.stop();
  }, [alertLevel, magnitude]);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const trackPath = describeArc(cx, cy, RADIUS, START_ANGLE, START_ANGLE + SWEEP);
  const valuePath =
    pct > 0 ? describeArc(cx, cy, RADIUS, START_ANGLE, endAngle) : '';

  return (
    <View style={styles.container}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderColor: color,
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <Svg width={SIZE} height={SIZE}>
        {/* Track */}
        <Path
          d={trackPath}
          stroke="#1E1E1E"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
        />
        {/* Value arc */}
        {pct > 0 && (
          <Path
            d={valuePath}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
          />
        )}
        {/* Centre dot */}
        <Circle cx={cx} cy={cy} r={6} fill={color} opacity={0.8} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZE,
    height: SIZE,
  },
  glowRing: {
    position: 'absolute',
    width: SIZE + 24,
    height: SIZE + 24,
    borderRadius: (SIZE + 24) / 2,
    borderWidth: 2,
  },
});
