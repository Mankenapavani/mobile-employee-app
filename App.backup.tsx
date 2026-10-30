import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Notifications from 'expo-notifications';
import EmployeeCard from './components/EmployeeCard';
import EmployeeForm from './components/EmployeeForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';


import {
  requestNotificationPermission,
  scheduleTestNotification,
} from './services/notifications';
import * as Device from 'expo-device';
import React, {
  useCallback,
  useEffect,
  useMemo,
    useRef,
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
  createNavigationContainerRef,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  AuthProvider,
  useAuth,
  } from './context/AuthContext';

import {
  createEmployee,
  deleteEmployee,
  getApiErrorMessage,
  getEmployee,
  getEmployees,
    syncPendingActions,
      getPendingActionCount,
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
        contentContainerStyle={styles.screenContainer}
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

          <Text style={styles.dashboardDescription}>
            Manage employee records using REST API operations.
          </Text>
        </View>

        <Pressable
          style={styles.menuCard}
          onPress={() => navigation.navigate('EmployeeList')}
        >
          <Text style={styles.menuIcon}>👨‍💼</Text>

          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>
              Employee List
            </Text>

            <Text style={styles.menuSubtitle}>
              View, edit and delete employees
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.menuCard}
          onPress={() => navigation.navigate('AddEmployee')}
        >
          <Text style={styles.menuIcon}>➕</Text>

          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>
              Add Employee
            </Text>

            <Text style={styles.menuSubtitle}>
              Create a new employee
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.menuCard}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.menuIcon}>👤</Text>

          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>
              Profile
            </Text>

            <Text style={styles.menuSubtitle}>
              View account and logout
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
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

 const handleDelete = useCallback(
  async (employee: Employee) => {
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
  },
  [],
);

  const openEmployeeDetails = useCallback(
  (employee: Employee) => {
    navigation.navigate('EmployeeDetails', {
      employee,
    });
  },
  [navigation],
);

const openEmployeeEdit = useCallback(
  (employee: Employee) => {
    navigation.navigate('EditEmployee', {
      employee,
    });
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
  [
    openEmployeeDetails,
    openEmployeeEdit,
    handleDelete,
  ],
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

/* =========================================================
   PROFILE
========================================================= */



function ProfileScreen({ navigation }: ProfileProps) {
  const { user, updateProfile, logout } = useAuth();

  const [fullName, setFullName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<number | undefined>();
  const [selectingImage, setSelectingImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savingName, setSavingName] = useState(false);

  const IMAGE_STORAGE_KEY = '@employee_hub_profile_image';
  const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

    // Restore the saved profile image whenever Profile opens.
  useEffect(() => {
    let active = true;

    const loadProfileImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem(
          IMAGE_STORAGE_KEY,
        );

        if (active && savedImage) {
          setImageUri(savedImage);
        }
      } catch (error) {
        console.warn('Could not restore profile image:', error);
      }
    };

    void loadProfileImage();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const savedName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(' ');

    setFullName(savedName || user?.username || '');
  }, [user]);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.username ||
    'Employee User';

  const handleSaveName = async () => {
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }

    const nameParts = trimmedName.split(/\s+/);

    try {
      setSavingName(true);

      await updateProfile({
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
      });

      Alert.alert('Success', 'Your profile name has been saved.');
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error instanceof Error
          ? error.message
          : 'Could not save your profile name.',
      );
    } finally {
      setSavingName(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert(
          'Notification Test',
          'Native notifications must be tested on an Android or iOS device.',
        );
        return;
      }

      const granted = await requestNotificationPermission();

      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please allow notifications in your device settings.',
        );
        return;
      }

      await scheduleTestNotification();

      Alert.alert(
        'Notification Scheduled',
        'A test notification should appear in 2 seconds.',
      );
    } catch (error) {
      Alert.alert(
        'Notification Error',
        error instanceof Error
          ? error.message
          : 'Could not schedule the notification.',
      );
    }
  };

  



const selectImage = async (source: 'camera' | 'gallery') => {
  if (selectingImage || uploading) return;

  try {
    setSelectingImage(true);

    if (source === 'camera') {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access.',
        );
        return;
      }
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];

    await AsyncStorage.setItem(
      '@employee_hub_profile_image',
      asset.uri,
    );

    setImageUri(asset.uri);
    setImageSize(asset.fileSize);
    console.log('Selected image size in bytes:', asset.fileSize);
  } catch (error) {
    console.error('Image selection error:', error);

    Alert.alert(
      'Error',
      'Could not select the photo.',
    );
  } finally {
    setSelectingImage(false);
  }
};
const [selectedDocument, setSelectedDocument] =
  useState<DocumentPicker.DocumentPickerAsset | null>(null);

