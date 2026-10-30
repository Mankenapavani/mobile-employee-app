import { Platform } from 'react-native';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_UPLOAD_API_URL ?? 'http://localhost:3000';

const UPLOAD_URL = `${API_BASE_URL}/upload/image`;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

interface UploadResponse {
  message?: string;
  file?: {
    name: string;
    savedName: string;
    size: number;
    url: string;
  };
}

export async function uploadProfileImage(
  uri: string,
  fileSizeBytes?: number,
  onProgress?: (percentage: number) => void,
): Promise<string> {
  if (
    fileSizeBytes !== undefined &&
    fileSizeBytes > MAX_IMAGE_SIZE_BYTES
  ) {
    throw new Error('Image must be 5 MB or smaller.');
  }

  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(uri);

    if (!response.ok) {
      throw new Error('Could not read the selected image.');
    }

    const blob = await response.blob();

    if (blob.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('Image must be 5 MB or smaller.');
    }

    formData.append('file', blob, 'profile-image.jpg');
  } else {
    formData.append(
      'file',
      {
        uri,
        name: 'profile-image.jpg',
        type: 'image/jpeg',
      } as any,
    );
  }

  onProgress?.(0);

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('POST', UPLOAD_URL);
    xhr.timeout = 30000;

    xhr.upload.onprogress = event => {
      if (event.lengthComputable && event.total > 0) {
        onProgress?.(
          Math.min(
            99,
            Math.round((event.loaded / event.total) * 100),
          ),
        );
      }
    };

    xhr.onload = () => {
      let result: UploadResponse = {};

      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error('Invalid response received from the server.'));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(
          new Error(
            result.message ??
              `Image upload failed. Server returned status ${xhr.status}.`,
          ),
        );
        return;
      }

      if (
        result.message !== 'Image uploaded successfully.' ||
        !result.file?.url
      ) {
        reject(
          new Error('The server did not return the uploaded image URL.'),
        );
        return;
      }

      const imageUrl = `${API_BASE_URL.replace(/\/$/, '')}/${result.file.url.replace(/^\//, '')}`;

      onProgress?.(100);
      resolve(imageUrl);
    };

    xhr.onerror = () => {
      reject(
        new Error(
          'Cannot connect to the upload server. Check that the backend is running on port 3000.',
        ),
      );
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload timed out. Please try again.'));
    };

    xhr.onabort = () => {
      reject(new Error('Upload was cancelled.'));
    };

    xhr.send(formData);
  });
}