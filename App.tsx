import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import {
NavigationContainer,
createNavigationContainerRef,
} from '@react-navigation/native';

import { AuthProvider, useAuth } from './context/AuthContext';
import AuthenticatedStack from './navigation/AuthenticatedStack';
import UnauthenticatedStack from './navigation/UnauthenticatedStack';
import type { RootStackParamList } from './navigation/types';
import {
getPendingActionCount,
syncPendingActions,
} from './services/api';

const navigationRef =
createNavigationContainerRef<RootStackParamList>();

function AppNavigation() {
const { isAuthenticated } = useAuth();

useEffect(() => {
const subscription =
Notifications.addNotificationResponseReceivedListener(
(response) => {
const screen =
response.notification.request.content.data?.screen;

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
    // Keep the previous pending count if storage is unavailable.
  }
} finally {
  isSyncing.current = false;
}

}, []);

useEffect(() => {
const unsubscribe = NetInfo.addEventListener((state) => {
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
<Text
style={{
color: '#FFFFFF',
textAlign: 'center',
}}
>
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
<Text
style={{
color: '#92400E',
textAlign: 'center',
}}
>
{pendingCount} change(s) pending sync.
</Text>

    <Pressable
      onPress={() => void runSync()}
      style={{ padding: 6 }}
    >
      <Text
        style={{
          color: '#92400E',
          fontWeight: '700',
        }}
      >
        Retry Sync
      </Text>
    </Pressable>
  </View>
);

}

return null;
}

export default function App() {
return (
<AuthProvider>
<NetworkListener />
<AppNavigation />
</AuthProvider>
);
}