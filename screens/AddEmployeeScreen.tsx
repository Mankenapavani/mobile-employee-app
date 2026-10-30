import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import EmployeeForm from '../components/EmployeeForm';
import {
  createEmployee,
  getApiErrorMessage,
} from '../services/api';
import type {
  Employee,
  RootStackParamList,
} from '../navigation/types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'AddEmployee'
>;

export default function AddEmployeeScreen({
  navigation,
}: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !department.trim() ||
      !designation.trim()
    ) {
      Alert.alert('Validation', 'Please fill all fields.');
      return;
    }

    try {
      setLoading(true);

      const parts = name.trim().split(' ');
      const firstName = parts.shift() || '';
      const lastName = parts.join(' ') || 'Employee';

      const created = await createEmployee({
        firstName,
        lastName,
        email: email.trim(),
        phone: phone.trim(),
        company: {
          department: department.trim(),
          title: designation.trim(),
        },
      });

      const addedEmployee: Employee = {
        id: created.id,
        name: `${firstName} ${lastName}`.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim(),
        designation: designation.trim(),
      };

      navigation.popTo('EmployeeList', {
        change: {
          type: 'add',
          employee: addedEmployee,
        },
      });
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <EmployeeForm
        title="Add Employee"
        name={name}
        email={email}
        phone={phone}
        department={department}
        designation={designation}
        loading={loading}
        submitLabel="Save Employee"
        onNameChange={setName}
        onEmailChange={setEmail}
        onPhoneChange={setPhone}
        onDepartmentChange={setDepartment}
        onDesignationChange={setDesignation}
        onSubmit={handleAdd}
        onCancel={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
});