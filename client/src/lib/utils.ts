import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a file to base64 string
 * @param file File to convert
 * @returns Promise that resolves with the base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Validates an image file based on size and type
 * @param file File to validate
 * @param maxSize Maximum file size in MB
 * @returns Object with validation status and error message if any
 */
export function validateImageFile(file: File, maxSize: number = 5): { isValid: boolean; message?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      message: 'File must be an image (JPEG, PNG, GIF, WEBP)',
    };
  }

  // Check file size (in MB)
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSize) {
    return {
      isValid: false,
      message: `File size should not exceed ${maxSize}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Gets image dimensions
 * @param file Image file
 * @returns Promise that resolves with image width and height
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}
