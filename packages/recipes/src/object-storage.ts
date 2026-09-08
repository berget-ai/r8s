/**
 * Shared resolution for app packages' `objectStorage` prop — the same
 * declare-once-consumers-derive contract Database `backup` has had since
 * #115. Packages reference this helper instead of hand-writing the same
 * resolution block per app; the order and the guidance live in one place.
 */

import { isBucketElement, resolveBucket, type BucketProps, type S3Config } from './s3-provider'

/** The store triple every S3-consuming app package needs. */
export interface ObjectStorageStore {
  endpoint: string
  bucket: string
  credentialsSecret: string
}

/** A `<Bucket name="…" />` descriptor element (plain-struct shape). */
export interface ObjectStorageBucketDescriptor {
  type: unknown
  props: BucketProps
}

/**
 * The "omitted and nothing to derive from" guidance. Names the component
 * + instance (WHAT), the missing configuration (WHY), and shows both ways
 * out (HOW): wrap in an <S3Provider> so the prop can be omitted entirely,
 * or pass a <Bucket> descriptor with the full store config.
 */
export function objectStorageRequiredError(component: string, name: string, what: string): Error {
  return new Error(
    `${component} "${name}" needs object storage — ${what}.\n` +
      `\n` +
      `There is no <S3Provider> in scope and no objectStorage prop, so the ` +
      `component cannot know which endpoint/bucket/credentials to use.\n` +
      `\n` +
      `Fix: wrap the platform in an <S3Provider> — objectStorage then derives\n` +
      `from it and can be omitted entirely:\n` +
      `  <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>\n` +
      `    <${component} name="${name}" host="…" />\n` +
      `  </S3Provider>\n` +
      `\n` +
      `or pass a <Bucket> descriptor (its \`bucket\` selects the bucket, \`name\`` +
      ` is the logical scope):\n` +
      `  <${component} name="${name}" objectStorage={<Bucket name="…" bucket="…" endpoint="https://…" credentialsSecret="…" />} />`
  )
}

/**
 * Resolve an app package's `objectStorage` prop — resolution order:
 *
 * 1. Explicit config object → wins (unchanged behavior).
 * 2. `<Bucket name="…" />` descriptor → resolved against the surrounding
 *    provider. Storage-API-style consumers take a BUCKET NAME, not a
 *    prefixed path: the descriptor's `bucket` override selects the bucket
 *    and its `name` is only the logical scope (prefix) — it never reaches
 *    the consumer's bucket config.
 * 3. Omitted + `<S3Provider>` in scope → endpoint/bucket/credentials all
 *    derive from the provider.
 * 4. Omitted + no provider → throw with actionable guidance (both fixes).
 *
 * A derived store missing `credentialsSecret` (provider without one) is
 * special-cased like Database's backup-credentials guidance: the missing
 * piece is named with its fixes, instead of rendering a broken
 * secretKeyRef against a Secret that does not exist.
 *
 * @param component Component name for the error message (e.g. 'Supabase')
 * @param name Instance name for the error message
 * @param what One-line WHY text, e.g. 'the Storage API writes uploads and stored files to the bucket'
 * @param value The raw `objectStorage` prop (config object, <Bucket/> element, or undefined)
 * @param s3 The surrounding S3Provider config (useS3()), null without one
 */
export function resolveObjectStorage<T extends ObjectStorageStore>(
  component: string,
  name: string,
  what: string,
  value: T | ObjectStorageBucketDescriptor | undefined,
  s3: S3Config | null
): T {
  // 1. Explicit object → wins (unchanged behavior)
  if (value !== undefined && value !== null && !isBucketElement(value)) {
    if (typeof value === 'object' && 'type' in (value as Record<string, unknown>)) {
      throw new Error(
        `${component} "${name}": the objectStorage prop takes a <Bucket name="…" /> ` +
          `descriptor or a config object — got another component`
      )
    }
    return value
  }

  // 2. <Bucket/> descriptor — resolved against the surrounding provider.
  //    The consumer takes a bucket name, not the prefixed path the
  //    descriptor's `name` would produce (that is the logical scope only).
  if (isBucketElement(value)) {
    // resolveBucket already fails with actionable guidance when the store
    // config is incomplete (no provider + partial overrides).
    const resolved = resolveBucket(value, s3)
    return {
      endpoint: resolved.s3.endpoint,
      bucket: resolved.s3.bucket,
      credentialsSecret: resolved.s3.credentialsSecret,
    } as T
  }

  // 3. Omitted + S3Provider in scope → derive everything
  if (s3) {
    if (!s3.credentialsSecret) {
      throw new Error(
        `${component} "${name}": the <S3Provider> has no credentialsSecret — ` +
          `${what.replace(/^the /, 'the ')}.\n` +
          `\n` +
          `Fix: give the provider a credentials Secret (keys accessKey, secretKey):\n` +
          `  <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>\n` +
          `\n` +
          `or pass the Secret explicitly:\n` +
          `  <${component} name="${name}" objectStorage={{ endpoint: '…', bucket: '…', credentialsSecret: 'object-store-credentials' }} />`
      )
    }
    return {
      endpoint: s3.endpoint,
      bucket: s3.bucket,
      credentialsSecret: s3.credentialsSecret,
    } as T
  }

  // 4. Omitted + no provider → the actionable guidance
  throw objectStorageRequiredError(component, name, what)
}
