import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();



cloudinary.config({
cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
api_key: process.env.CLOUDINARY_API_KEY,
api_secret: process.env.CLOUDINARY_API_SECRET,
secure: true,
});


export const getSignedUploadParams = (overrides: Record<string, any> = {}) => {
const timestamp = Math.round(new Date().getTime() / 1000);
const paramsToSign: Record<string, any> = { timestamp, ...overrides };
const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);
return {
signature,
timestamp,
api_key: process.env.CLOUDINARY_API_KEY,
cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
params: paramsToSign,
};
};


export const buildEagerTransformations = (opts?: { generateHls?: boolean }) => {
const resolutions = [
{ label: '1080p', width: 1920 },
{ label: '720p', width: 1280 },
{ label: '480p', width: 854 },
{ label: '360p', width: 640 },
];


const videoEagers = resolutions.map((r) => ({
transformation: [{ width: r.width, crop: 'limit', quality: 'auto' }, { format: 'mp4' }],
format: 'mp4',
}));


const thumbs = [
{ width: 1280, height: 720, label: '1280x720' },
{ width: 320, height: 180, label: '320x180' },
].map((t) => ({
transformation: [{ width: t.width, height: t.height, crop: 'fill' }, { format: 'jpg' }],
format: 'jpg',
}));


const eager: any[] = [...videoEagers, ...thumbs];


if (opts?.generateHls) {
eager.push({
transformation: [{ streaming_profile: 'full_hd', format: 'm3u8' }],
format: 'm3u8',
});
}


return eager;
};


export const uploadStreamToCloudinary = (options: UploadApiOptions = {}) => {
const stream = cloudinary.uploader.upload_stream(options);
return stream;
};


export default cloudinary;