import React, { useState } from 'react';
import {
ActivityIndicator,
KeyboardAvoidingView,
Platform,
Pressable,
SafeAreaView,
ScrollView,
StyleSheet,
Text,
TextInput,
View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
const { login } = useAuth();

const [username, setUsername] = useState('emilys');
const [password, setPassword] = useState('emilyspass');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleLogin = async () => {
if (!username.trim() || !password.trim()) {
setError('Please enter username and password.');
return;
}

try {
  setLoading(true);
  setError('');

  await login(username.trim(), password.trim());
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : 'Login failed. Please try again.',
  );
} finally {
  setLoading(false);
}

};

return (
<SafeAreaView style={styles.safeArea}>
<KeyboardAvoidingView
style={styles.flex}
behavior={Platform.OS === 'ios' ? 'padding' : undefined}
>
<ScrollView
       contentContainerStyle={styles.loginContainer}
       keyboardShouldPersistTaps="handled"
     >
<View style={styles.logoCircle}>
<Text style={styles.logoText}>E</Text>
</View>

      <Text style={styles.loginTitle}>Employee Hub</Text>
      <Text style={styles.loginSubtitle}>
        Sign in to manage employees
      </Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
        autoCapitalize="none"
        style={styles.input}
        editable={!loading}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        secureTextEntry
        style={styles.input}
        editable={!loading}
      />

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <Pressable
        style={[
          styles.primaryButton,
          loading && styles.disabledButton,
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Login</Text>
        )}
      </Pressable>

      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>Demo Login</Text>
        <Text style={styles.demoText}>Username: emilys</Text>
        <Text style={styles.demoText}>Password: emilyspass</Text>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>

);
}

const styles = StyleSheet.create({
safeArea: {
flex: 1,
backgroundColor: '#f8fafc',
},
flex: {
flex: 1,
},
loginContainer: {
flexGrow: 1,
justifyContent: 'center',
padding: 24,
},
logoCircle: {
width: 72,
height: 72,
borderRadius: 36,
backgroundColor: '#2563eb',
alignSelf: 'center',
alignItems: 'center',
justifyContent: 'center',
marginBottom: 20,
},
logoText: {
color: '#ffffff',
fontSize: 36,
fontWeight: 'bold',
},
loginTitle: {
fontSize: 28,
fontWeight: 'bold',
color: '#111827',
textAlign: 'center',
},
loginSubtitle: {
fontSize: 15,
color: '#6b7280',
textAlign: 'center',
marginTop: 8,
marginBottom: 32,
},
label: {
color: '#374151',
fontSize: 14,
fontWeight: '600',
marginBottom: 8,
marginTop: 12,
},
input: {
borderWidth: 1,
borderColor: '#d1d5db',
borderRadius: 10,
backgroundColor: '#ffffff',
paddingHorizontal: 14,
paddingVertical: 12,
fontSize: 16,
color: '#111827',
},
errorText: {
color: '#dc2626',
marginTop: 12,
},
primaryButton: {
backgroundColor: '#2563eb',
borderRadius: 10,
padding: 15,
alignItems: 'center',
justifyContent: 'center',
marginTop: 24,
minHeight: 50,
},
disabledButton: {
opacity: 0.6,
},
primaryButtonText: {
color: '#ffffff',
fontSize: 16,
fontWeight: 'bold',
},
demoBox: {
backgroundColor: '#eff6ff',
borderRadius: 10,
padding: 14,
marginTop: 24,
},
demoTitle: {
color: '#1d4ed8',
fontWeight: 'bold',
marginBottom: 8,
},
demoText: {
color: '#374151',
marginTop: 3,
},
});