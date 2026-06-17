import React from "react";
import {
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandFacebook,
} from "@tabler/icons-react";
 
export interface SocialLinkConfig {
  key: "linkedin" | "twitter" | "facebook";
  icon: React.ReactNode;
  label: string;
}

export const SOCIAL_LINKS: SocialLinkConfig[] = [
  {
    key: "linkedin",
    icon: React.createElement(IconBrandLinkedin, { className: "h-4 w-4 text-slate-600" }),
    label: "LinkedIn Profile",
  },
  {
    key: "twitter",
    icon: React.createElement(IconBrandTwitter, { className: "h-4 w-4 text-slate-600" }),
    label: "Twitter Profile",
  },
  {
    key: "facebook",
    icon: React.createElement(IconBrandFacebook, { className: "h-4 w-4 text-slate-600" }),
    label: "Facebook Profile",
  },
];