import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import authService from '../services/authService';

type VerifyOTPScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VerifyOTP'
>;

type VerifyOTPScreenRouteProp = RouteProp<RootStackParamList, 'VerifyOTP'>;

interface Props {
  navigation: VerifyOTPScreenNavigationProp;
  route: VerifyOTPScreenRouteProp;
}

export default function VerifyOTPScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOTP({ email, otp });
      if (response.success) {
        Alert.alert('Success', 'OTP verified successfully!');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to verify OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) {
      Alert.alert('Please wait', `You can resend OTP in ${cooldown} seconds`);
      return;
    }

    setResendLoading(true);
    try {
      const response = await authService.resendOTP(email);
      if (response.success) {
        Alert.alert('Success', 'OTP has been resent to your email');
        setCooldown(60);
      } else {
        Alert.alert('Error', response.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to resend OTP. Please try again.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {email}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleResendOTP}
        disabled={resendLoading || cooldown > 0}
      >
        {resendLoading ? (
          <ActivityIndicator color="#2ecc71" style={styles.resendButton} />
        ) : (
          <Text
            style={[
              styles.linkText,
              (cooldown > 0) && styles.linkTextDisabled,
            ]}
          >
            {cooldown > 0
              ? `Resend OTP (${cooldown}s)`
              : "Didn't receive the code? Resend"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2ecc71',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
  },
  button: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    color: '#2ecc71',
    marginTop: 20,
    fontSize: 14,
  },
  linkTextDisabled: {
    color: '#999',
  },
  resendButton: {
    marginTop: 20,
  },
});
