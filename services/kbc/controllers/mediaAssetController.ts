import { Request, Response } from 'express';
import cloudinary from '../userUtils/cloudinaryClient';
import { CloudMediaAssetModel } from '../models/CloudMediaAssetModel';
import stream from 'stream';

export const createSignedParams = async (req: Request, res: Response) => {
  const generateHls = req.query.hls === 'true';
  
  const signed = require('../userUtils/cloudinaryClient').getSignedUploadParams({
    eager: JSON.stringify(require('../userUtils/cloudinaryClient').buildEagerTransformations({ generateHls })),
  });

  res.json({ ok: true, signed });
};

export const uploadServerSide = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }

  try {
    const generateHls = req.query.hls === 'true';
    const eager = require('../userUtils/cloudinaryClient').buildEagerTransformations({ generateHls });

    const upload_stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        eager,
        eager_async: true,
        api_key: process.env.CLOUDINARY_API_KEY,        
        api_secret: process.env.CLOUDINARY_API_SECRET,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      },
      async (error: any, result: any) => {
        if (error) {
          console.error('Cloudinary upload error', error);
          res.status(500).json({ error: 'Upload failed', details: error });
          return;
        }

        const derived = (result.eager || []).map((d: any) => ({
          label: d.transformation?.[0]?.width ? `${d.transformation[0].width}w` : d.format || 'derived',
          width: d.width,
          height: d.height,
          url: d.secure_url || d.url,
          public_id: d.public_id,
          filesize: d.bytes,
        }));

        const thumbs = (result.eager || [])
          .filter((d: any) => (d.format || '').includes('jpg') || (d.format || '').includes('png'))
          .map((t: any) => ({ size: `${t.width}x${t.height}`, url: t.secure_url || t.url, public_id: t.public_id }));

        const doc = await CloudMediaAssetModel.create({
          cloudinaryId: result.public_id,
          originalUrl: result.secure_url || result.url,
          derived,
          thumbnails: thumbs,
          type: (result.resource_type || 'video') as any,
          mime: result.format,
          size: result.bytes,
          width: result.width,
          height: result.height,
          uploadedBy: req.body.uploadedBy || null,
        });

        res.json({ ok: true, result: doc });
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream.pipe(upload_stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err });
  }
};

export const getMediaById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const doc = await CloudMediaAssetModel.findById(id).lean();
  if (!doc) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({ ok: true, data: doc });
};

export const deleteMedia = async (req: Request, res: Response) => {
  const id = req.params.id;
  const soft = req.query.soft === 'true';
  const doc = await CloudMediaAssetModel.findById(id);
  if (!doc) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  if (soft) {
    doc.deleted = true;
    await doc.save();
    res.json({ ok: true, deleted: true });
    return;
  }

  try {
    await cloudinary.uploader.destroy(doc.cloudinaryId, { resource_type: 'auto' });
    await (doc as any).remove();
    res.json({ ok: true, deleted: true }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Deletion failed', details: err });
  }
};
