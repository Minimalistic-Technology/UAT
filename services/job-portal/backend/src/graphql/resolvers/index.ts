import { testimonialResolvers } from "./testimonial.resolvers.js";
import { couponResolvers } from "./coupon.resolvers.js";
import { planResolvers } from "./plan.resolvers.js";
import { companyResolvers } from "./company.resolvers.js";
import { applicationResolvers } from "./application.resolvers.js";
import { userResolvers } from "./user.resolvers.js";

export const resolvers = [
  testimonialResolvers,
  couponResolvers,
  planResolvers,
  companyResolvers,
  applicationResolvers,
  userResolvers,
];