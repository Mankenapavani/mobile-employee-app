
import { Platform } from 'react-native';

const UPLOAD_URL = 'https://httpbin.org/post';

export async function uploadProfileImage(
  uri: string,
): Promise<void> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const imageResponse = await fetch(uri);

    if (!imageResponse.ok) {
      throw new Error(
        'Could not read the selected image.',
      );
    }

    const imageBlob = await imageResponse.blob();

    formData.append(
      'file',
      imageBlob,
      'profile-image.jpg',
    );
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

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `Image upload failed (${response.status}).`,
    );
  }

  await response.json();
}