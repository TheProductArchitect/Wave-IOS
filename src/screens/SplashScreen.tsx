import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing, 
  withDelay,
  withRepeat,
  interpolate,
  type SharedValue
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type Props = {
  onComplete: () => void;
};

// Configuration for our fluid particle field
const WAVES = 8;
const PARTICLES_PER_WAVE = 35; // Total 280 particles for a rich fluid 3D effect

const Particle = ({ 
  waveIndex, 
  particleIndex, 
  time 
}: { 
  waveIndex: number; 
  particleIndex: number; 
  time: SharedValue<number>;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Distribute particles across the screen
    const xBase = (particleIndex / (PARTICLES_PER_WAVE - 1)) * (width * 1.2) - (width * 0.1);
    
    // Wave and spatial phase offsets
    const wavePhase = waveIndex * (Math.PI / (WAVES / 2));
    const xPhase = (particleIndex / PARTICLES_PER_WAVE) * Math.PI * 3;
    
    // Time progression
    const t = time.value * Math.PI * 2;
    
    // 3D Swirling Fluid equations
    const yOriginal = Math.sin(xPhase + t + wavePhase) * 50;
    const zOriginal = Math.cos(xPhase * 1.5 + t * 1.2 + wavePhase) * 60;
    
    // Secondary turbulence for a more organic/liquid feel
    const turbulence = Math.sin(t * 2.5 + xPhase * 2) * 20;
    
    // Envelope to taper off the ends of the wave
    const normalizedX = particleIndex / (PARTICLES_PER_WAVE - 1);
    const envelope = Math.sin(normalizedX * Math.PI); // 0 at edges, 1 in center
    
    const y = (yOriginal + turbulence) * envelope;
    
    // Z-depth mapped to scale and opacity to simulate thousands of tiny 3D particles
    const scale = interpolate(zOriginal, [-60, 60], [0.2, 1.8]);
    const zOpacity = interpolate(zOriginal, [-60, 60], [0.1, 0.9]);
    
    return {
      transform: [
        { translateX: xBase },
        { translateY: y },
        { scale }
      ],
      opacity: zOpacity * envelope,
    };
  });

  return (
    <Animated.View style={[styles.particle, animatedStyle]} />
  );
};

export default function SplashScreen({ onComplete }: Props) {
  const containerOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const time = useSharedValue(0);

  // Pre-generate arrays to avoid reallocation
  const wavesArray = useMemo(() => Array.from({ length: WAVES }), []);
  const particlesArray = useMemo(() => Array.from({ length: PARTICLES_PER_WAVE }), []);

  useEffect(() => {
    // Fade in the whole scene
    containerOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    
    // Text fades in after the field is established
    textOpacity.value = withDelay(600, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    
    // Start continuous fluid simulation flow
    time.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.linear }),
      -1,
      false
    );
    
    // After 2.5 seconds navigate seamlessly to HomeScreen
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete, containerOpacity, textOpacity, time]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Background Energy Glows */}
      <View style={[styles.glowBlob, styles.blob1]} />
      <View style={[styles.glowBlob, styles.blob2]} />

      {/* Fluid Energy Field */}
      <View style={styles.fluidContainer}>
        {wavesArray.map((_, wIndex) => 
          particlesArray.map((__, pIndex) => (
            <Particle 
              key={`w${wIndex}_p${pIndex}`} 
              waveIndex={wIndex} 
              particleIndex={pIndex} 
              time={time} 
            />
          ))
        )}
      </View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.text}>WAVE</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fluidContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    position: 'absolute',
    top: '40%',
    marginTop: -150,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00FFFF',
    shadowColor: '#00FFFF',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  glowBlob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#00FFFF',
    opacity: 0.15,
  },
  blob1: {
    top: '35%',
    left: '10%',
    transform: [{ scaleX: 1.5 }],
    opacity: 0.08,
  },
  blob2: {
    top: '45%',
    right: '10%',
    transform: [{ scaleX: 1.5 }],
    opacity: 0.08,
  },
  textContainer: {
    position: 'absolute',
    top: '50%',
    marginTop: 180,
  },
  text: {
    color: '#00FFFF',
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'System', 
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});