const [selectingDocument, setSelectingDocument] = useState(false);

const selectDocument = async () => {
  if (selectingDocument || uploading) return;

  try {
    setSelectingDocument(true);

    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const document = result.assets[0];

    setSelectedDocument(document);

    Alert.alert(
      'Document Selected',
      `File: ${document.name}\nSize: ${
        document.size !== undefined
          ? `${(document.size / 1024).toFixed(1)} KB`
          : 'Unknown'
      }`,
    );
  } catch (error) {
    console.error('Document selection error:', error);

    Alert.alert('Error', 'Could not select the document.');
  } finally {
    setSelectingDocument(false);
  }
};

const handleUpload = async () => {
  if (!imageUri || uploading) return;

  if (imageSize !== undefined && imageSize > 5 * 1024 * 1024) {
    const message = 'Image must be 5 MB or smaller.';

    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Image Too Large', message);
    }
    return;
  }

  try {
    setUploading(true);
    setUploadProgress(0);

    const { uploadProfileImage } = await import(
      './services/profileImage'
    );

    await uploadProfileImage(imageUri, imageSize, percentage => {
      setUploadProgress(percentage);
    });

    if (Platform.OS === 'web') {
  setTimeout(() => {
    window.alert('Profile image uploaded successfully.');
  }, 150);
} else {
  Alert.alert('Success', 'Profile image uploaded successfully.');
}
  } catch (error) {
    console.error('Profile image upload error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Something went wrong during upload.';

    if (Platform.OS === 'web') {
      window.alert(`Upload Failed\n\n${message}`);
    } else {
      Alert.alert('Upload Failed', message);
    }
  } finally {
    setUploading(false);
  }
};

