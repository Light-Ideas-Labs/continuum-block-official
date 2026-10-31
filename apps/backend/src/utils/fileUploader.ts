import express, { RequestHandler, Request } from "express";
import multer, { FileFilterCallback, StorageEngine } from "multer";

interface File extends Express.Multer.File {
    // Additional properties can be added here if needed
}

// Setup storage configurations
const ImageCoverfileStorage: StorageEngine = multer.diskStorage({});
const ImagefileStorage: StorageEngine = multer.diskStorage({});
const VideofileStorage: StorageEngine = multer.diskStorage({});
const pdffileStorage: StorageEngine = multer.diskStorage({});

// Define file filter functions with explicit types for request, file, and callback
const ImagefileFilter = (req: Request, file: File, cb: FileFilterCallback): void => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff'];
    const fileExtension = file.originalname.split('.').pop()!.toLowerCase();
    if (imageExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const VideofileFilter = (req: Request, file: File, cb: FileFilterCallback): void => {
    const videoExtensions = ['mp4', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'webm'];
    const fileExtension = file.originalname.split('.').pop()!.toLowerCase();
    if (videoExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const pdffileFilter = (req: Request, file: File, cb: FileFilterCallback): void => {
    const pdfExtensions = ['pdf'];
    const fileExtension = file.originalname.split('.').pop()!.toLowerCase();
    if (pdfExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const MB = 1024 * 1024;

// Multer instances for handling file uploads
const imageMulter: RequestHandler = multer({ storage: ImagefileStorage, fileFilter: ImagefileFilter, limits: { fileSize: 10 * MB } }).single('image');
const videoMulter: RequestHandler = multer({ storage: VideofileStorage, fileFilter: VideofileFilter, limits: { fileSize: 1024 * MB } }).single('video');
const pdfMulter: RequestHandler = multer({ storage: pdffileStorage, fileFilter: pdffileFilter, limits: { fileSize: 20 * MB } }).single('portfolio_pdf');

export { 
    imageMulter, 
    videoMulter, 
    pdfMulter
};
