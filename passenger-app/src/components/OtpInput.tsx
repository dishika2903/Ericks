import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useTheme, spacing, roundness, typography } from '../theme/theme';

interface OtpInputProps {
  length?: number;
  onCodeChanged: (code: string) => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({ length = 4, onCodeChanged }) => {
  const { theme } = useTheme();
  const [code, setCode] = useState<string[]>(new Array(length).fill(''));
  const inputsRef = useRef<TextInput[]>([]);

  const handleChangeText = (text: string, index: number) => {
    // Keep only numbers
    const cleanText = text.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = cleanText.substring(cleanText.length - 1); // Only keep last typed digit
    
    setCode(newCode);
    onCodeChanged(newCode.join(''));

    // Auto-focus next input
    if (cleanText && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    // Go to previous input on backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) inputsRef.current[index] = ref;
          }}
          style={[
            styles.input,
            {
              borderColor: digit ? theme.primary : theme.border,
              color: theme.text,
              backgroundColor: theme.surface,
            },
          ]}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignSelf: 'center',
    marginVertical: spacing.lg,
  },
  input: {
    ...typography.h2,
    width: 50,
    height: 55,
    borderWidth: 2,
    borderRadius: roundness.lg,
    textAlign: 'center',
  },
});
export default OtpInput;
