import * as ImagePicker from 'expo-image-picker';
import * as Device from 'expo-device';
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
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  AuthProvider,
  useAuth,
} from './AuthContext';

import {
  createEmployee,
  deleteEmployee,
  getApiErrorMessage,
  getEmployee,
  getEmployees,
  updateEmployee,
  type Employee as ApiEmployee,
} from './services/api';

/* =========================================================
   TYPES
========================================================= */

type Employee = {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
};

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  EmployeeList: {
    change?: {
      type: 'add' | 'update';
      employee: Employee;
    };
  } | undefined;
  EmployeeDetails: {
    employee: Employee;
  };
  AddEmployee: undefined;
  EditEmployee: {
    employee: Employee;
  };
  Profile: undefined;
};

type LoginProps = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;

type HomeProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

type EmployeeListProps = NativeStackScreenProps<
  RootStackParamList,
  'EmployeeList'
>;

type EmployeeDetailsProps =
  NativeStackScreenProps<
    RootStackParamList,
    'EmployeeDetails'
  >;

type AddEmployeeProps =
  NativeStackScreenProps<
    RootStackParamList,
    'AddEmployee'
  >;

type EditEmployeeProps =
  NativeStackScreenProps<
    RootStackParamList,
    'EditEmployee'
  >;

type ProfileProps = NativeStackScreenProps<
  RootStackParamList,
  'Profile'
>;

const Stack =
  createNativeStackNavigator<RootStackParamList>();

/* =========================================================
   API MAPPER
========================================================= */

function mapApiEmployee(
  user: ApiEmployee,
): Employee {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone || '',
    department:
      user.company?.department ||
      'Engineering',
    designation:
      user.company?.title ||
      'Employee',
  };
}

/* =========================================================
   LOGIN
========================================================= */

