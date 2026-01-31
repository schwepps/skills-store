import type { JsonLdSchema } from '@/lib/schema';

interface JsonLdProps {
  /** Single schema or array of schemas to render */
  schema: JsonLdSchema | JsonLdSchema[];
}

/**
 * Component to inject JSON-LD structured data into pages
 *
 * @example
 * // Single schema
 * <JsonLd schema={generateOrganizationSchema()} />
 *
 * @example
 * // Multiple schemas
 * <JsonLd schema={[
 *   generateOrganizationSchema(),
 *   generateWebSiteSchema()
 * ]} />
 */
export function JsonLd({ schema }: JsonLdProps) {
  const schemas = Array.isArray(schema) ? schema : [schema];

  return (
    <>
      {schemas.map((s, index) => (
        <script
          key={`${s['@type']}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}
