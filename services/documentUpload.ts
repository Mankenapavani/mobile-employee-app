const UPLOAD_BASE_URL =
  process.env.EXPO_PUBLIC_UPLOAD_API_URL ?? 'http://localhost:3000';

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface DocumentUploadResult {
  message: string;
  file: {
    name: string;
    savedName: string;
    size: number;
    url: string;
  };
}

export async function uploadDocument(
  uri: string,
  name: string,
  mimeType?: string | null,
  sizeBytes?: number,
): Promise<DocumentUploadResult> {
  if (sizeBytes !== undefined && sizeBytes > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error('Document must be 10 MB or smaller.');
  }

  const formData = new FormData();

  if (typeof window !== 'undefined' && uri.startsWith('blob:')) {
    const response = await fetch(uri);

    if (!response.ok) {
      throw new Error('Could not read the selected document.');
    }

    const blob = await response.blob();

    if (blob.size > MAX_DOCUMENT_SIZE_BYTES) {
      throw new Error('Document must be 10 MB or smaller.');
    }

    formData.append('file', blob, name);
  } else {
    formData.append(
      'file',
      {
        uri,
        name,
        type: mimeType || 'application/octet-stream',
      } as any,
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${UPLOAD_BASE_URL}/upload/document`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof result.message === 'string'
          ? result.message
          : `Document upload failed (${response.status}).`,
      );
    }

    return result as DocumentUploadResult;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Document upload timed out. Please try again.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}