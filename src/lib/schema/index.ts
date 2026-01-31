/**
 * JSON-LD Schema utilities for SEO and GEO optimization
 *
 * These schemas help search engines and AI crawlers understand
 * the structure and content of Skills Store pages.
 */

// Types
export type {
  JsonLdSchema,
  OrganizationSchema,
  WebSiteSchema,
  SoftwareApplicationSchema,
  BreadcrumbListSchema,
  ItemListSchema,
  ServiceSchema,
} from './types';

// Schema generators
export { generateOrganizationSchema } from './organization';
export { generateWebSiteSchema } from './website';
export { generateSoftwareApplicationSchema, type SkillSchemaInput } from './software-application';
export {
  generateBreadcrumbSchema,
  generateSkillBreadcrumbs,
  generateRepoBreadcrumbs,
} from './breadcrumb';
export { generateItemListSchema, type SkillListItem } from './item-list';
