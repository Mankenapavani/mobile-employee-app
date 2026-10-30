import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type HomeProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

export default function HomeScreen({
  navigation,
}: HomeProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenContainer}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.pageTitle}>Employee Dashboard</Text>
          </View>

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardIcon}>👥</Text>
          <Text style={styles.dashboardTitle}>Employee Management</Text>
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
            <Text style={styles.menuTitle}>Employee List</Text>
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
            <Text style={styles.menuTitle}>Add Employee</Text>
            <Text style={styles.menuSubtitle}>Create a new employee</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.menuCard}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.menuIcon}>👤</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Profile</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  screenContainer: {
    padding: 20,
    paddingBottom: 40,
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
});