import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';

type TabName = 'Home' | 'Team' | 'Tasks' | 'Profile' | 'Add Employee';

type Employee = {
  id: number;
  name: string;
  role: string;
  email: string;
  initials: string;
  color: string;
  status: 'Active' | 'On Leave';
};

const STORAGE_KEY = 'employeeHubEmployees';

const TASKS_STORAGE_KEY = 'employeeHubTasks';

const initialEmployees: Employee[] = [
  {
    id: 1,
    name: 'Ravi Kumar',
    role: 'Frontend Developer',
    email: 'ravi@example.com',
    initials: 'RK',
    color: '#DCEAFE',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'UI/UX Designer',
    email: 'priya@example.com',
    initials: 'PS',
    color: '#FCE7F3',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Arjun Reddy',
    role: 'Backend Developer',
    email: 'arjun@example.com',
    initials: 'AR',
    color: '#D1FAE5',
    status: 'On Leave',
  },
  {
    id: 4,
    name: 'Sneha Patel',
    role: 'QA Engineer',
    email: 'sneha@example.com',
    initials: 'SP',
    color: '#FEF3C7',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Kiran Rao',
    role: 'Product Manager',
    email: 'kiran@example.com',
    initials: 'KR',
    color: '#EDE9FE',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Ananya Reddy',
    role: 'Mobile Developer',
    email: 'ananya@example.com',
    initials: 'AR',
    color: '#FFE4D6',
    status: 'Active',
  },
];

const initialTasks = [
  {
    id: 1,
    title: 'Complete dashboard UI',
    project: 'Employee Hub',
    priority: 'High',
    done: false,
  },
  {
    id: 2,
    title: 'Review team feedback',
    project: 'Team Management',
    priority: 'Medium',
    done: false,
  },
  {
    id: 3,
    title: 'Update employee records',
    project: 'HR Operations',
    priority: 'Low',
    done: true,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('Home');

  // Load previously saved employees when the app starts.
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedEmployees =
          window.localStorage.getItem(STORAGE_KEY);

        if (savedEmployees !== null) {
          const parsedEmployees: unknown = JSON.parse(savedEmployees);

          if (Array.isArray(parsedEmployees)) {
            return parsedEmployees as Employee[];
          }
        }
      }
    } catch (error) {
      console.warn('Unable to load employees:', error);
    }

    return initialEmployees;
  });

  const [showAll, setShowAll] = useState(false);

  const [employeeName, setEmployeeName] = useState('');
  const [employeeRole, setEmployeeRole] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [searchText, setSearchText] = useState('');

  
const [tasks, setTasks] = useState(() => {
  try {
    if (typeof window !== 'undefined') {
      const savedTasks = window.localStorage.getItem(TASKS_STORAGE_KEY);

      if (savedTasks) {
        const parsedTasks: unknown = JSON.parse(savedTasks);

        if (Array.isArray(parsedTasks)) {
          return parsedTasks as typeof initialTasks;
        }
      }
    }
  } catch (error) {
    console.warn('Could not load saved tasks:', error);
  }

  return initialTasks;
});

  const [pendingDeleteId, setPendingDeleteId] =
    useState<number | null>(null);

  // Save the employee list whenever it changes.
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(employees)
        );
      }
    } catch (error) {
      console.warn('Unable to save employees:', error);
    }
  }, [employees]);

  const addEmployee = () => {
    if (
      !employeeName.trim() ||
      !employeeRole.trim() ||
      !employeeEmail.trim()
    ) {
      window.alert('Please fill in all employee details.');
return;
    }

    const newEmployee: Employee = {
      id: Date.now(),
      name: employeeName.trim(),
      role: employeeRole.trim(),
      email: employeeEmail.trim(),
      initials: employeeName
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      color: '#DCEAFE',
      status: 'Active',
    };

    setEmployees((previous) => [...previous, newEmployee]);

    setEmployeeName('');
    setEmployeeRole('');
    setEmployeeEmail('');
    setShowAll(true);
    setSearchText('');
    setActiveTab('Team');

    Alert.alert('Success', 'Employee added to your team!');
  };

  const confirmDelete = (employee: Employee) => {
    setPendingDeleteId(employee.id);
  };

  const deleteEmployee = () => {
    if (pendingDeleteId === null) return;

    setEmployees((previous) =>
      previous.filter(
        (employee) => employee.id !== pendingDeleteId
      )
    );

    setPendingDeleteId(null);
  };

  
