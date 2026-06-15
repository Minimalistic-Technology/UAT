export const rootTypeDefs = `#graphql
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

import { testimonialTypeDefs } from "./testimonial.typeDefs.js";
import { couponTypeDefs } from "./coupon.typeDefs.js";
import { planTypeDefs } from "./plan.typeDefs.js";

export const typeDefs = [rootTypeDefs, testimonialTypeDefs, couponTypeDefs, planTypeDefs];
