
import React, { memo } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Employee } from '../types';

type EmployeeCardProps = {
  employee: Employee;
  onPress?: (employee: Employee) => void;
  onView?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
};

const EmployeeCard = memo(function EmployeeCard({
  employee,
  onPress,
  onView,
  onEdit,
  onDelete,
}: EmployeeCardProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${employee.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(employee),
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.details}
        onPress={() => (onPress ?? onView)?.(employee)}
        accessibilityRole="button"
      >
        <Text style={styles.name}>{employee.name}</Text>
        <Text style={styles.email}>{employee.email}</Text>
        {!!employee.department && (
          <Text style={styles.info}>{employee.department}</Text>
        )}
        {!!employee.designation && (
          <Text style={styles.info}>{employee.designation}</Text>
        )}
        
      </Pressable>

      <View style={styles.actions}>
        {!!onView && (
          <Pressable
            onPress={() => onView(employee)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>View</Text>
          </Pressable>
        )}
        {!!onEdit && (
          <Pressable
            onPress={() => onEdit(employee)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </Pressable>
        )}
        {!!onDelete && (
          <Pressable
            onPress={handleDelete}
            style={[styles.button, styles.deleteButton]}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  details: {
    gap: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#4B5563',
  },
  info: {
    fontSize: 14,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default EmployeeCard;
