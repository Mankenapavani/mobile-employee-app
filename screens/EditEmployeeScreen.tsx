import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import EmployeeForm from '../components/EmployeeForm';
import {
  getApiErrorMessage,
  updateEmployee,
} from '../services/api';
import type {
  Employee,
  RootStackParamList,
} from '../navigation/types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'EditEmployee'
>;

export default function EditEmployeeScreen({
  navigation,
  route,
}: Props) {
  const { employee } = route.params;

  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email);
  const [phone, setPhone] = useState(employee.phone);
  const [department, setDepartment] = useState(employee.department);
  const [designation, setDesignation] = useState(employee.designation);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
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

      await updateEmployee(employee.id, {
        firstName,
        lastName,
        email: email.trim(),
        phone: phone.trim(),
        company: {
          department: department.trim(),
          title: designation.trim(),
        },
      });

      const updatedEmployee: Employee = {
        id: employee.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim(),
        designation: designation.trim(),
      };

      navigation.popTo('EmployeeList', {
        change: {
          type: 'update',
          employee: updatedEmployee,
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
        title="Edit Employee"
        hint="Update the employee information below."
        name={name}
        email={email}
        phone={phone}
        department={department}
        designation={designation}
        loading={loading}
        submitLabel="Update Employee"
        onNameChange={setName}
        onEmailChange={setEmail}
        onPhoneChange={setPhone}
        onDepartmentChange={setDepartment}
        onDesignationChange={setDesignation}
        onSubmit={handleUpdate}
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