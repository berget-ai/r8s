/**
 * Error-ergonomics contract suite.
 *
 * Every developer-facing throw in r8s must answer three questions in its
 * message:
 *
 *   WHAT failed — the component + the instance name
 *   WHY it failed — which decision/config is missing
 *   HOW to fix it — a copy-pasteable `Fix:` snippet
 *
 * This suite pins that contract for the S3/Bucket/secrets mistake matrix —
 * the errors a developer hits when wiring object storage, backups, and
 * instance credentials. Messages are asserted with regexes covering all
 * three aspects (never a bare `toThrow`): a regression that turns an
 * actionable error into a cryptic one fails here.
 */
import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Database, Bucket, S3Provider } from '../src'
import { Matrix } from '../../matrix/src/index'
import { Supabase } from '../../supabase/src/index'
import { Outline } from '../../outline/src/index'
import { Eneo } from '../../eneo/src/index'
import { Nextcloud } from '../../nextcloud/src/index'
import { Forgejo } from '../../forgejo/src/index'

describe('error ergonomics — S3/Bucket surface', () => {
  it('<Bucket/> as Database backup without an S3Provider names the bucket, the provider, and a concrete Fix', () => {
    const el = jsx(Database, {
      name: 'api-db',
      backup: jsx(Bucket, { name: 'files' }),
    })
    // WHAT: the descriptor instance … WHY: nothing to derive from …
    // … HOW: Fix wrapping the consumer in the provider, snippet included.
    expect(() => render(el)).toThrow(
      /Bucket "files" cannot resolve its store config[\s\S]*no\s*\n\s*<S3Provider> in scope[\s\S]*Fix:[\s\S]*<S3Provider provider=[\s\S]*backup=\{<Bucket name="files" \/>\}/
    )
  })

  it('<Bucket name="a/b"/> rejects path separators, naming the offending name', () => {
    const el = jsx(Database, {
      name: 'api-db',
      backup: jsx(Bucket, { name: 'a/b' }),
    })
    // WHAT + WHY: the name and the rule it breaks … HOW: the safe form.
    expect(() => render(el)).toThrow(
      /Bucket name "a\/b" must be a single path segment without slashes or '\.\.' — it becomes the prefix under s3:\/\/<bucket>\//
    )
  })

  it('a partial <Bucket> override names exactly which store fields are missing', () => {
    const el = jsx(Database, {
      name: 'api-db',
      backup: jsx(Bucket, { name: 'x', endpoint: 'https://s3.example.com' }),
    })
    expect(() => render(el)).toThrow(
      /Bucket "x" cannot resolve its store config[\s\S]*Missing: bucket, credentialsSecret[\s\S]*Fix:[\s\S]*<Bucket name="x" bucket="…" endpoint="https:\/\/…" credentialsSecret="…" \/>/
    )
  })

  it('rendering <Bucket/> directly says it is a descriptor, not a renderable component, with a Fix', () => {
    expect(() => render(jsx(Bucket, { name: 'x' }))).toThrow(
      /Bucket is a descriptor, not a renderable component[\s\S]*Fix: pass it to consumers[\s\S]*backup=\{<Bucket name="x" \/>\}/
    )
  })

  it('<Database backup /> without a provider names the component, the missing S3 target, and the S3Provider wrap', () => {
    const el = jsx(Database, { name: 'api-db', backup: true })
    // WHAT + WHY … HOW: the exact S3Provider wrap snippet.
    expect(() => render(el)).toThrow(
      /Database "api-db" has backup configured without an S3 target[\s\S]*Fix: add an <S3Provider>[\s\S]*<S3Provider provider=\{<MinIO[^>]*>\}[\s\S]*<Database name="api-db" backup \/>/
    )
  })

  it('<Database /> without a provider demands the backup decision and shows the backup={false} escape hatch', () => {
    const el = jsx(Database, { name: 'api-db' })
    expect(() => render(el)).toThrow(
      /Database "api-db": backup is a required decision[\s\S]*no <S3Provider> in scope[\s\S]*Fix:[\s\S]*<S3Provider[\s\S]*backup=\{false\}/
    )
  })

  it('<Matrix database={{}}> without a provider points at the required backup decision', () => {
    expect(() => render(jsx(Matrix, { domain: 'example.com', database: {} }))).toThrow(
      /Matrix "matrix": database\.backup is a required decision[\s\S]*no <S3Provider> in scope[\s\S]*Fix:[\s\S]*database=\{\{ backup: false \}\}/
    )
  })

  it('Matrix backup:true without a provider names the missing S3 target', () => {
    expect(() =>
      render(jsx(Matrix, { domain: 'example.com', database: { backup: true } }))
    ).toThrow(
      /Matrix "matrix": backup needs an S3 target[\s\S]*Fix:[\s\S]*<S3Provider[\s\S]*backup=\{\{ destinationPath: 's3:\/\/backups\/matrix'/
    )
  })

  it('an S3Provider without credentialsSecret fails backup with the missing piece + secrets-backend/credentialsSecret fixes', () => {
    const el = jsx(S3Provider as never, {
      provider: { endpoint: 'https://rustfs:9000', bucket: 'infra' },
      children: jsx(Database, { name: 'api-db', backup: true }),
    })
    expect(() => render(el)).toThrow(
      /Database "api-db" has backup configured without backup credentials[\s\S]*Fix:[\s\S]*credentialsSecret: 'my-backup-creds'[\s\S]*secrets backend[\s\S]*backend: 'openbao'/
    )
  })
})

describe('error ergonomics — objectStorage derives from the S3Provider', () => {
  // Each entry omits the provider AND objectStorage; the pre-created secret
  // reference satisfies the instance-secrets decision first so the
  // objectStorage guidance is what surfaces.
  const cases: { component: string; instance: string; el: unknown }[] = [
    {
      component: 'Supabase',
      instance: 'backend',
      el: jsx(Supabase, {
        name: 'backend',
        backup: false,
        host: 'backend.example.com',
        jwtSecretsName: 'backend-jwt',
      }),
    },
    {
      component: 'Outline',
      instance: 'wiki',
      el: jsx(Outline, {
        name: 'wiki',
        backup: false,
        host: 'wiki.example.com',
        secretsName: 'wiki-secrets',
      }),
    },
    {
      component: 'Eneo',
      instance: 'eneo',
      el: jsx(Eneo, {
        name: 'eneo',
        backup: false,
        host: 'eneo.example.com',
        secretsName: 'eneo-secrets',
      }),
    },
    {
      component: 'Nextcloud',
      instance: 'cloud',
      el: jsx(Nextcloud, {
        name: 'cloud',
        backup: false,
        host: 'cloud.example.com',
        secretsName: 'cloud-secrets',
      }),
    },
  ]

  for (const { component, instance, el } of cases) {
    it(`${component} without a provider and without objectStorage: what/why/how all present`, () => {
      expect(() => render(el as never)).toThrow(
        new RegExp(
          // WHAT: component + instance …
          `${component} "${instance}" needs object storage` +
            // … WHY: neither a provider nor an explicit prop …
            '[\\s\\S]*no <S3Provider> in scope[\\s\\S]*no objectStorage prop' +
            // … HOW: both fixes, copy-pasteable.
            '[\\s\\S]*Fix: wrap the platform in an <S3Provider>[\\s\\S]*' +
            `<${component} name="${instance}" host="…" />` +
            '[\\s\\S]*or pass a <Bucket> descriptor[\\s\\S]*' +
            'objectStorage=\\{<Bucket name="…" bucket="…" endpoint="https://…" credentialsSecret="…" />\\}'
        )
      )
    })
  }
})

describe('error ergonomics — secrets surface', () => {
  it('Forgejo without a backend and without credentialsSecretName: what/why/how all present', () => {
    // The secretsRequiredError contract — asserted here for MESSAGE SHAPE
    // (what failed / why / how to fix); forgejo's own suite covers the
    // behavior around it.
    expect(() => render(jsx(Forgejo, { host: 'git.example.com' }))).toThrow(
      /Forgejo "forgejo" requires the instance credential bundle \(SECRET_KEY, INTERNAL_TOKEN, LFS_JWT_SECRET\)[\s\S]*Secrets must never be rendered as plaintext[\s\S]*Fix: configure a provisioning secrets backend[\s\S]*<Forgejo name="forgejo" \/>[\s\S]*credentialsSecretName: "forgejo-credentials"/
    )
  })
})
