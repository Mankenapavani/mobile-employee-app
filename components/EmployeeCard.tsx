
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

export type Employee = {
  id: number;
  name: string;
  role: string;
  email: string;
  initials: string;
  color: string;
  status: 'Active' | 'On Leave';
};

type EmployeeCardProps = {
  employee: Employee;
  allowDelete?: boolean;
  isDeletePending?: boolean;
  onRequestDelete?: (id: number) => void;
  onCancelDelete?: () => void;
  onConfirmDelete?: () => void;
};

export default function EmployeeCard({
  employee,
  allowDelete = false,
  isDeletePending = false,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: EmployeeCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: employee.color },
          ]}
        >
          <Text style={styles.initials}>
            {employee.initials}
          </Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.name}>
            {employee.name}
          </Text>

          <Text style={styles.role}>
            {employee.role}
          </Text>

          <Text style={styles.email}>
            {employee.email}
          </Text>

          <View
            style={[
              styles.statusBadge,
              employee.status === 'Active'
                ? styles.activeBadge
                : styles.leaveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                employee.status === 'Active'
                  ? styles.activeText
                  : styles.leaveText,
              ]}
            >
              {employee.status}
            </Text>
          </View>
        </View>

        {allowDelete && !isDeletePending && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${employee.name}`}
            style={styles.deleteButton}
            onPress={() => onRequestDelete?.(employee.id)}
          >
            <Text style={styles.deleteButtonText}>
              Delete
            </Text>
          </Pressable>
        )}
      </View>

      {allowDelete && isDeletePending && (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>
            Delete {employee.name}?
          </Text>

          <Text style={styles.confirmMessage}>
            Are you sure you want to remove this employee?
          </Text>

          <View style={styles.confirmActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={onCancelDelete}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={styles.confirmDeleteButton}
              onPress={onConfirmDelete}
            >
              <Text style={styles.confirmDeleteText}>
                Confirm Delete
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EAF2',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  details: {
    flex: 1,
  },
  name: {
    color: '#172B4D',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  role: {
    color: '#526581',
    fontSize: 13,
    marginBottom: 3,
  },
  email: {
    color: '#8491A5',
    fontSize: 12,
    marginBottom: 7,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E3F8EC',
  },
  leaveBadge: {
    backgroundColor: '#FFF1D6',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeText: {
    color: '#16834A',
  },
  leaveText: {
    color: '#A66B00',
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#D93636',
    fontSize: 12,
    fontWeight: '600',
  },
  confirmBox: {
    backgroundColor: '#FFF7F7',
    borderWidth: 1,
    borderColor: '#FFD6D6',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  confirmTitle: {
    color: '#172B4D',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5,
  },
  confirmMessage: {
    color: '#526581',
    fontSize: 12,
    marginBottom: 12,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#E9EDF4',
  },
  cancelText: {
    color: '#344563',
    fontSize: 12,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#D93636',
  },
  confirmDeleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});