import { Schema, model } from 'mongoose';

/**
 * SiteSetting — Global admin-controlled settings (singleton document)
 * autoApprovePost: true  = posts go live immediately
 * autoApprovePost: false = posts need admin approval before going live
 * resourceHubEnabled: true = Resource Hub link visible in Navbar
 * resourceHubEnabled: false = Resource Hub link hidden from Navbar
 */
const SiteSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    autoApprovePost: { type: Boolean, default: true },
    resourceHubEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model('SiteSetting', SiteSettingSchema);
