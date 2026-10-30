import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import EmployeeCard from '../components/EmployeeCard';

import {
  deleteEmployee,
  getApiErrorMessage,
  getEmployees,
} from '../services/api';

import type { Employee, RootStackParamList } from '../navigation/types';

type EmployeeListProps = NativeStackScreenProps<
  RootStackParamList,
  'EmployeeList'
>;

type ApiEmployee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: {
    department?: string;
    title?: string;
  };
};

function mapApiEmployee(user: ApiEmployee): Employee {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone || '',
    department: user.company?.department || 'Engineering',
    designation: user.company?.title || 'Employee',
  };
}

export default function EmployeeListScreen({
  navigation,
  route,
}: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState('');

  const LIMIT = 10;

  const loadEmployees = useCallback(async (refresh = false) => {
    try {
      setError('');

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getEmployees(LIMIT, 0);
      const mapped = response.users.map(mapApiEmployee);

      setEmployees(mapped);
      setTotal(response.total);
      setSkip(mapped.length);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const change = route.params?.change;

    if (!change) return;

    setEmployees(current => {
      if (change.type === 'add') {
        const exists = current.some(
          item => item.id === change.employee.id,
        );

        return exists
          ? current.map(item =>
              item.id === change.employee.id
                ? change.employee
                : item,
            )
          : [change.employee, ...current];
      }

      return current.map(item =>
        item.id === change.employee.id
          ? change.employee
          : item,
      );
    });

    navigation.setParams({ change: undefined });
  }, [route.params?.change, navigation]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter(employee =>
      [
        employee.name,
        employee.email,
        employee.phone,
        employee.department,
        employee.designation,
      ].some(value => value.toLowerCase().includes(query)),
    );
  }, [employees, search]);

  const loadMoreEmployees = async () => {
    if (loadingMore || loading || employees.length >= total) return;

    try {
      setLoadingMore(true);

      const response = await getEmployees(LIMIT, skip);
      const newEmployees = response.users.map(mapApiEmployee);

      setEmployees(current => [...current, ...newEmployees]);
      setSkip(current => current + newEmployees.length);
      setTotal(response.total);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = useCallback(async (employee: Employee) => {
    try {
      await deleteEmployee(employee.id);

      setEmployees(current =>
        current.filter(item => item.id !== employee.id),
      );

      setTotal(current => Math.max(current - 1, 0));

      Alert.alert('Success', 'Employee deleted successfully.');
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err));
    }
  }, []);

  const openEmployeeDetails = useCallback(
    (employee: Employee) => {
      navigation.navigate('EmployeeDetails', { employee });
    },
    [navigation],
  );

  const openEmployeeEdit = useCallback(
    (employee: Employee) => {
      navigation.navigate('EditEmployee', { employee });
    },
    [navigation],
  );

  const renderEmployee = useCallback(
    ({ item }: { item: Employee }) => (
      <EmployeeCard
        employee={item}
        onPress={openEmployeeDetails}
        onView={openEmployeeDetails}
        onEdit={openEmployeeEdit}
        onDelete={handleDelete}
      />
    ),
    [openEmployeeDetails, openEmployeeEdit, handleDelete],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading employees...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.listTopBar}>
        <View>
          <Text style={styles.pageTitle}>Employees</Text>
          <Text style={styles.listCount}>
            Showing {filteredEmployees.length} of {total}
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('AddEmployee')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email, department..."
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
        />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => loadEmployees(true)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={filteredEmployees}
        keyExtractor={item => item.id.toString()}
        renderItem={renderEmployee}
        contentContainerStyle={
          filteredEmployees.length === 0
            ? styles.emptyList
            : styles.listContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEmployees(true)}
          />
        }
        onEndReached={loadMoreEmployees}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>
                Loading more employees...
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {search.trim()
                ? 'No matching employees found'
                : 'No employees found'}
            </Text>

            <Text style={styles.emptySubtitle}>
              {search.trim()
                ? 'Try a different search.'
                : 'Pull to refresh or add an employee.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fb',
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 10,
  },
  listTopBar: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
  },
  listCount: {
    color: '#6b7280',
    marginTop: 3,
  },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  errorBox: {
    margin: 14,
    padding: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
  },
  errorText: {
    color: '#b91c1c',
  },
  retryButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listContainer: {
    padding: 14,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  emptySubtitle: {
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  footerLoader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});