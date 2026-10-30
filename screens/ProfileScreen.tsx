import React, { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import {
  requestNotificationPermission,
  scheduleTestNotification,
} from '../services/notifications';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, updateProfile, logout } = useAuth();

  const [fullName, setFullName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<number | undefined>();
  const [selectingImage, setSelectingImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savingName, setSavingName] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [selectingDocument, setSelectingDocument] = useState(false);

  const IMAGE_STORAGE_KEY = '@employee_hub_profile_image';
  const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

  useEffect(() => {
    let active = true;

    const loadProfileImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem(IMAGE_STORAGE_KEY);

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
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => void Linking.openSettings(),
              },
            ],
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

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];

      await AsyncStorage.setItem(IMAGE_STORAGE_KEY, asset.uri);

      setImageUri(asset.uri);
      setImageSize(asset.fileSize);

      console.log('Selected image size in bytes:', asset.fileSize);
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Could not select the photo.');
    } finally {
      setSelectingImage(false);
    }
  };

  const selectDocument = async () => {
    if (selectingDocument || uploading) return;

    try {
      setSelectingDocument(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]) return;

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

    if (imageSize !== undefined && imageSize > MAX_IMAGE_SIZE_BYTES) {
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
        '../services/profileImage'
      );

      const uploadedImageUrl = await uploadProfileImage(
  imageUri,
  imageSize,
  percentage => {
    setUploadProgress(percentage);
  },
);

await AsyncStorage.setItem(IMAGE_STORAGE_KEY, uploadedImageUrl);
setImageUri(uploadedImageUrl);

      if (Platform.OS === 'web') {
        window.alert('Profile image uploaded successfully.');
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
        '../services/documentUpload'
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
            <Text style={styles.secondaryButtonText}>Take a Photo</Text>
          </Pressable>

          <Pressable
            style={[
              styles.secondaryButton,
              (selectingDocument || uploading) && styles.disabledButton,
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
            <View style={styles.documentCard}>
              <Text style={styles.documentTitle}>
                Selected Document:
              </Text>
              <Text style={styles.documentName}>
                {selectedDocument.name}
              </Text>
              <Text style={styles.documentSize}>
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
            <View style={styles.uploadingContainer}>
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
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
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
    backgroundColor: '#f5f7fb',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
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
    width: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 10,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 10,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 20,
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  profileContainer: {
    padding: 24,
    alignItems: 'center',
    paddingBottom: 40,
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dbeafe',
    alignSelf: 'center',
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
  profileCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginTop: 25,
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
  documentCard: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  documentTitle: {
    color: '#222222',
    fontWeight: 'bold',
  },
  documentName: {
    color: '#222222',
    marginTop: 4,
  },
  documentSize: {
    color: '#555555',
    marginTop: 4,
  },
  uploadingContainer: {
    alignItems: 'center',
  },
});