const handleDocumentUpload = async () => {
  if (!selectedDocument || uploading) return;

  try {
    setUploading(true);

    const { uploadDocument } = await import(
      './services/documentUpload'
    );

    const result = await uploadDocument(
      selectedDocument.uri,
      selectedDocument.name,
      selectedDocument.mimeType,
      selectedDocument.size,
    );

    const message = `${result.message}\nFile: ${result.file.name}`;

    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Success', message);
    }

    console.log('Document upload result:', result);
  } catch (error) {
    console.error('Document upload error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Document upload failed. Please try again.';

    if (Platform.OS === 'web') {
      window.alert(`Upload Failed\n\n${message}`);
    } else {
      Alert.alert('Upload Failed', message);
    }
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
            onError={() => {
              console.warn('Profile image preview failed to load.');
            }}
          />
        ) : (
          <View style={styles.largeAvatar}>
            <Text style={styles.largeAvatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileRole}>Employee Hub</Text>

        <Text style={styles.label}>Edit Profile Name</Text>

        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          autoCapitalize="words"
          editable={!savingName}
        />

        <Pressable
          style={[
            styles.primaryButton,
            savingName && styles.disabledButton,
          ]}
          onPress={handleSaveName}
          disabled={savingName}
        >
          {savingName ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save Name</Text>
          )}
        </Pressable>

        <Text style={styles.profileHint}>
          Choose a photo for your employee profile.
        </Text>

        <View style={styles.profileActions}>
          <Pressable
            style={[
              styles.primaryButton,
              selectingImage && styles.disabledButton,
            ]}
            onPress={() => void selectImage('gallery')}
            disabled={selectingImage || uploading}
          >
            <Text style={styles.primaryButtonText}>
              Choose from Gallery
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.secondaryButton,
              selectingImage && styles.disabledButton,
            ]}
            onPress={() => void selectImage('camera')}
            disabled={selectingImage || uploading}
          >
            <Text style={styles.secondaryButtonText}>
              Take a Photo
            </Text>
          </Pressable>
                    <Pressable
            style={[
              styles.secondaryButton,
              (selectingDocument || uploading) &&
                styles.disabledButton,
            ]}
            onPress={() => void selectDocument()}
            disabled={selectingDocument || uploading}
          >
            {selectingDocument ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.secondaryButtonText}>
                Choose Document
              </Text>
            )}
          </Pressable>
          {selectedDocument && (
  <View
    style={{
      marginTop: 10,
      padding: 12,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
    }}
  >
    <Text style={{ color: '#222', fontWeight: 'bold' }}>
      Selected Document:
    </Text>

    <Text style={{ color: '#222', marginTop: 4 }}>
      {selectedDocument.name}
    </Text>

    <Text style={{ color: '#555', marginTop: 4 }}>
      Size:{' '}
      {selectedDocument.size !== undefined
        ? `${(selectedDocument.size / 1024).toFixed(1)} KB`
        : 'Unknown'}
    </Text>
  </View>
)}
{selectedDocument && (
  <Pressable
    style={[
      styles.primaryButton,
      uploading && styles.disabledButton,
    ]}
    onPress={() => void handleDocumentUpload()}
    disabled={uploading || selectingDocument}
  >
    {uploading ? (
      <ActivityIndicator color="#ffffff" />
    ) : (
      <Text style={styles.primaryButtonText}>
        Upload Document
      </Text>
    )}
  </Pressable>
)}

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
            (!imageUri || uploading || selectingImage) &&
              styles.disabledButton,
          ]}
          onPress={() => void handleUpload()}
          disabled={!imageUri || uploading || selectingImage}
        >
          {uploading ? (
            <View style={{ alignItems: 'center' }}>
              <ActivityIndicator color="#ffffff" />
              <Text style={styles.primaryButtonText}>
                Uploading {uploadProgress}%
              </Text>
            </View>
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
          style={styles.secondaryButton}
          onPress={() => void handleTestNotification()}
          disabled={uploading || selectingImage}
        >
          <Text style={styles.secondaryButtonText}>
            Test Notification
          </Text>
        </Pressable>

        <Pressable
          style={styles.primaryButton}
          onPress={() => void handleLogout()}
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
const navigationRef =
  createNavigationContainerRef<RootStackParamList>();
function AppNavigation() {
  const {
    isAuthenticated,
  } = useAuth();
    useEffect(() => {
    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const screen =
            response.notification.request.content.data
              ?.screen;

          if (
            screen === 'Home' &&
            navigationRef.isReady() &&
            isAuthenticated
          ) {
            navigationRef.navigate('Home');
          }
        },
      );

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  return (
    <NavigationContainer ref={navigationRef}>
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

function NetworkListener() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'failed'
  >('idle');
  const [pendingCount, setPendingCount] = useState(0);

  const wasOnline = useRef(false);
  const isSyncing = useRef(false);

  const runSync = useCallback(async () => {
    if (isSyncing.current) {
      return;
    }

    isSyncing.current = true;
    setSyncStatus('syncing');

    try {
      const count = await getPendingActionCount();
      setPendingCount(count);

      if (count === 0) {
        setSyncStatus('success');
        return;
      }

      const result = await syncPendingActions();

      setPendingCount(result.pending);
      setSyncStatus(
        result.pending > 0 ? 'failed' : 'success',
      );

      console.log('Sync result:', result);
    } catch (error) {
      console.warn('Sync failed:', error);
      setSyncStatus('failed');

      try {
        setPendingCount(await getPendingActionCount());
      } catch {
        // Keep the previous pending count if storage read fails.
      }
    } finally {
      isSyncing.current = false;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online =
        state.isConnected === true &&
        state.isInternetReachable !== false;

      setIsOnline(online);

      if (online && !wasOnline.current) {
        void runSync();
      }

      wasOnline.current = online;
    });

    return unsubscribe;
  }, [runSync]);

  if (isOnline === null) {
    return null;
  }

  if (!isOnline) {
    return (
      <View
        style={{
          backgroundColor: '#B91C1C',
          padding: 8,
        }}
      >
        <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
          Offline — saved data is available where cached.
        </Text>
      </View>
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <View
        style={{
          backgroundColor: '#DBEAFE',
          padding: 8,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <ActivityIndicator size="small" color="#1D4ED8" />
        <Text style={{ color: '#1D4ED8' }}>
          Syncing offline changes...
        </Text>
      </View>
    );
  }

  if (syncStatus === 'failed' || pendingCount > 0) {
    return (
      <View
        style={{
          backgroundColor: '#FEF3C7',
          padding: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#92400E', textAlign: 'center' }}>
          {pendingCount} change(s) pending sync.
        </Text>

        <Pressable
          onPress={() => void runSync()}
          style={{ padding: 6 }}
        >
          <Text style={{ color: '#92400E', fontWeight: '700' }}>
            Retry Sync
          </Text>
        </Pressable>
      </View>
    );
  }

  return null;
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
export default function App() {
  return (
    <AuthProvider>
      <NetworkListener />
      <AppNavigation />
    </AuthProvider>
  );
}