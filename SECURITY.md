# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them via
[GitHub private vulnerability reporting](https://github.com/berget-ai/r8s/security/advisories/new)
or by emailing **security@berget.ai**.

You should receive an acknowledgment within 48 hours. We will investigate all
legitimate reports and keep you informed of our progress. Once the issue is
resolved, we will publish a security advisory and credit you (unless you
prefer to remain anonymous).

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

Until r8s reaches 1.0, only the latest minor release receives security fixes.

## Scope

r8s generates Kubernetes manifests. Security issues typically fall into one of
these categories:

- **The r8s toolchain itself** (CLI, renderer, controllers) — e.g. code
  injection through component props, path traversal in the CLI, or unsafe
  handling of secrets in rendered output.
- **The in-cluster controllers** (`@r8s/r8s-controller`,
  `@r8s/flux-controller`) — e.g. privilege escalation or unsafe rendering of
  untrusted TSX.
- **Default configurations** — if a shipped component produces an insecure
  manifest by default (e.g. missing security context, overly broad RBAC),
  we treat that as a security issue.

Note that r8s components render third-party **operators** (cert-manager,
CloudNativePG, etc.). Vulnerabilities in those operators should be reported
upstream to the respective projects.

## Disclosure Policy

We follow coordinated disclosure: we ask that you give us reasonable time to
fix an issue before public disclosure. We aim to release fixes for confirmed
vulnerabilities within 14 days.