function LoginScreen({}: LoginProps) {
  const { login } = useAuth();

  const [username, setUsername] =
    useState('emilys');

  const [password, setPassword] =
    useState('emilyspass');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleLogin = async () => {
    if (
      !username.trim() ||
      !password.trim()
    ) {
      setError(
        'Please enter username and password.',
      );
      return;
    }

    try {
      setLoading(true);
      setError('');

      await login(
        username.trim(),
        password.trim(),
      );
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
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.loginContainer
          }
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>
              E
            </Text>
          </View>

          <Text style={styles.loginTitle}>
            Employee Hub
          </Text>

          <Text style={styles.loginSubtitle}>
            Sign in to manage employees
          </Text>

          <Text style={styles.label}>
            Username
          </Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            autoCapitalize="none"
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
            style={styles.input}
            editable={!loading}
          />

          {error ? (
            <Text style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          <Pressable
            style={[
              styles.primaryButton,
              loading &&
                styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Login
              </Text>
            )}
          </Pressable>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>
              Demo Login
            </Text>

            <Text style={styles.demoText}>
              Username: emilys
            </Text>

            <Text style={styles.demoText}>
              Password: emilyspass
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   HOME
========================================================= */

function HomeScreen({
  navigation,
}: HomeProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={
          styles.screenContainer
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>
              Welcome back 👋
            </Text>

            <Text style={styles.pageTitle}>
              Employee Dashboard
            </Text>
          </View>

          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>
        </View>

        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardIcon}>
            👥
          </Text>

          <Text style={styles.dashboardTitle}>
            Employee Management
          </Text>

          <Text
            style={
              styles.dashboardDescription
            }
          >
            Manage employee records using
            REST API operations.
          </Text>
        </View>

        <Pressable
          style={styles.menuCard}
          onPress={() =>
            navigation.navigate(
              'EmployeeList',
            )
          }
        >
          <Text style={styles.menuIcon}>
            👨‍💼
          </Text>

          <View
            style={
              styles.menuTextContainer
            }
          >
            <Text style={styles.menuTitle}>
              Employee List
            </Text>

            <Text
              style={styles.menuSubtitle}
            >
              View, edit and delete employees
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </Pressable>

        <Pressable
          style={styles.menuCard}
          onPress={() =>
            navigation.navigate(
              'AddEmployee',
            )
          }
        >
          <Text style={styles.menuIcon}>
            ➕
          </Text>

          <View
            style={
              styles.menuTextContainer
            }
          >
            <Text style={styles.menuTitle}>
              Add Employee
            </Text>

            <Text
              style={styles.menuSubtitle}
            >
              Create a new employee
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </Pressable>

        <Pressable
          style={styles.menuCard}
          onPress={() =>
            navigation.navigate(
              'Profile',
            )
          }
        >
          <Text style={styles.menuIcon}>
            👤
          </Text>

          <View
            style={
              styles.menuTextContainer
            }
          >
            <Text style={styles.menuTitle}>
              Profile
            </Text>

            <Text
              style={styles.menuSubtitle}
            >
              View account and logout
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   EMPLOYEE LIST
========================================================= */

function EmployeeListScreen({
  navigation,
  route,
}: EmployeeListProps) {
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] =
    useState('');

  const [total, setTotal] =
    useState(0);

  const [skip, setSkip] =
    useState(0);

  const [search, setSearch] =
    useState('');

  const LIMIT = 10;

  const loadEmployees = useCallback(
    async (refresh = false) => {
      try {
        setError('');

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await getEmployees(
            LIMIT,
            0,
          );

        const mapped =
          response.users.map(
            mapApiEmployee,
          );

        setEmployees(mapped);
        setTotal(response.total);
        setSkip(mapped.length);
      } catch (err) {
        setError(
          getApiErrorMessage(err),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const change = route.params?.change;

    if (!change) {
      return;
    }

    setEmployees(current => {
      if (change.type === 'add') {
        const alreadyExists = current.some(
          item => item.id === change.employee.id,
        );

        return alreadyExists
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

    navigation.setParams({
      change: undefined,
    });
  }, [route.params?.change, navigation]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter(employee =>
      [
        employee.name,
        employee.email,
        employee.phone,
        employee.department,
        employee.designation,
      ].some(value =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [employees, search]);

  /*
    We intentionally do NOT reload automatically
    every time this screen gets focus.

    This keeps the edited employee visible after
    returning from Edit Employee.
  */

  const loadMoreEmployees = async () => {
    if (
      loadingMore ||
      loading ||
      employees.length >= total
    ) {
      return;
    }

    try {
      setLoadingMore(true);

      const response =
        await getEmployees(
          LIMIT,
          skip,
        );

      const newEmployees =
        response.users.map(
          mapApiEmployee,
        );

      setEmployees(current => [
        ...current,
        ...newEmployees,
      ]);

      setSkip(
        current =>
          current +
          newEmployees.length,
      );

      setTotal(response.total);
    } catch (err) {
      setError(
        getApiErrorMessage(err),
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = (
    employee: Employee,
  ) => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${employee.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmployee(
                employee.id,
              );

              setEmployees(
                current =>
                  current.filter(
                    item =>
                      item.id !==
                      employee.id,
                  ),
              );

              setTotal(
                current =>
                  Math.max(
                    current - 1,
                    0,
                  ),
              );

              Alert.alert(
                'Success',
                'Employee deleted successfully.',
              );
            } catch (err) {
              Alert.alert(
                'Error',
                getApiErrorMessage(err),
              );
            }
          },
        },
      ],
    );
  };

  const renderEmployee = ({
    item,
  }: {
    item: Employee;
  }) => (
    <View style={styles.employeeCard}>
      <Pressable
        style={styles.employeeMain}
        onPress={() =>
          navigation.navigate(
            'EmployeeDetails',
            {
              employee: item,
            },
          )
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View
          style={styles.employeeInfo}
        >
          <Text
            style={styles.employeeName}
          >
            {item.name}
          </Text>

          <Text
            style={styles.employeeRole}
          >
            {item.designation}
          </Text>

          <Text
            style={
              styles.employeeDepartment
            }
          >
            {item.department}
          </Text>

          <Text
            style={styles.employeeEmail}
          >
            {item.email}
          </Text>
        </View>
      </Pressable>

      <View
        style={styles.employeeActions}
      >
        <Pressable
          style={styles.viewButton}
          onPress={() =>
            navigation.navigate(
              'EmployeeDetails',
              {
                employee: item,
              },
            )
          }
        >
          <Text
            style={styles.viewButtonText}
          >
            View
          </Text>
        </Pressable>

        <Pressable
          style={styles.editButton}
          onPress={() =>
            navigation.navigate(
              'EditEmployee',
              {
                employee: item,
              },
            )
          }
        >
          <Text
            style={styles.editButtonText}
          >
            Edit
          </Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={() =>
            handleDelete(item)
          }
        >
          <Text
            style={
              styles.deleteButtonText
            }
          >
            Delete
          </Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.centerContainer
        }
      >
        <ActivityIndicator size="large" />

        <Text
          style={styles.loadingText}
        >
          Loading employees...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.listTopBar}>
        <View>
          <Text style={styles.pageTitle}>
            Employees
          </Text>

          <Text
            style={styles.listCount}
          >
            Showing {filteredEmployees.length} of{' '}
            {total}
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() =>
            navigation.navigate(
              'AddEmployee',
            )
          }
        >
          <Text
            style={styles.addButtonText}
          >
            + Add
          </Text>
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
          <Text
            style={styles.errorText}
          >
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() =>
              loadEmployees(true)
            }
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={filteredEmployees}
        keyExtractor={item =>
          item.id.toString()
        }
        renderItem={renderEmployee}
        contentContainerStyle={
          filteredEmployees.length === 0
            ? styles.emptyList
            : styles.listContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadEmployees(true)
            }
          />
        }
        onEndReached={
          loadMoreEmployees
        }
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View
              style={
                styles.footerLoader
              }
            >
              <ActivityIndicator />

              <Text
                style={
                  styles.loadingText
                }
              >
                Loading more employees...
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={styles.emptyTitle}
            >
              {search.trim()
                ? 'No matching employees found'
                : 'No employees found'}
            </Text>

            <Text
              style={
                styles.emptySubtitle
              }
            >
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

/* =========================================================
   EMPLOYEE DETAILS
========================================================= */

function EmployeeDetailsScreen({
  navigation,
  route,
}: EmployeeDetailsProps) {
  const { employee } =
    route.params;

  const [employeeData, setEmployeeData] =
    useState(employee);

  const [loading, setLoading] =
    useState(false);

  const loadDetails = async () => {
    try {
      setLoading(true);

      const response =
        await getEmployee(
          employee.id,
        );

      setEmployeeData(
        mapApiEmployee(response),
      );
    } catch (err) {
      Alert.alert(
        'Error',
        getApiErrorMessage(err),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [employee.id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={
          styles.detailsContainer
        }
      >
        <View style={styles.detailsAvatar}>
          <Text
            style={
              styles.detailsAvatarText
            }
          >
            {employeeData.name
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <Text
          style={styles.detailsName}
        >
          {employeeData.name}
        </Text>

        <Text
          style={styles.detailsRole}
        >
          {employeeData.designation}
        </Text>

        {loading ? (
          <ActivityIndicator
            style={styles.detailsLoader}
          />
        ) : null}

        <View
          style={styles.detailsCard}
        >
          <DetailRow
            label="Email"
            value={
              employeeData.email
            }
          />

          <DetailRow
            label="Phone"
            value={
              employeeData.phone ||
              'Not available'
            }
          />

          <DetailRow
            label="Department"
            value={
              employeeData.department
            }
          />

          <DetailRow
            label="Designation"
            value={
              employeeData.designation
            }
          />
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate(
              'EditEmployee',
              {
                employee:
                  employeeData,
              },
            )
          }
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            Edit Employee
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text
            style={
              styles.secondaryButtonText
            }
          >
            Back to Employee List
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   ADD EMPLOYEE
========================================================= */

function AddEmployeeScreen({
  navigation,
}: AddEmployeeProps) {
  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [department, setDepartment] =
    useState('');

  const [designation, setDesignation] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const handleAdd = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !department.trim() ||
      !designation.trim()
    ) {
      Alert.alert(
        'Validation',
        'Please fill all fields.',
      );
      return;
    }

    try {
      setLoading(true);

      const parts =
        name.trim().split(' ');

      const firstName =
        parts.shift() || '';

      const lastName =
        parts.join(' ') ||
        'Employee';

      const created = await createEmployee({
        firstName,
        lastName,
        email: email.trim(),
        phone: phone.trim(),
        company: {
          department:
            department.trim(),
          title:
            designation.trim(),
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
      Alert.alert(
        'Error',
        getApiErrorMessage(err),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.formContainer
          }
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>
            Add Employee
          </Text>

          <Text style={styles.label}>
            Name
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            style={styles.input}
          />

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>
            Phone
          </Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.label}>
            Department
          </Text>

          <TextInput
            value={department}
            onChangeText={setDepartment}
            placeholder="Department"
            style={styles.input}
          />

          <Text style={styles.label}>
            Designation
          </Text>

          <TextInput
            value={designation}
            onChangeText={
              setDesignation
            }
            placeholder="Designation"
            style={styles.input}
          />

          <View style={styles.buttonRow}>
            <Pressable
              style={
                styles.secondaryButton
              }
              onPress={() =>
                navigation.goBack()
              }
              disabled={loading}
            >
              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.primaryButton,
                styles.flexButton,
                loading &&
                  styles.disabledButton,
              ]}
              onPress={handleAdd}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color="#fff"
                />
              ) : (
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Save Employee
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   EDIT EMPLOYEE
========================================================= */

function EditEmployeeScreen({
  navigation,
  route,
}: EditEmployeeProps) {
  const { employee } =
    route.params;

  const [name, setName] =
    useState(employee.name);

  const [email, setEmail] =
    useState(employee.email);

  const [phone, setPhone] =
    useState(employee.phone);

  const [department, setDepartment] =
    useState(employee.department);

  const [designation, setDesignation] =
    useState(employee.designation);

  const [loading, setLoading] =
    useState(false);

  const handleUpdate = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !department.trim() ||
      !designation.trim()
    ) {
      Alert.alert(
        'Validation',
        'Please fill all fields.',
      );
      return;
    }

    try {
      setLoading(true);

      const parts =
        name.trim().split(' ');

      const firstName =
        parts.shift() || '';

      const lastName =
        parts.join(' ') ||
        'Employee';

      await updateEmployee(
        employee.id,
        {
          firstName,
          lastName,
          email: email.trim(),
          phone: phone.trim(),
          company: {
            department:
              department.trim(),
            title:
              designation.trim(),
          },
        },
      );

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
      Alert.alert(
        'Error',
        getApiErrorMessage(err),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.formContainer
          }
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>
            Edit Employee
          </Text>

          <Text style={styles.formHint}>
            Update the employee information
            below.
          </Text>

          <Text style={styles.label}>
            Name
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>
            Phone
          </Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.label}>
            Department
          </Text>

          <TextInput
            value={department}
            onChangeText={
              setDepartment
            }
            style={styles.input}
          />

          <Text style={styles.label}>
            Designation
          </Text>

          <TextInput
            value={designation}
            onChangeText={
              setDesignation
            }
            style={styles.input}
          />

          <View style={styles.buttonRow}>
            <Pressable
              style={
                styles.secondaryButton
              }
              onPress={() =>
                navigation.goBack()
              }
              disabled={loading}
            >
              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.primaryButton,
                styles.flexButton,
                loading &&
                  styles.disabledButton,
              ]}
              onPress={
                handleUpdate
              }
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color="#fff"
                />
              ) : (
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Update
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   PROFILE
========================================================= */


function ProfileScreen({ navigation }: ProfileProps) {
  const { logout } = useAuth();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectingImage, setSelectingImage] = useState(false);
  const [uploading, setUploading] = useState(false);

  const selectImage = async (source: 'camera' | 'gallery') => {
    try {
      setSelectingImage(true);

      if (source === 'camera') {
        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          if (!permission.canAskAgain) {
            Alert.alert(
              'Camera Permission Required',
              'Please enable camera access in your device settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => {
                    void Linking.openSettings();
                  },
                },
              ],
            );
          } else {
            Alert.alert(
              'Camera Permission Required',
              'Camera access is needed to take a profile photo. Please allow permission and try again.',
            );
          }

          return;
        }
      } else {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Gallery Permission Required',
            'Photo access is needed to choose a profile image. Please allow permission and try again.',
          );
          return;
        }
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

      if (result.canceled) {
        return;
      }

      const selectedAsset = result.assets?.[0];

      if (!selectedAsset?.uri) {
        Alert.alert(
          'Image Error',
          'No image was selected. Please try again.',
        );
        return;
      }

      setImageUri(selectedAsset.uri);
    } catch {
      Alert.alert(
        'Unable to Select Image',
        'Something went wrong. Please try again.',
      );
    } finally {
      setSelectingImage(false);
    }
  };

  const handleUpload = async () => {
    if (!imageUri) {
      Alert.alert(
        'Select an Image',
        'Choose a profile image before uploading.',
      );
      return;
    }

    try {
      setUploading(true);

      const { uploadProfileImage } =
        await import('./services/profileImage');

      await uploadProfileImage(imageUri);

      Alert.alert(
        'Upload Successful',
        'The demonstration upload request completed successfully.',
      );
    } catch (error) {
      Alert.alert(
        'Upload Failed',
        error instanceof Error
          ? error.message
          : 'Please try uploading again.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert(
        'Logout Error',
        'Unable to log out. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.profileContainer}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.largeAvatar}>
            <Text style={styles.largeAvatarText}>P</Text>
          </View>
        )}

        <Text style={styles.profileName}>Employee User</Text>
        <Text style={styles.profileRole}>Employee Hub</Text>

        <Text style={styles.profileHint}>
          Choose a photo for your employee profile.
        </Text>

        <View style={styles.profileActions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => selectImage('gallery')}
            disabled={selectingImage || uploading}
          >
            <Text style={styles.primaryButtonText}>
              Choose from Gallery
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => selectImage('camera')}
            disabled={selectingImage || uploading}
          >
            <Text style={styles.secondaryButtonText}>
              Take a Photo
            </Text>
          </Pressable>
        </View>

        {selectingImage ? (
          <ActivityIndicator
            style={styles.profileLoader}
            size="small"
          />
        ) : null}

        <Pressable
          style={[
            styles.primaryButton,
            (!imageUri || uploading) && styles.disabledButton,
          ]}
          onPress={handleUpload}
          disabled={!imageUri || uploading || selectingImage}
        >
          {uploading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              Upload Profile Image
            </Text>
          )}
        </Pressable>

        <View style={styles.profileCard}>
          <DetailRow label="Account" value="Active" />
          <DetailRow label="Application" value="Employee Hub" />
          <DetailRow label="Authentication" value="REST API" />

          <DetailRow
            label="Device"
            value={
              Device.deviceName ||
              Device.modelName ||
              'Device name unavailable'
            }
          />

          <DetailRow
            label="Operating System"
            value={
              [Device.osName, Device.osVersion]
                .filter(Boolean)
                .join(' ') || 'Unavailable'
            }
          />
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={handleLogout}
          disabled={uploading || selectingImage}
        >
          <Text style={styles.primaryButtonText}>Logout</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>
            Back to Home
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

/* =========================================================
   AUTHENTICATED STACK
========================================================= */

function AuthenticatedStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: 'center',
        headerBackTitle: 'Back',
        headerTintColor: '#111827',
        headerStyle: {
          backgroundColor: '#ffffff',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="EmployeeList"
        component={
          EmployeeListScreen
        }
        options={{
          title: 'Employee List',
        }}
      />

      <Stack.Screen
        name="EmployeeDetails"
        component={
          EmployeeDetailsScreen
        }
        options={{
          title: 'Employee Details',
        }}
      />

      <Stack.Screen
        name="AddEmployee"
        component={
          AddEmployeeScreen
        }
        options={{
          title: 'Add Employee',
        }}
      />

      <Stack.Screen
        name="EditEmployee"
        component={
          EditEmployeeScreen
        }
        options={{
          title: 'Edit Employee',
        }}
      />

      <Stack.Screen
        name="Profile"
        component={
          ProfileScreen
        }
        options={{
          title: 'Profile',
        }}
      />
    </Stack.Navigator>
  );
}

/* =========================================================
   UNAUTHENTICATED STACK
========================================================= */

function UnauthenticatedStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

function AppNavigation() {
  const {
    isAuthenticated,
  } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AuthenticatedStack />
      ) : (
        <UnauthenticatedStack />
      )}
    </NavigationContainer>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },

  flex: {
    flex: 1,
  },

  flexButton: {
    flex: 1,
  },

  loginContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },

  logoText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
  },

  loginTitle: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111827',
  },

  loginSubtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 28,
  },

  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  screenContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },

  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 20,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 10,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 20,
  },

  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.6,
  },

  errorText: {
    color: '#dc2626',
    marginTop: 10,
    fontSize: 14,
  },

  demoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    padding: 16,
    marginTop: 24,
  },

  demoTitle: {
    fontWeight: '800',
    color: '#1e40af',
    marginBottom: 8,
  },

  demoText: {
    color: '#374151',
    marginTop: 3,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  greeting: {
    color: '#6b7280',
    fontSize: 14,
  },

  pageTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
  },

  logoutButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  logoutText: {
    color: '#b91c1c',
    fontWeight: '700',
  },

  dashboardCard: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 22,
    marginBottom: 18,
  },

  dashboardIcon: {
    fontSize: 32,
  },

  dashboardTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 10,
  },

  dashboardDescription: {
    color: '#dbeafe',
    marginTop: 8,
    lineHeight: 21,
  },

  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  menuIcon: {
    fontSize: 28,
    width: 48,
  },

  menuTextContainer: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  menuSubtitle: {
    color: '#6b7280',
    marginTop: 4,
  },

  arrow: {
    fontSize: 28,
    color: '#9ca3af',
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

  listTopBar: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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

  listContainer: {
    padding: 14,
    paddingBottom: 30,
  },

  employeeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  employeeMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1d4ed8',
  },

  employeeInfo: {
    flex: 1,
    marginLeft: 12,
  },

  employeeName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  employeeRole: {
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 3,
  },

  employeeDepartment: {
    color: '#4b5563',
    marginTop: 2,
  },

  employeeEmail: {
    color: '#6b7280',
    marginTop: 3,
    fontSize: 13,
  },

  employeeActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },

  viewButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#6b7280',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },

  viewButtonText: {
    color: '#374151',
    fontWeight: '700',
  },

  editButton: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },

  editButtonText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: '#b91c1c',
    fontWeight: '700',
  },

  errorBox: {
    margin: 14,
    padding: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
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

  detailsContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  detailsAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  detailsAvatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1d4ed8',
  },

  detailsName: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
    marginTop: 14,
  },

  detailsRole: {
    textAlign: 'center',
    color: '#2563eb',
    marginTop: 5,
    fontWeight: '600',
  },

  detailsLoader: {
    marginTop: 16,
  },

  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginTop: 24,
  },

  detailRow: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  detailValue: {
    fontSize: 16,
    color: '#111827',
    marginTop: 4,
  },

  formHint: {
    color: '#6b7280',
    marginTop: 5,
    marginBottom: 4,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  profileContainer: {
    padding: 24,
    alignItems: 'center',
  },

  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },

  largeAvatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1d4ed8',
  },

  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 15,
  },

  profileRole: {
    color: '#6b7280',
    marginTop: 5,
  },

  profileCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginTop: 25,
  },
  profileImage: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: '#dbeafe',
  alignSelf: 'center',
},

profileHint: {
  color: '#6b7280',
  marginTop: 10,
  textAlign: 'center',
},

profileActions: {
  width: '100%',
  gap: 8,
  marginTop: 10,
},

profileLoader: {
  marginTop: 14,
},
});