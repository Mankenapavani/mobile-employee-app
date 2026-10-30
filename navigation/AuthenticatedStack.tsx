import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import EmployeeListScreen from '../screens/EmployeeListScreen';
import EmployeeDetailsScreen from '../screens/EmployeeDetailsScreen';
import AddEmployeeScreen from '../screens/AddEmployeeScreen';
import EditEmployeeScreen from '../screens/EditEmployeeScreen';
import ProfileScreen from '../screens/ProfileScreen';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AuthenticatedStack() {
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
    component={EmployeeListScreen}
    options={{ title: 'Employee List' }}
  />

  <Stack.Screen
    name="EmployeeDetails"
    component={EmployeeDetailsScreen}
    options={{ title: 'Employee Details' }}
  />

  <Stack.Screen
    name="AddEmployee"
    component={AddEmployeeScreen}
    options={{ title: 'Add Employee' }}
  />

  <Stack.Screen
    name="EditEmployee"
    component={EditEmployeeScreen}
    options={{ title: 'Edit Employee' }}
  />

  <Stack.Screen
    name="Profile"
    component={ProfileScreen}
    options={{ title: 'Profile' }}
  />
</Stack.Navigator>

);
}