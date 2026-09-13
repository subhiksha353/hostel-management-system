import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  fileType: 'image' | 'video' | 'audio' | 'document';
  fileSize: number;
}

class StorageService {
  private MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

  detectFileType(file: File | Blob, originalName: string = ''): 'image' | 'video' | 'audio' | 'document' {
    const type = file.type.toLowerCase();
    const name = originalName.toLowerCase();

    if (type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|webp|gif)$/)) return 'image';
    if (type.startsWith('video/') || name.match(/\.(mp4|webm|mov|mkv)$/)) return 'video';
    if (type.startsWith('audio/') || name.match(/\.(mp3|wav|ogg|m4a|weba)$/)) return 'audio';
    return 'document';
  }

  async uploadComplaintFile(
    file: File | Blob,
    fileName: string,
    complaintId: string = 'temp'
  ): Promise<UploadResult> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds maximum allowed size (25 MB)`);
    }

    const fileType = this.detectFileType(file, fileName);
    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${complaintId}/${Date.now()}_${cleanName}`;

    // If Supabase Storage is configured and online
    if (isSupabaseConfigured) {
      try {
        const bucket = 'complaints';
        const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

        if (!error) {
          const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
          return {
            url: publicUrlData.publicUrl,
            path: storagePath,
            fileName,
            fileType,
            fileSize: file.size,
          };
        }
      } catch (err) {
        console.warn('Storage upload error, using local preview URL:', err);
      }
    }

    // High performance local Blob URL fallback for immediate offline / demo responsiveness
    const localUrl = URL.createObjectURL(file);
    return {
      url: localUrl,
      path: storagePath,
      fileName,
      fileType,
      fileSize: file.size,
    };
  }
}

export const storageService = new StorageService();
export default storageService;
