import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaModule } from "./prisma.module";

// Repositories
import { PrismaFilesRepository } from "@/infra/database/repositories/prisma/prisma-files.repository";
import { FilesRepository } from "@/domain/storage/application/repositories/files.repository";

// Providers
import { GcpStorageProvider } from "@/infra/storage/providers/gcp-storage.provider";
import { FileValidatorProvider } from "@/infra/storage/providers/file-validator.provider";
import { SharpImageProcessorProvider } from "@/infra/storage/providers/sharp-image-processor.provider";
import { IStorageProvider } from "@/domain/storage/application/providers/storage.provider";
import { IFileValidatorProvider } from "@/domain/storage/application/providers/file-validator.provider";
import { IImageProcessorProvider } from "@/domain/storage/application/providers/image-processor.provider";

// Use Cases
import { UploadFileUseCase } from "@/domain/storage/application/use-cases/upload-file.use-case";
import { DeleteFileUseCase } from "@/domain/storage/application/use-cases/delete-file.use-case";
import { GetFileUrlUseCase } from "@/domain/storage/application/use-cases/get-file-url.use-case";

@Module({
    imports: [PrismaModule],
    providers: [
        // Repositories
        {
            provide: "FilesRepository",
            useClass: PrismaFilesRepository,
        },

        // Providers
        {
            provide: "StorageProvider",
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const bucketName = configService.get<string>("GCP_BUCKET_NAME");
                const keyFilePath = configService.get<string>("GCP_KEY_FILE_PATH");

                if (!bucketName) {
                    throw new Error("GCP_BUCKET_NAME environment variable is required");
                }

                return new GcpStorageProvider(bucketName, keyFilePath);
            },
        },
        {
            provide: "FileValidatorProvider",
            useClass: FileValidatorProvider,
        },
        {
            provide: "ImageProcessorProvider",
            useClass: SharpImageProcessorProvider,
        },

        // Use Cases
        {
            provide: "UploadFileUseCase",
            inject: ["FilesRepository", "StorageProvider", "FileValidatorProvider", "ImageProcessorProvider"],
            useFactory: (
                filesRepository: FilesRepository,
                storageProvider: IStorageProvider,
                fileValidator: IFileValidatorProvider,
                imageProcessor: IImageProcessorProvider,
            ) => new UploadFileUseCase(filesRepository, storageProvider, fileValidator, imageProcessor),
        },
        {
            provide: "DeleteFileUseCase",
            inject: ["FilesRepository", "StorageProvider"],
            useFactory: (filesRepository: FilesRepository, storageProvider: IStorageProvider) =>
                new DeleteFileUseCase(filesRepository, storageProvider),
        },
        {
            provide: "GetFileUrlUseCase",
            inject: ["FilesRepository", "StorageProvider"],
            useFactory: (filesRepository: FilesRepository, storageProvider: IStorageProvider) =>
                new GetFileUrlUseCase(filesRepository, storageProvider),
        },
    ],
    exports: [
        "FilesRepository",
        "StorageProvider",
        "FileValidatorProvider",
        "ImageProcessorProvider",
        "UploadFileUseCase",
        "DeleteFileUseCase",
        "GetFileUrlUseCase",
    ],
})
export class StorageSharedModule {}
