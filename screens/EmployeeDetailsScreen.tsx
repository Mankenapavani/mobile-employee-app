import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  getApiErrorMessage,
  getEmployee,
} from '../services/api';
import type {
  Employee,
  RootStackParamList,
} from '../navigation/types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'EmployeeDetails'
>;

export default function EmployeeDetailsScreen({
  navigation,
  route,
}: Props) {
  const { employee } = route.params;
  const [employeeData, setEmployeeData] = useState<Employee>(employee);
  const [loading, setLoading] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getEmployee(employee.id);

      setEmployeeData({
        id: response.id,
        name: `${response.firstName} ${response.lastName}`,
        email: response.email,
        phone: response.phone || '',
        department: response.company?.department || 'Engineering',
        designation: response.company?.title || 'Employee',
      });
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [employee.id]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.detailsContainer}>
        <View style={styles.detailsAvatar}>
          <Text style={styles.detailsAvatarText}>
            {employeeData.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.detailsName}>{employeeData.name}</Text>
        <Text style={styles.detailsRole}>{employeeData.designation}</Text>

        {loading ? (
          <ActivityIndicator style={styles.detailsLoader} />
        ) : null}

        <View style={styles.detailsCard}>
          <DetailRow label="Email" value={employeeData.email} />
          <DetailRow
            label="Phone"
            value={employeeData.phone || 'Not available'}
          />
          <DetailRow
            label="Department"
            value={employeeData.department}
          />
          <DetailRow
            label="Designation"
            value={employeeData.designation}
          />
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate('EditEmployee', {
              employee: employeeData,
            })
          }
        >
          <Text style={styles.primaryButtonText}>Edit Employee</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>
            Back to Employee List
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  detailsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  detailsAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DCE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  detailsAvatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2457C5',
  },
  detailsName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#172033',
    textAlign: 'center',
  },
  detailsRole: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 5,
    marginBottom: 20,
  },
  detailsLoader: {
    marginBottom: 12,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    elevation: 2,
  },
  detailRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DCE2EA',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#172033',
    fontWeight: '500',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#2457C5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#E8EDF5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#26354D',
    fontSize: 15,
    fontWeight: '600',
  },
});