const toggleTask = (taskId: number) => {
  setTasks((previous) => {
    const updatedTasks = previous.map((task) =>
      task.id === taskId
        ? { ...task, done: !task.done }
        : task
    );

    try {
      window.localStorage.setItem(
        TASKS_STORAGE_KEY,
        JSON.stringify(updatedTasks)
      );
    } catch (error) {
      console.warn('Could not save tasks:', error);
    }

    return updatedTasks;
  });
};

  const renderHeader = (title: string, subtitle: string) => (
    <View style={styles.pageHeader}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.eyebrow}>EMPLOYEE HUB</Text>
        <Text style={styles.pageTitle}>{title}</Text>
        <Text style={styles.pageSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.profileCircle}>
        <Text style={styles.profileInitial}>P</Text>
      </View>
    </View>
  );

  const renderEmployee = (
    employee: Employee,
    allowDelete = false
  ) => (
    <View key={employee.id}>
      <View style={styles.employeeRow}>
        <View
          style={[
            styles.employeeAvatar,
            { backgroundColor: employee.color },
          ]}
        >
          <Text style={styles.avatarText}>
            {employee.initials}
          </Text>
        </View>

        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>
            {employee.name}
          </Text>
          <Text style={styles.employeeRole}>
            {employee.role}
          </Text>
          <Text style={styles.employeeEmail}>
            {employee.email}
          </Text>
        </View>

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

        {allowDelete && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${employee.name}`}
            style={styles.deleteButton}
            onPress={() => confirmDelete(employee)}
          >
            <Text style={styles.deleteButtonText}>
              Delete
            </Text>
          </Pressable>
        )}
      </View>

      {allowDelete && pendingDeleteId === employee.id && (
        <View style={styles.confirmDeleteCard}>
          <Text style={styles.confirmDeleteTitle}>
            Delete this employee?
          </Text>

          <Text style={styles.confirmDeleteDescription}>
            {employee.name} will be removed from your team list.
          </Text>

          <View style={styles.confirmActions}>
            <Pressable
              style={styles.keepButton}
              onPress={() => setPendingDeleteId(null)}
            >
              <Text style={styles.keepButtonText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={styles.confirmDeleteButton}
              onPress={deleteEmployee}
            >
              <Text style={styles.confirmDeleteButtonText}>
                Confirm Delete
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );

  const renderHome = () => (
    <>
      {renderHeader(
        'Welcome back, Pavani!',
        'Here is your workspace overview.'
      )}

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>YOUR WORKSPACE</Text>

        <Text style={styles.heroTitle}>
          Good things happen when teams work together.
        </Text>

        <Text style={styles.heroDescription}>
          Keep track of your people, tasks and daily progress in one place.
        </Text>

        <Pressable
          style={styles.heroButton}
          onPress={() => setActiveTab('Team')}
        >
          <Text style={styles.heroButtonText}>
            Explore Team →
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>♧</Text>
          <Text style={styles.statNumber}>
            {employees.length}
          </Text>
          <Text style={styles.statLabel}>Employees</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✓</Text>
          <Text style={styles.statNumber}>
            {
              employees.filter(
                (employee) => employee.status === 'Active'
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>Active Members</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>◷</Text>
          <Text style={styles.statNumber}>
            {tasks
              .filter((task) => !task.done)
              .length.toString()
              .padStart(2, '0')}
          </Text>
          <Text style={styles.statLabel}>Open Tasks</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Team</Text>

        <Pressable onPress={() => setActiveTab('Team')}>
          <Text style={styles.linkText}>View Team →</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        {employees
          .slice(0, 3)
          .map((employee) => renderEmployee(employee))}
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => setActiveTab('Add Employee')}
      >
        <Text style={styles.primaryButtonText}>
          + Add Employee
        </Text>
      </Pressable>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeIcon}>💡</Text>

        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>
            A little reminder
          </Text>

          <Text style={styles.noticeDescription}>
            Small steps every day lead to meaningful progress.
          </Text>
        </View>
      </View>
    </>
  );

  const renderTeam = () => {
    const query = searchText.toLowerCase().trim();

    const filteredEmployees = employees.filter((employee) =>
      employee.name.toLowerCase().includes(query) ||
      employee.role.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query)
    );

    const visibleEmployees = showAll
      ? filteredEmployees
      : filteredEmployees.slice(0, 3);

    return (
      <>
        {renderHeader(
          'Our Team',
          'Meet the people behind the progress.'
        )}

        <View style={styles.teamSummary}>
          <View>
            <Text style={styles.summaryNumber}>
              {employees.length}
            </Text>
            <Text style={styles.summaryLabel}>
              Employees
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View>
            <Text style={styles.summaryNumber}>
              {
                employees.filter(
                  (employee) => employee.status === 'Active'
                ).length
              }
            </Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View>
            <Text style={styles.summaryNumber}>
              {
                employees.filter(
                  (employee) => employee.status === 'On Leave'
                ).length
              }
            </Text>
            <Text style={styles.summaryLabel}>On Leave</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Team Members
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Search name, role or email..."
          placeholderTextColor="#8993A7"
          value={searchText}
          onChangeText={setSearchText}
        />

        <View style={styles.card}>
          {visibleEmployees.map((employee) =>
            renderEmployee(employee, true)
          )}

          {filteredEmployees.length === 0 && (
            <Text style={styles.emptyText}>
              No employees found.
            </Text>
          )}
        </View>

        {filteredEmployees.length > 3 && (
          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              setShowAll((previous) => !previous)
            }
          >
            <Text style={styles.secondaryButtonText}>
              {showAll
                ? 'Show Less ↑'
                : 'View All Employees →'}
            </Text>
          </Pressable>
        )}

        <Pressable
          style={styles.primaryButton}
          onPress={() => setActiveTab('Add Employee')}
        >
          <Text style={styles.primaryButtonText}>
            + Add Employee
          </Text>
        </Pressable>

        <Text style={styles.helperText}>
          Employee details are saved in this browser on this device.
        </Text>
      </>
    );
  };

  const renderTasks = () => (
    <>
      {renderHeader(
        'My Tasks',
        'Stay focused and track your progress.'
      )}

      <View style={styles.taskSummaryCard}>
        <Text style={styles.taskSummaryTitle}>
          Your progress
        </Text>

        <Text style={styles.taskSummaryNumber}>
          {tasks.filter((task) => task.done).length} of{' '}
          {tasks.length} completed
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  tasks.length
                    ? (tasks.filter((task) => task.done).length /
                        tasks.length) *
                      100
                    : 0
                }%`,
              },
            ]}
          />
        </View>

        <Text style={styles.progressCaption}>
          Keep going! Every completed task counts.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Task List</Text>

      {tasks.map((task) => (
        <Pressable
          key={task.id}
          style={styles.taskCard}
          onPress={() => toggleTask(task.id)}
        >
          <View
            style={[
              styles.checkbox,
              task.done && styles.checkboxChecked,
            ]}
          >
            <Text style={styles.checkboxText}>
              {task.done ? '✓' : ''}
            </Text>
          </View>

          <View style={styles.taskInfo}>
            <Text
              style={[
                styles.taskTitle,
                task.done && styles.completedTaskTitle,
              ]}
            >
              {task.title}
            </Text>

            <Text style={styles.taskProject}>
              {task.project}
            </Text>

            <Text style={styles.taskHint}>
              {task.done
                ? 'Completed'
                : 'Tap to mark complete'}
            </Text>
          </View>

          <View
            style={[
              styles.priorityBadge,
              task.priority === 'High'
                ? styles.highPriority
                : task.priority === 'Medium'
                  ? styles.mediumPriority
                  : styles.lowPriority,
            ]}
          >
            <Text style={styles.priorityText}>
              {task.priority}
            </Text>
          </View>
        </Pressable>
      ))}
    </>
  );

  const renderProfile = () => (
    <>
      {renderHeader(
        'My Profile',
        'Your personal workspace information.'
      )}

      <View style={styles.profileCard}>
        <View style={styles.largeProfileCircle}>
          <Text style={styles.largeProfileInitial}>P</Text>
        </View>

        <Text style={styles.profileName}>Pavani</Text>
        <Text style={styles.profileRole}>
          Frontend Developer
        </Text>

        <View style={styles.profileStatus}>
          <View style={styles.onlineDot} />
          <Text style={styles.profileStatusText}>
            Active
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Personal Information
      </Text>

      <View style={styles.card}>
        {[
          ['Full Name', 'Pavani'],
          ['Department', 'Engineering'],
          ['Designation', 'Frontend Developer'],
          ['Employee ID', 'EMP-001'],
          ['Work Mode', 'Team Workspace'],
        ].map(([label, value], index, array) => (
          <View
            key={label}
            style={[
              styles.detailRow,
              index === array.length - 1 &&
                styles.lastDetailRow,
            ]}
          >
            <Text style={styles.detailLabel}>
              {label}
            </Text>
            <Text style={styles.detailValue}>
              {value}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeIcon}>🔒</Text>

        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>
            Profile preview
          </Text>

          <Text style={styles.noticeDescription}>
            These are sample profile details and are not connected to a real employee database.
          </Text>
        </View>
      </View>
    </>
  );

  const renderAddEmployee = () => (
    <>
      {renderHeader(
        'Add Employee',
        'Enter the details of a new team member.'
      )}

      <View style={styles.formCard}>
        <Text style={styles.formHeading}>
          Employee Information
        </Text>

        <Text style={styles.formDescription}>
          Fields marked below are required.
        </Text>

        <Text style={styles.fieldLabel}>
          Full Name *
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter employee name"
          placeholderTextColor="#8993A7"
          value={employeeName}
          onChangeText={setEmployeeName}
          autoCapitalize="words"
        />

        <Text style={styles.fieldLabel}>
          Job Role *
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Frontend Developer"
          placeholderTextColor="#8993A7"
          value={employeeRole}
          onChangeText={setEmployeeRole}
          autoCapitalize="words"
        />

        <Text style={styles.fieldLabel}>
          Email Address *
        </Text>

        <TextInput
          style={styles.input}
          placeholder="name@example.com"
          placeholderTextColor="#8993A7"
          value={employeeEmail}
          onChangeText={setEmployeeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Pressable
          style={styles.primaryButton}
          onPress={addEmployee}
        >
          <Text style={styles.primaryButtonText}>
            Save Employee
          </Text>
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          onPress={() => {
            setEmployeeName('');
            setEmployeeRole('');
            setEmployeeEmail('');
            setActiveTab('Team');
          }}
        >
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </>
  );

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return renderHome();

      case 'Team':
        return renderTeam();

      case 'Tasks':
        return renderTasks();

      case 'Profile':
        return renderProfile();

      case 'Add Employee':
        return renderAddEmployee();

      default:
        return renderHome();
    }
  };

  const tabs: { name: TabName; icon: string }[] = [
    { name: 'Home', icon: '⌂' },
    { name: 'Team', icon: '♧' },
    { name: 'Tasks', icon: '☑' },
    { name: 'Profile', icon: '○' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#101B35"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderScreen()}
      </ScrollView>

      <View style={styles.bottomNav}>
        {tabs.map((tab) => {
          const selected = activeTab === tab.name;

          return (
            <Pressable
              key={tab.name}
              style={styles.navItem}
              onPress={() => setActiveTab(tab.name)}
            >
              <Text
                style={[
                  styles.navIcon,
                  selected && styles.navIconSelected,
                ]}
              >
                {tab.icon}
              </Text>

              <Text
                style={[
                  styles.navLabel,
                  selected && styles.navLabelSelected,
                ]}
              >
                {tab.name}
              </Text>

              {selected && (
                <View style={styles.navIndicator} />
              )}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#637394',
    marginBottom: 7,
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#14213D',
  },
  pageSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#7A869F',
    marginTop: 5,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#315DCA',
  },
  heroCard: {
    backgroundColor: '#17294B',
    borderRadius: 22,
    padding: 22,
    marginBottom: 25,
  },
  heroLabel: {
    color: '#B9CBF5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 31,
  },
  heroDescription: {
    color: '#D0D9EC',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
  },
  heroButton: {
    alignSelf: 'flex-start',
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heroButtonText: {
    color: '#17294B',
    fontWeight: '800',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#17233D',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },
  statCard: {
    flex: 1,
    minHeight: 115,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9EDF5',
  },
  statIcon: {
    fontSize: 17,
    color: '#4569C8',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: '#17294B',
  },
  statLabel: {
    fontSize: 10,
    color: '#7B879D',
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    color: '#4169CE',
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E9EDF5',
    marginBottom: 18,
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F7',
    gap: 11,
  },
  employeeAvatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#23385F',
    fontWeight: '800',
    fontSize: 13,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    color: '#1C2943',
    fontSize: 13,
    fontWeight: '800',
  },
  employeeRole: {
    color: '#8791A5',
    fontSize: 11,
    marginTop: 4,
  },
  employeeEmail: {
    color: '#8791A5',
    fontSize: 10,
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: '#DDF8E8',
  },
  leaveBadge: {
    backgroundColor: '#FFF0D6',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  activeText: {
    color: '#16804A',
  },
  leaveText: {
    color: '#A76A12',
  },
  deleteButton: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#C62828',
    fontSize: 10,
    fontWeight: '800',
  },
  confirmDeleteCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#F5CACA',
    borderRadius: 12,
    padding: 13,
    marginBottom: 12,
  },
  confirmDeleteTitle: {
    color: '#922B2B',
    fontSize: 13,
    fontWeight: '800',
  },
  confirmDeleteDescription: {
    color: '#7A5252',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 9,
    marginTop: 12,
  },
  keepButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DCE5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  keepButtonText: {
    color: '#43516B',
    fontSize: 11,
    fontWeight: '700',
  },
  confirmDeleteButton: {
    backgroundColor: '#C62828',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  noticeCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF5D9',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  noticeIcon: {
    fontSize: 22,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    color: '#59451B',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 5,
  },
  noticeDescription: {
    color: '#806D42',
    fontSize: 12,
    lineHeight: 18,
  },
  teamSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#17294B',
    borderRadius: 18,
    paddingVertical: 22,
    marginBottom: 27,
  },
  summaryNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  summaryLabel: {
    color: '#C5D1E8',
    fontSize: 9,
    marginTop: 6,
    textAlign: 'center',
  },
  summaryDivider: {
    height: 36,
    width: 1,
    backgroundColor: '#405171',
  },
  primaryButton: {
    backgroundColor: '#315DCA',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#315DCA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#315DCA',
    fontSize: 13,
    fontWeight: '800',
  },
  helperText: {
    textAlign: 'center',
    color: '#8993A7',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE3EF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#17233D',
    fontSize: 13,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 22,
    color: '#7A869F',
  },
  taskSummaryCard: {
    backgroundColor: '#17294B',
    borderRadius: 18,
    padding: 20,
    marginBottom: 26,
  },
  taskSummaryTitle: {
    color: '#D4DEF1',
    fontSize: 12,
    fontWeight: '700',
  },
  taskSummaryNumber: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 9,
  },
  progressTrack: {
    height: 7,
    borderRadius: 5,
    backgroundColor: '#405171',
    marginTop: 17,
    overflow: 'hidden',
  },
  progressFill: {
    height: 7,
    borderRadius: 5,
    backgroundColor: '#8DDDB2',
  },
  progressCaption: {
    color: '#D4DEF1',
    fontSize: 11,
    marginTop: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EDF5',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    gap: 11,
  },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#BAC4D7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2D65D8',
    borderColor: '#2D65D8',
  },
  checkboxText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    color: '#1C2943',
    fontSize: 12,
    fontWeight: '800',
  },
  completedTaskTitle: {
    color: '#8993A7',
    textDecorationLine: 'line-through',
  },
  taskProject: {
    color: '#7F8AA0',
    fontSize: 11,
    marginTop: 4,
  },
  taskHint: {
    color: '#4269C6',
    fontSize: 10,
    marginTop: 5,
  },
  priorityBadge: {
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  highPriority: {
    backgroundColor: '#FDE2E2',
  },
  mediumPriority: {
    backgroundColor: '#FFF0D4',
  },
  lowPriority: {
    backgroundColor: '#DDF8E8',
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#49546A',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#17294B',
    borderRadius: 22,
    paddingVertical: 28,
    marginBottom: 27,
  },
  largeProfileCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#DCE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  largeProfileInitial: {
    color: '#315DCA',
    fontSize: 32,
    fontWeight: '800',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  profileRole: {
    color: '#C5D1E8',
    fontSize: 12,
    marginTop: 6,
  },
  profileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#294263',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 15,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8DDDB2',
  },
  profileStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F7',
    gap: 12,
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    color: '#7F8AA0',
    fontSize: 12,
  },
  detailValue: {
    color: '#1C2943',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    flexShrink: 1,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9EDF5',
    padding: 20,
  },
  formHeading: {
    color: '#17233D',
    fontSize: 18,
    fontWeight: '800',
  },
  formDescription: {
    color: '#7A869F',
    fontSize: 12,
    marginTop: 6,
    marginBottom: 22,
  },
  fieldLabel: {
    color: '#263653',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#EEF2FA',
  },
  cancelButtonText: {
    color: '#43516B',
    fontWeight: '700',
    fontSize: 13,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8ECF4',
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 53,
    position: 'relative',
  },
  navIcon: {
    color: '#98A2B5',
    fontSize: 23,
    marginBottom: 3,
  },
  navIconSelected: {
    color: '#315DCA',
  },
  navLabel: {
    color: '#98A2B5',
    fontSize: 10,
    fontWeight: '600',
  },
  navLabelSelected: {
    color: '#315DCA',
    fontWeight: '800',
  },
  navIndicator: {
    position: 'absolute',
    top: -10,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#315DCA',
  },
});