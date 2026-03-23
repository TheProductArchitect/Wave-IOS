import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import Animated, {
  Easing,
  FadeIn,
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { type ValidationResult, validateURL } from './src/security/urlSafety';

type ScreenState = 'guide' | 'input' | 'sync' | 'no-nfc' | 'read';
type SyncState = 
  | 'idle' 
  | 'searching' 
  | 'found' 
  | 'syncing' 
  | 'success' 
  | 'error';
type TagCheckError = 'INCOMPATIBLE' | 'NOT_FOUND' | 'TIMEOUT' | 'USER_CANCELED';

const AMBER_WARNING = '#FFBF00';
const RED = '#FF3B30';
const NTAG215_CAPACITY = 504;

// Theme colors
const COLORS_DARK = {
  bg: '#000000',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  textTertiary: 'rgba(255,255,255,0.4)',
  accent: '#00FFFF',
  accentGlow: 'rgba(0,255,255,0.2)',
  border: 'rgba(255,255,255,0.15)',
  borderLight: 'rgba(255,255,255,0.1)',
};

const COLORS_LIGHT = {
  bg: '#F9F9F9',
  text: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',
  accent: '#00CCFF',
  accentGlow: 'rgba(0,204,255,0.15)',
  border: 'rgba(0,0,0,0.15)',
  borderLight: 'rgba(0,0,0,0.08)',
};

// Status message map with granular states
const STATUS_MESSAGES: Record<SyncState, string> = {
  idle: 'Ready to Wave',
  searching: 'Looking for Card...',
  found: 'Card Linked: NTAG215',
  syncing: 'Programming Profile...',
  success: 'Profile Synced!',
  error: 'Error',
};

// Error fixes map for actionable guidance
const ERROR_FIXES: Record<TagCheckError, { label: string; fix: string }> = {
  'NOT_FOUND': { label: 'Tag Not Found', fix: 'Hold the card closer for 2-3 seconds' },
  'INCOMPATIBLE': { label: 'Incompatible Tag', fix: 'Use an NTAG215 NFC tag' },
  'TIMEOUT': { label: 'Request Timeout', fix: 'Try again—tap the card firmly to the phone' },
  'USER_CANCELED': { label: 'Action Cancelled', fix: 'Tap the program button to try again' },
};

const getThemeColors = (isDark: boolean) => (isDark ? COLORS_DARK : COLORS_LIGHT);

const createStyles = (isDark: boolean) => {
  const colors = getThemeColors(isDark);

  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  guideContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 56,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    color: colors.text,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  gapContainer: {
    marginTop: 48,
    gap: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    padding: 20,
  },
  cardNumber: {
    marginBottom: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(0,255,255,0.7)' : 'rgba(0,204,255,0.7)',
    backgroundColor: colors.accentGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardDesc: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  button: {
    marginTop: 'auto',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: colors.accent,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 3,
    color: colors.textSecondary,
    marginTop: 16,
  },
  subHeaderText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: colors.textTertiary,
    marginTop: 12,
    textAlign: 'center',
  },
  });
};

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function formatInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^(www\.|[a-zA-Z0-9-]+\.)/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return value;
}

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';
  const styles = useMemo(() => createStyles(isDark), [isDark]);
  const colors = useMemo(() => getThemeColors(isDark), [isDark]);

  const [urlInput, setUrlInput] = useState('');
  const [screenState, setScreenState] = useState<ScreenState>('guide');
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncMessage, setSyncMessage] = useState('Ready to Wave');
  const [errorFix, setErrorFix] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(true);
  const [showCompatibleTags, setShowCompatibleTags] = useState(false);
  const [urlValidation, setUrlValidation] = useState<ValidationResult>({ valid: false, safetyLevel: 'warning' });

  const syncPulse = useSharedValue(0);
  const buttonPulse = useSharedValue(0);
  const successBlast = useSharedValue(0);
  const errorFlash = useSharedValue(0);
  const cardPosition = useSharedValue(0);
  const signalPulse = useSharedValue(0);

  const normalizedUrl = useMemo(() => normalizeUrl(urlInput), [urlInput]);
  const validation = useMemo(() => validateURL(normalizedUrl), [normalizedUrl]);
  const canWrite = useMemo(() => validation.valid, [validation]);
  const isProceedWarning = useMemo(
    () => validation.valid && validation.safetyLevel === 'warning',
    [validation],
  );

  // Initialize NFC and check support
  useEffect(() => {
    const initNfc = async () => {
      try {
        await NfcManager.start();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        if (errorMsg.includes('not supported') || errorMsg.includes('disabled')) {
          setNfcSupported(false);
          setScreenState('no-nfc');
        }
        console.warn('NFC initialization:', errorMsg);
      }
    };

    initNfc();

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {
        // Ignore cleanup errors
      });
    };
  }, []);

  // Update URL validation on input change
  useEffect(() => {
    const validation = validateURL(normalizedUrl);
    setUrlValidation(validation);
  }, [normalizedUrl]);

  // Sync pulse animation
  useEffect(() => {
    if (screenState === 'sync' && syncState !== 'success') {
      syncPulse.value = withRepeat(
        withTiming(1, {
          duration: syncState === 'syncing' ? 1200 : 1800,
          easing: Easing.out(Easing.cubic),
        }),
        -1,
        false,
      );
      return;
    }

    cancelAnimation(syncPulse);
    syncPulse.value = 0;
  }, [screenState, syncPulse, syncState]);

  // Signal pulse at antenna (when card is in sweet spot)
  useEffect(() => {
    if (cardPosition.value > 0.7) { // Sweet spot threshold
      signalPulse.value = withRepeat(
        withTiming(1, {
          duration: 800,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
      );
      return;
    }

    cancelAnimation(signalPulse);
    signalPulse.value = 0;
  }, [cardPosition, signalPulse]);

  // Button pulse animation
  useEffect(() => {
    const shouldGlow = screenState === 'input' && canWrite;

    if (shouldGlow) {
      buttonPulse.value = withRepeat(
        withTiming(1, {
          duration: 1600,
          easing: Easing.out(Easing.cubic),
        }),
        -1,
        false,
      );
      return;
    }

    cancelAnimation(buttonPulse);
    buttonPulse.value = 0;
  }, [screenState, buttonPulse, canWrite]);

  // Card animation for position guide
  useEffect(() => {
    if (screenState === 'sync' && syncState !== 'success') {
      cardPosition.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.8, { duration: 500 }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      );
      return;
    }

    cancelAnimation(cardPosition);
    cardPosition.value = 0;
  }, [screenState, cardPosition, syncState]);

  const topRingA = useAnimatedStyle(() => {
    const phase = syncPulse.value;
    const error = errorFlash.value;

    return {
      transform: [{ scale: 0.9 + phase * 1.3 + successBlast.value * 0.6 }],
      opacity: (1 - phase) * 0.55,
      borderColor: interpolateColor(error, [0, 1], [colors.accent, RED]),
    };
  });

  const topRingB = useAnimatedStyle(() => {
    const phase = (syncPulse.value + 0.25) % 1;
    const error = errorFlash.value;

    return {
      transform: [{ scale: 0.9 + phase * 1.3 + successBlast.value * 0.6 }],
      opacity: (1 - phase) * 0.45,
      borderColor: interpolateColor(error, [0, 1], [colors.accent, RED]),
    };
  });

  const topRingC = useAnimatedStyle(() => {
    const phase = (syncPulse.value + 0.5) % 1;
    const error = errorFlash.value;

    return {
      transform: [{ scale: 0.9 + phase * 1.3 + successBlast.value * 0.6 }],
      opacity: (1 - phase) * 0.35,
      borderColor: interpolateColor(error, [0, 1], [colors.accent, RED]),
    };
  });

  const buttonRing = useAnimatedStyle(() => {
    return {
      transform: [{ scale: 0.9 + buttonPulse.value * 0.8 }],
      opacity: (1 - buttonPulse.value) * 0.45,
    };
  });

  const cardAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: -220 * cardPosition.value }, // Move up toward antenna
      ],
    };
  });

  const signalPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: 1 + signalPulse.value * 0.5 }],
      opacity: 1 - signalPulse.value * 0.6,
    };
  });

  const resetToInput = useCallback(() => {
    setScreenState('input');
    setSyncState('idle');
    setSyncMessage('Ready to Wave');
    setErrorFix('');
    setIsBusy(false);
  }, []);

  const throwTagError = (type: TagCheckError): never => {
    const error = new Error(type);
    error.name = type;
    throw error;
  };

  const waitForTagOrTimeout = async (timeoutMs: number) => {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('TIMEOUT'));
      }, timeoutMs);
    });

    return Promise.race([NfcManager.getTag(), timeout]);
  };

  const ensureNtag215 = useCallback(async () => {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    setSyncState('searching');
    setSyncMessage(STATUS_MESSAGES['searching']);

    const tag = await waitForTagOrTimeout(5000);

    // Tag found
    setSyncState('found');
    setSyncMessage(STATUS_MESSAGES['found']);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Soft tick

    let capacity = tag?.maxSize;
    if (typeof capacity !== 'number') {
      try {
        const status = await NfcManager.ndefHandler.getNdefStatus();
        capacity = status.capacity;
      } catch {
        capacity = undefined;
      }
    }

    if (capacity !== NTAG215_CAPACITY) {
      throwTagError('INCOMPATIBLE');
    }
  }, []);

  const startProgramFlow = useCallback(async () => {
    if (!canWrite || isBusy) {
      return;
    }

    const target = normalizedUrl;
    setScreenState('sync');
    setSyncState('idle');
    setSyncMessage(STATUS_MESSAGES['idle']);
    setIsBusy(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    try {
      await ensureNtag215();
      setSyncState('syncing');
      setSyncMessage(STATUS_MESSAGES['syncing']);

      const payload = Ndef.encodeMessage([Ndef.uriRecord(target)]);

      if (!payload) {
        throw new Error('Unable to build NDEF payload.');
      }

      await NfcManager.ndefHandler.writeNdefMessage(payload);

      // Success haptic (heavy)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      successBlast.value = withSequence(
        withTiming(1, { duration: 260, easing: Easing.out(Easing.exp) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.quad) }),
      );

      setSyncState('success');
      setSyncMessage(STATUS_MESSAGES['success']);
      setIsBusy(false);

      setTimeout(() => {
        setUrlInput('');
        resetToInput();
      }, 2000);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const cause = error instanceof Error ? error.name || error.message : '';
      const errorType = (cause as TagCheckError) || 'TIMEOUT';
      const errorInfo = ERROR_FIXES[errorType] || ERROR_FIXES['TIMEOUT'];

      setSyncState('error');
      setIsBusy(false);
      setSyncMessage(errorInfo.label);
      setErrorFix(errorInfo.fix);

      errorFlash.value = withSequence(
        withTiming(1, { duration: 130 }),
        withTiming(0, { duration: 300 }),
      );
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {
        // Ignore cleanup errors
      });
    }
  }, [canWrite, isBusy, normalizedUrl, resetToInput, successBlast, errorFlash, ensureNtag215]);

  // No NFC Support Screen
  if (!nfcSupported) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Text style={[styles.title, { marginBottom: 20 }]}>NFC Not Available</Text>
          <Text
            style={[
              styles.cardDesc,
              {
                textAlign: 'center',
                marginBottom: 40,
                lineHeight: 22,
              },
            ]}
            accessibilityRole="text"
          >
            Your device does not support NFC or it is currently disabled. Enable NFC in Settings and try again.
          </Text>
          <Pressable
            onPress={() => setScreenState('guide')}
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel="Return to guide"
            accessible
          >
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {screenState === 'guide' ? (
          <Animated.View
            entering={FadeIn.duration(500).easing(Easing.out(Easing.cubic))}
            style={styles.guideContainer}
            accessible
            accessibilityLabel="Guide to using Wave app"
            accessibilityRole="header"
          >
            <Text
              style={styles.title}
              accessibilityRole="header"
              accessibilityLabel="Wave app title"
            >
              WAVE
            </Text>
            <Text style={styles.subtitle}>PROGRAM YOUR NFC NETWORK CARD</Text>

            <View style={styles.gapContainer}>
              <View
                style={styles.card}
                accessible
                accessibilityRole="text"
                accessibilityLabel="Step 1: Prepare your NTAG215 card"
              >
                <View style={styles.cardNumber}>
                  <Text style={styles.cardNumberText}>1</Text>
                </View>
                <Text style={styles.cardTitle}>PREPARE</Text>
                <Text style={styles.cardDesc}>
                  Ensure your NFC tag is handy.
                </Text>
                <Pressable
                  onPress={() => setShowCompatibleTags((prev) => !prev)}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Show compatible NFC tags for this device"
                >
                  <Text style={[styles.cardDesc, { color: colors.accent, marginTop: 6 }]}>Click here for versions that work on this device.</Text>
                </Pressable>
                {showCompatibleTags ? (
                  <Text style={[styles.cardDesc, { marginTop: 6 }]}>
                    Recommended: NTAG215. Also supported: NTAG216 and NTAG213.
                  </Text>
                ) : null}
              </View>

              <View
                style={styles.card}
                accessible
                accessibilityRole="text"
                accessibilityLabel="Step 2: Input your URL"
              >
                <View style={styles.cardNumber}>
                  <Text style={styles.cardNumberText}>2</Text>
                </View>
                <Text style={styles.cardTitle}>INPUT</Text>
                <Text style={styles.cardDesc}>
                  Copy your URL or use the Share function.
                </Text>
              </View>

              <View
                style={styles.card}
                accessible
                accessibilityRole="text"
                accessibilityLabel="Step 3: Wave to sync"
              >
                <View style={styles.cardNumber}>
                  <Text style={styles.cardNumberText}>3</Text>
                </View>
                <Text style={styles.cardTitle}>WAVE</Text>
                <Text style={styles.cardDesc}>
                  Hold the card to the top-back of your iPhone.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setScreenState('input')}
              style={styles.button}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Get started with Wave"
              accessibilityHint="Minimum touch target: 48x48 points"
            >
              <Text style={styles.buttonText}>GET STARTED</Text>
            </Pressable>
          </Animated.View>
        ) : screenState === 'input' ? (
          <View
            style={{
              flex: 1,
              paddingHorizontal: 24,
              paddingBottom: 40,
              paddingTop: 80,
            }}
            accessible
            accessibilityLabel="URL input screen"
            accessibilityRole="summary"
          >
            <View
              style={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: urlValidation.safetyLevel === 'warning' ? AMBER_WARNING : colors.borderLight,
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)',
                padding: 20,
              }}
            >
              <Text
                style={{
                  marginBottom: 12,
                  fontSize: 12,
                  fontWeight: '600',
                  letterSpacing: 2,
                  color: colors.textSecondary,
                }}
                accessible
                accessibilityRole="text"
              >
                URL
              </Text>
              <TextInput
                value={urlInput}
                onChangeText={(value) => setUrlInput(formatInput(value))}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholder="Target URL (e.g., LinkedIn)"
                placeholderTextColor={colors.textTertiary}
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)',
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.text,
                }}
                accessible
                accessibilityRole="text"
                accessibilityLabel="URL input field"
                accessibilityHint="Enter your LinkedIn profile or portfolio URL"
              />

              {/* Validation feedback */}
              {urlInput ? (
                <View style={{ marginTop: 12 }}>
                  {urlValidation.safetyLevel === 'trusted' ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>✓</Text>
                      <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '500' }}>Safety Verified</Text>
                    </View>
                  ) : urlValidation.safetyLevel === 'safe' ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>✓</Text>
                      <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '500' }}>URL Verified</Text>
                    </View>
                  ) : urlValidation.reason ? (
                    <Text style={{ color: AMBER_WARNING, fontSize: 12, fontWeight: '500' }}>
                      ⚠ {urlValidation.reason}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            <View style={{ marginTop: 'auto', alignItems: 'center', paddingBottom: 24 }}>
              {/* Button ring - color based on validity */}
              {urlInput && (
                <Animated.View
                  style={[
                    buttonRing,
                    {
                      position: 'absolute',
                      height: 176,
                      width: 176,
                      borderRadius: 88,
                      borderWidth: 1,
                      borderColor: isProceedWarning ? AMBER_WARNING : colors.accent,
                    },
                  ]}
                />
              )}

              <Pressable
                onPress={startProgramFlow}
                disabled={!canWrite || isBusy}
                style={{
                  height: 144,
                  width: 144,
                  borderRadius: 72,
                  borderWidth: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderColor: isProceedWarning ? AMBER_WARNING : canWrite ? colors.accent : isDark ? '#333' : '#ddd',
                  backgroundColor: isProceedWarning ? 'rgba(255,191,0,0.15)' : canWrite ? colors.accentGlow : isDark ? '#1a1a1a' : '#f0f0f0',
                  minHeight: 48,
                  minWidth: 48,
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Program NFC tag button"
                accessibilityHint={
                  isProceedWarning
                    ? 'Warning shown. Double-tap to proceed and program anyway.'
                    : canWrite
                      ? 'Double-tap to program your NFC card with the URL'
                      : 'Enter a valid URL to enable programming'
                }
                accessibilityState={{ disabled: !canWrite || isBusy }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: 'bold',
                    letterSpacing: 1.5,
                    color: isProceedWarning ? AMBER_WARNING : canWrite ? colors.accent : colors.textTertiary,
                  }}
                >
                  PROGRAM TAG
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              paddingHorizontal: 24,
              paddingTop: 48,
            }}
            accessible
            accessibilityLabel="NFC sync screen"
          >
            {/* Card Animation Visualization - Phone + Card Placement */}
            <View
              style={{
                position: 'relative',
                height: 420,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              {/* Phone outline (back view) */}
              <View
                style={{
                  position: 'absolute',
                  width: 100,
                  height: 200,
                  borderRadius: 24,
                  borderWidth: 2,
                  borderColor: colors.accent,
                  backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}
                accessible
                accessibilityLabel="iPhone back view"
                accessibilityHint="NFC antenna is located at the top"
              >
                {/* NFC Antenna indicator at top */}
                <View
                  style={{
                    marginTop: 16,
                    width: 50,
                    height: 6,
                    backgroundColor: colors.accent,
                    borderRadius: 3,
                    opacity: 0.7,
                  }}
                  accessible
                  accessibilityLabel="NFC antenna location"
                />

                {/* Signal beam glow - visible when card in sweet spot */}
                <Animated.View
                  style={[
                    signalPulseStyle,
                    {
                      position: 'absolute',
                      top: 12,
                      width: 60,
                      height: 8,
                      backgroundColor: colors.accent,
                      borderRadius: 4,
                      opacity: 0.5,
                    },
                  ]}
                  accessible
                  accessibilityLabel="Signal strength indicator"
                />

                {/* Phone camera cutout (visual reference) */}
                <View
                  style={{
                    marginTop: 'auto',
                    marginBottom: 16,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: isDark ? '#333' : '#ddd',
                    backgroundColor: isDark ? '#2a2a2a' : '#eee',
                  }}
                />
              </View>

              {/* Animated card on phone back */}
              <Animated.View
                style={[
                  cardAnimStyle,
                  {
                    position: 'absolute',
                    width: 70,
                    height: 110,
                    backgroundColor: isDark ? '#2a2a2a' : '#e0e0e0',
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: colors.accent,
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                  },
                ]}
                accessible
                accessibilityLabel="NFC card positioning animation"
              >
                <Text
                  style={{
                    color: colors.accent,
                    fontSize: 9,
                    fontWeight: 'bold',
                    letterSpacing: 1,
                  }}
                >
                  NTAG215
                </Text>
              </Animated.View>

              {/* Concentric detection rings */}
              <View
                style={{
                  position: 'absolute',
                  height: 240,
                  width: 240,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Animated.View
                  style={[
                    topRingA,
                    {
                      position: 'absolute',
                      height: 100,
                      width: 100,
                      borderRadius: 50,
                      borderWidth: 1,
                      borderColor: colors.accent,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    topRingB,
                    {
                      position: 'absolute',
                      height: 100,
                      width: 100,
                      borderRadius: 50,
                      borderWidth: 1,
                      borderColor: colors.accent,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    topRingC,
                    {
                      position: 'absolute',
                      height: 100,
                      width: 100,
                      borderRadius: 50,
                      borderWidth: 1,
                      borderColor: colors.accent,
                    },
                  ]}
                />

                <View
                  style={{
                    height: 32,
                    width: 32,
                    borderRadius: 16,
                    backgroundColor: colors.accent,
                  }}
                />
              </View>
            </View>

            {/* Instruction text */}
            <Text
              style={styles.subHeaderText}
              accessible
              accessibilityRole="text"
              accessibilityLabel="Touch instruction"
            >
              Align card with the top edge of your phone.
            </Text>

            {/* Status */}
            <Text
              style={{
                ...styles.statusText,
                color: syncState === 'error' ? RED : colors.textSecondary,
              }}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`Status: ${syncMessage}`}
            >
              {syncMessage}
            </Text>

            {/* Error fix suggestion */}
            {syncState === 'error' && errorFix ? (
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: '500',
                  lineHeight: 18,
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`Suggestion: ${errorFix}`}
              >
                {errorFix}
              </Text>
            ) : null}

            {/* Try Again button */}
            {syncState !== 'success' ? (
              <Pressable
                onPress={resetToInput}
                disabled={isBusy}
                style={{
                  marginTop: 32,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  minHeight: 44,
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Try again button"
                accessibilityState={{ disabled: isBusy }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    letterSpacing: 2,
                    color: colors.accent,
                  }}
                >
                  TRY AGAIN
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
