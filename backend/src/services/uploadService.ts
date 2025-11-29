import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  success: boolean;
  filename?: string;
  url?: string;
  error?: string;
}

class UploadService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), process.env.UPLOAD_PATH || 'uploads');
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists = () => {
    if (!fsSync.existsSync(this.uploadDir)) {
      fsSync.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`Created upload directory: ${this.uploadDir}`);
    }
  };

  public uploadEventImage = async (file: File, eventId: string): Promise<UploadResult> => {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        };
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size too large. Maximum size is 5MB.',
        };
      }

      // Generate unique filename
      const fileExtension = path.extname(file.name);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(this.uploadDir, uniqueFilename);

      // Save file to disk
      await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

      // Return the relative path for API response
      const relativePath = filePath.replace(process.cwd(), '');

      return {
        success: true,
        filename: uniqueFilename,
        url: `/uploads/${uniqueFilename}`,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: 'Failed to upload file. Please try again.',
      };
    }
  };

  public deleteFile = async (filename: string): Promise<UploadResult> => {
    try {
      const filePath = path.join(this.uploadDir, filename);
      await fs.unlink(filePath);
      
      return {
        success: true,
        filename,
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: 'Failed to delete file. Please try again.',
      };
    }
  };
}

export const uploadService = new UploadService();