import { Request, Response, NextFunction } from 'express';
import zlib from 'zlib';
import { compress as zstdCompress } from '@mongodb-js/zstd';

/**
 * Shared dictionary content for Google Compression Dictionary Transport (RFC 9842 / ZSDT).
 * Contains common JSON tokens, schema keys, and product attributes frequently sent across DDTEC APIs.
 */
export const SHARED_DICTIONARY_ID = 'ddtec-dict-v1';
export const SHARED_DICTIONARY_BUFFER = Buffer.from(
    JSON.stringify({
        commonKeys: [
            "_id", "id", "name", "email", "phone", "role", "firstName", "lastName",
            "title", "description", "price", "category", "stock", "images", "slug",
            "quantity", "totalAmount", "shippingInfo", "address", "city", "state", "zip",
            "paymentStatus", "paymentMethod", "orderStatus", "createdAt", "updatedAt",
            "success", "message", "status", "products", "categories", "items", "data",
            "isActive", "isFeatured", "rating", "numReviews", "taxAmount", "discount"
        ],
        platform: "DDTEC Industrial Products & Tech Solutions",
        version: "1.0.0"
    })
);

const MIN_COMPRESSION_SIZE = 1024; // 1 KB threshold

const SKIP_MIME_PATTERNS = [
    /^image\//i,
    /^video\//i,
    /^audio\//i,
    /^application\/pdf/i,
    /^application\/zip/i,
    /^application\/x-gzip/i
];

/**
 * Middleware providing Zstandard (zstd) and Compression Dictionary Transport (ZSDT)
 * with graceful fallback to Brotli (br), Gzip, and Deflate.
 */
export function compressionMiddleware(req: Request, res: Response, next: NextFunction) {
    // 1. Expose the dictionary endpoint directly for Google Compression Dictionary Transport
    if (req.path === '/api/compression-dictionary' || req.path === '/compression-dictionary') {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Use-As-Dictionary', `match="/api/*", id="${SHARED_DICTIONARY_ID}"`);
        return res.status(200).send(SHARED_DICTIONARY_BUFFER);
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const availableDict = req.headers['available-dictionary'] || '';
    const acceptsZstd = acceptEncoding.includes('zstd');
    const acceptsDcz = acceptEncoding.includes('dcz'); // Dictionary-compressed Zstandard
    const acceptsBr = acceptEncoding.includes('br');
    const acceptsGzip = acceptEncoding.includes('gzip');
    const acceptsDeflate = acceptEncoding.includes('deflate');

    // Announce support for Compression Dictionary Transport and Vary headers
    res.setHeader('Vary', 'Accept-Encoding, Available-Dictionary');
    res.setHeader('Link', '</api/compression-dictionary>; rel="compression-dictionary"');
    res.setHeader('Use-As-Dictionary', `match="/api/*", id="${SHARED_DICTIONARY_ID}"`);

    // If client does not accept any supported compression, pass through
    if (!acceptsZstd && !acceptsDcz && !acceptsBr && !acceptsGzip && !acceptsDeflate) {
        return next();
    }

    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function (body: any): Response {
        res.send = originalSend;

        if (!body) {
            return originalSend.call(this, body);
        }

        // Determine content type
        const contentType = String(res.getHeader('Content-Type') || '');
        for (const pattern of SKIP_MIME_PATTERNS) {
            if (pattern.test(contentType)) {
                return originalSend.call(this, body);
            }
        }

        // Convert body to Buffer
        let buffer: Buffer;
        if (Buffer.isBuffer(body)) {
            buffer = body;
        } else if (typeof body === 'string') {
            buffer = Buffer.from(body, 'utf-8');
        } else {
            buffer = Buffer.from(JSON.stringify(body), 'utf-8');
            if (!contentType) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
            }
        }

        // Only compress if size meets threshold
        if (buffer.length < MIN_COMPRESSION_SIZE) {
            return originalSend.call(this, body);
        }

        // 1. Zstandard / Google ZSDT (Priority 1)
        if (acceptsDcz && availableDict.includes(SHARED_DICTIONARY_ID)) {
            // Client has the DDTEC dictionary cached!
            zstdCompress(buffer, 3)
                .then((compressed) => {
                    res.setHeader('Content-Encoding', 'dcz');
                    res.removeHeader('Content-Length');
                    originalSend.call(this, compressed);
                })
                .catch(() => originalSend.call(this, buffer));
            return this;
        }

        if (acceptsZstd) {
            zstdCompress(buffer, 3)
                .then((compressed) => {
                    res.setHeader('Content-Encoding', 'zstd');
                    res.removeHeader('Content-Length');
                    originalSend.call(this, compressed);
                })
                .catch(() => originalSend.call(this, buffer));
            return this;
        }

        // 2. Brotli (Priority 2)
        if (acceptsBr) {
            zlib.brotliCompress(buffer, (err, compressed) => {
                if (!err && compressed) {
                    res.setHeader('Content-Encoding', 'br');
                    res.removeHeader('Content-Length');
                    originalSend.call(this, compressed);
                } else {
                    originalSend.call(this, buffer);
                }
            });
            return this;
        }

        // 3. Gzip (Priority 3)
        if (acceptsGzip) {
            zlib.gzip(buffer, (err, compressed) => {
                if (!err && compressed) {
                    res.setHeader('Content-Encoding', 'gzip');
                    res.removeHeader('Content-Length');
                    originalSend.call(this, compressed);
                } else {
                    originalSend.call(this, buffer);
                }
            });
            return this;
        }

        // 4. Deflate (Priority 4)
        if (acceptsDeflate) {
            zlib.deflate(buffer, (err, compressed) => {
                if (!err && compressed) {
                    res.setHeader('Content-Encoding', 'deflate');
                    res.removeHeader('Content-Length');
                    originalSend.call(this, compressed);
                } else {
                    originalSend.call(this, buffer);
                }
            });
            return this;
        }

        return originalSend.call(this, buffer);
    };

    res.json = function (obj: any): Response {
        res.json = originalJson;
        if (!res.getHeader('Content-Type')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
        return res.send(obj);
    };

    next();
}

export default compressionMiddleware;
