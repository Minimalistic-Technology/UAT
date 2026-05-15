import { Schema, model } from 'mongoose';

/**
 * SiteSetting — Global admin-controlled settings (singleton document)
 * autoApprovePost: true  = posts go live immediately
 * autoApprovePost: false = posts need admin approval before going live
 */
const SiteSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    autoApprovePost: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model('SiteSetting', SiteSettingSchema);
