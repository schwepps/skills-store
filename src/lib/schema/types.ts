/**
 * TypeScript types for JSON-LD structured data schemas
 * Based on Schema.org vocabulary
 */

/** Base JSON-LD context */
export interface JsonLdBase {
  '@context': 'https://schema.org';
  '@type': string;
}

/** Organization schema for homepage */
export interface OrganizationSchema extends JsonLdBase {
  '@type': 'Organization';
  name: string;
  description: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    url?: string;
  };
}

/** WebSite schema with SearchAction */
export interface WebSiteSchema extends JsonLdBase {
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

/** SoftwareApplication schema for skill pages */
export interface SoftwareApplicationSchema extends JsonLdBase {
  '@type': 'SoftwareApplication';
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  url: string;
  author?: {
    '@type': 'Person' | 'Organization';
    name: string;
  };
  version?: string;
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    ratingCount: number;
  };
  downloadUrl?: string;
  softwareRequirements?: string;
  keywords?: string;
}

/** BreadcrumbList schema for navigation */
export interface BreadcrumbListSchema extends JsonLdBase {
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

/** ItemList schema for skill catalogs */
export interface ItemListSchema extends JsonLdBase {
  '@type': 'ItemList';
  name?: string;
  description?: string;
  numberOfItems: number;
  itemListElement: ItemListElement[];
}

export interface ItemListElement {
  '@type': 'ListItem';
  position: number;
  item: {
    '@type': 'SoftwareApplication';
    name: string;
    description: string;
    url: string;
  };
}

/** Service schema for service pages */
export interface ServiceSchema extends JsonLdBase {
  '@type': 'Service';
  name: string;
  description: string;
  provider: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  serviceType?: string;
  areaServed?: string;
  availableChannel?: {
    '@type': 'ServiceChannel';
    serviceUrl: string;
    serviceType?: string;
  };
}

/** Union type for all supported schemas */
export type JsonLdSchema =
  | OrganizationSchema
  | WebSiteSchema
  | SoftwareApplicationSchema
  | BreadcrumbListSchema
  | ItemListSchema
  | ServiceSchema;
