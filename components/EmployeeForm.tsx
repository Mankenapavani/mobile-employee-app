
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type EmployeeFormProps = {
  title: string;
  hint?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  loading: boolean;
  submitLabel: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onDesignationChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function EmployeeForm({
  title,
  hint,
  name,
  email,
  phone,
  department,
  designation,
  loading,
  submitLabel,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onDepartmentChange,
  onDesignationChange,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{title}</Text>

        {hint ? <Text style={styles.hint}>{hint}</Text> : null}

        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={onNameChange}
          placeholder="Full name"
          autoCapitalize="words"
          style={styles.input}
          editable={!loading}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={onEmailChange}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          editable={!loading}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={onPhoneChange}
          placeholder="Phone"
          keyboardType="phone-pad"
          style={styles.input}
          editable={!loading}
        />

        <Text style={styles.label}>Department</Text>
        <TextInput
          value={department}
          onChangeText={onDepartmentChange}
          placeholder="Department"
          style={styles.input}
          editable={!loading}
        />

        <Text style={styles.label}>Designation</Text>
        <TextInput
          value={designation}
          onChangeText={onDesignationChange}
          placeholder="Designation"
          style={styles.input}
          editable={!loading}
        />

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[
              styles.button,
              styles.submitButton,
              loading && styles.disabled,
            ]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>{submitLabel}</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
  },
  hint: {
    color: '#6B7280',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  submitButton: {
    backgroundColor: '#2563EB',
  },
  cancelText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
