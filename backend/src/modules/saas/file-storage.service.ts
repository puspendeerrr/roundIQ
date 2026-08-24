import { prisma } from '../../utils/prisma';

export interface StorageProvider {
  uploadFile(filename: string, buffer: Buffer): Promise<string>;
}

export class LocalFileStorageProvider implements StorageProvider {
  async uploadFile(filename: string, _buffer: Buffer): Promise<string> {
    return `/uploads/${filename}`;
  }
}

export class FileStorageService {
  private provider: StorageProvider = new LocalFileStorageProvider();

  async recordFileUpload(userId: string, filename: string, originalName: string, mimeType: string, sizeBytes: number, url: string) {
    return prisma.fileRecord.create({
      data: {
        userId,
        filename,
        originalName,
        mimeType,
        sizeBytes,
        url,
        provider: 'LOCAL',
      },
    });
  }

  async getUserFiles(userId: string) {
    return prisma.fileRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const fileStorageService = new FileStorageService();
