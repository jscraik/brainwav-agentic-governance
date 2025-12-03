<!--
file_path: "SECURITY.md"
description: "Cortex-OS security policy and vulnerability reporting guide"
maintainer: "@jamiescottcraik"
last_updated: "2025-11-18"
version: "1.2.0"
status: "governance"
license: "Apache 2.0"
-->

# Security Policy

[![Vulnerability Reporting](https://img.shields.io/badge/vulnerability-reporting-available-blue.svg)](#-reporting-vulnerabilities)

**Security-First AI Agent Development Platform**
_We take security seriously and appreciate responsible disclosure of vulnerabilities_

---

## 🛡️ Security Overview

Cortex-OS is built with security as a fundamental principle. Our Autonomous Software Behavior Reasoning (ASBR) runtime implements
comprehensive security measures to protect against common vulnerabilities and emerging AI/ML specific threats.

### Security Frameworks We Follow

- **🔒 OWASP Top-10 2021** - Web application security standards
- **🤖 OWASP LLM Top-10** - AI/ML specific security guidelines
- **🎯 MITRE ATLAS** - Adversarial Threat Landscape for Artificial-Intelligence Systems
- **🌐 NIST Cybersecurity Framework** - Risk management and security controls
- **🔐 SPIFFE/SPIRE** - Secure Production Identity Framework

### Supported Versions

Only the latest Cortex-OS release branch (and the `main` branch that feeds it) receives security fixes. If you are running an
older tag or fork, please upgrade before filing vulnerability reports so we can reproduce the issue in a supported build.

### Threat Model Focus Areas

- **Prompt / Task Injection** – Malicious prompts, manifests, or research notes could attempt to override guardrails. Core agents
  use immutable system prompts, phase gates, and schema validation to block unsanctioned mutations.
- **Tool Misuse** – Cortex-OS limits what executors can run by default (no shell access from oversight agents, tool allowlists,
  environment capability flags) and audits every tool call through Evidence Triplets.
- **Data Leakage** – When connectors or LLM providers are enabled, prompts may leave your environment. Do not send regulated data
  unless you control the upstream provider; disable `vibe_learn`/memory sync if logs must stay local.
- **Package / Service Impersonation** – Deploy only from this repository or the signed release artifacts. Verify tunnel
  configurations and LaunchAgents before loading external MCP servers.

### Prompt Security Controls

Cortex-OS implements comprehensive prompt security through structured schemas and explicit boundaries:

#### Determinism Controls

All system prompts include determinism controls that ensure consistent, predictable agent behavior:

- **Structured Output Schemas** – Every prompt specifies output format (JSON/XML/Markdown), required fields, and sections
- **Confidence Calibration** – Thresholds for uncertainty (low: 0.3, high: 0.7) with explicit prefixes for low-confidence outputs
- **Boundary Conditions** – Explicit refuse/escalate/require_approval lists for each prompt
- **Tool Affinity** – Prompts declare which tools they commonly invoke, enabling validation

```typescript
// Example: Prompt with security controls
{
  id: 'sys.n0-master',
  outputSchema: {
    type: 'structured',
    format: 'xml',
    sections: ['reasoning', 'action', 'next_steps'],
  },
  boundaries: {
    refuse: ['operations outside allow-list', 'budget overruns'],
    escalate: ['security-sensitive operations', 'destructive actions'],
  },
  confidenceCalibration: {
    low_threshold: 0.3,
    high_threshold: 0.7,
    uncertainty_prefix: 'UNCERTAIN: ',
  },
}
```

#### Security Prompts

Dedicated system prompts enforce security at multiple layers:

| Prompt ID | Purpose | Security Function |
|-----------|---------|-------------------|
| `sys.governance.compliance-checker` | Pre-action compliance | Verifies Evidence Triplet, vibe-check, SBOM, license validation before execution |
| `sys.router.tool-selection` | Tool routing | Decision tree prevents unauthorized tool access; requires 2+ alternatives considered |
| `sys.resilience.error-recovery` | Error handling | Controlled fallback chains; prevents uncontrolled error propagation |
| `sys.memory.contextualize` | Memory integration | Relevance scoring prevents irrelevant/stale context injection |
| `sys.research.synthesizer` | Research synthesis | License validation (SAFE/REVIEW/BLOCKED); excludes blocked sources |

#### Risk Classification

All prompts are classified by risk level (L1-L4):

- **L1 (Read-only)** – Proceed without approval
- **L2 (Write, internal)** – Log and proceed
- **L3 (External network)** – Require explicit approval
- **L4 (Destructive/irreversible)** – Block and escalate

#### Banned Phrases

The prompt validation system automatically rejects templates containing:
- `\bDAN\b` – Jailbreak attempts
- `ignore previous` – Prompt injection attempts

## 🚨 Reporting Vulnerabilities

### How to Report

**⚠️ CRITICAL: DO NOT create public GitHub issues for security vulnerabilities.**

Instead, please report security vulnerabilities through our secure channels:

#### Primary Contact

- **Private advisory via GitHub**: [Submit a private report](https://github.com/cortex-os/cortex-os/security/advisories/new) (requires GitHub login; preferred).
- **Email**: <security@cortex-os.dev>  
  Subject line: `[SECURITY] <short summary>`  
  Optional PGP: request the current key via email while the public key is being rotated.

#### Alternative Contacts

- **Security Team Lead**: <jscraik@brainwav.io>
- **Emergency (24/7)**: Use the email contacts above with subject prefix `[URGENT]`. Voice hotlines are not currently operated for initial disclosure.

### What to Include in Your Report

Please provide as much detail as possible:

```markdown
## Vulnerability Summary

Brief description of the vulnerability and its potential impact.

## Affected Components

- Package/module name and version
- Specific files or functions affected
- Operating system and environment details

## Vulnerability Details

### Type

- [ ] SQL Injection
- [ ] Cross-Site Scripting (XSS)
- [ ] Cross-Site Request Forgery (CSRF)
- [ ] Authentication Bypass
- [ ] Authorization Issues
- [ ] Information Disclosure
- [ ] Prompt Injection (AI/ML specific)
- [ ] Model Extraction (AI/ML specific)
- [ ] Data Poisoning (AI/ML specific)
- [ ] Other: ******\_\_\_******

### Severity Assessment

- [ ] Critical (9.0-10.0 CVSS)
- [ ] High (7.0-8.9 CVSS)
- [ ] Medium (4.0-6.9 CVSS)
- [ ] Low (0.1-3.9 CVSS)

### Proof of Concept

Provide step-by-step reproduction instructions:

1. Environment setup
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots or video (if applicable)

### Impact Assessment

- Data at risk
- Systems affected
- Potential for escalation
- Business impact

### Suggested Remediation

If you have ideas for fixes, please include them.
```

- **PGP Key**: We rotate keys annually. Request the active key via <security@cortex-os.dev> until the new public block is published in this document.

## ⏱️ Response Timeline

We are committed to responding promptly to security reports:

| Timeline            | Action                                              |
| ------------------- | --------------------------------------------------- |
| **Within 72 hours** | Initial acknowledgment of your report               |
| **Within 1 week**   | Preliminary assessment and severity classification  |
| **Within 2 weeks**  | Detailed investigation results and remediation plan |
| **Within 30 days**  | Fix implementation and testing (for most issues)    |
| **Within 45 days**  | Public disclosure (coordinated with reporter)       |

## 🔍 Automated Dependency Scanning

- **pnpm audit** – Enforced in CI at the `high` threshold; moderate findings are logged for follow-up via `tools/security/triage-audit.mjs`.
- **Snyk CLI** – Optional step in `.github/workflows/security.yml` (requires `SNYK_TOKEN`) that runs `snyk test`/`snyk monitor` against `pnpm-lock.yaml` and stores JSON artifacts.
- **Custom scanners** – `tools/security/scan-tar-deps.mjs` inspects `pnpm-lock.yaml` for tar extractor usage and queries OSV for known vulnerabilities.

Artifacts from these scanners are uploaded as `dependency-security-reports` for reviewers, and remediation expectations are defined in `docs/security/policies/dependency-vulnerability-management.md`.

### Critical Vulnerabilities

For critical vulnerabilities (CVSS 9.0+), we aim to:

- Acknowledge within 24 hours
- Provide initial assessment within 48 hours
- Deploy emergency fixes within 1 week

## 🔒 Supported Versions

We provide security updates for the following versions:

| Version | Supported              | End of Support |
| ------- | ---------------------- | -------------- |
| 2.x.x   | ✅ Active              | TBD            |
| 1.5.x   | ✅ Active              | 2025-12-31     |
| 1.4.x   | ⚠️ Limited             | 2025-06-30     |
| < 1.4   | ❌ No longer supported | 2024-12-31     |

### Support Levels

- **✅ Active**: Full security updates and patches
- **⚠️ Limited**: Critical security fixes only
- **❌ Unsupported**: No security updates provided

## 🛡️ Security Architecture

### Core Security Principles

#### 1. Defense in Depth

- **Input Validation**: All inputs validated using Zod schemas
- **Authentication**: Multi-factor authentication support
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: End-to-end encryption for sensitive data
- **Monitoring**: Comprehensive security event logging

#### 2. Secure Development Lifecycle

- **Static Analysis**: Automated security scanning with Semgrep
- **Dynamic Analysis**: Runtime security monitoring
- **Dependency Scanning**: Automated vulnerability detection in dependencies
- **Allowlist Maintenance**: Follow the [npm audit allowlist process](docs/security/dependency-guidelines.md) for vetted exceptions
- **Security Testing**: Dedicated security test suites
- **Code Review**: Security-focused code reviews

#### 3. AI/ML Security Specific

- **Prompt Injection Prevention**: Input sanitization and validation
- **Model Security**: Secure model loading and execution
- **Data Privacy**: PII detection and anonymization
- **Bias Detection**: Automated bias testing in AI outputs
- **Rate Limiting**: Protection against model abuse

### Security Controls Implementation

#### Authentication & Authorization

```typescript
// Example: Secure authentication implementation
const authConfig = {
  providers: ['oauth2', 'saml', 'oidc'],
  mfa: {
    required: true,
    methods: ['totp', 'sms', 'hardware-key'],
  },
  sessionManagement: {
    timeout: 3600, // 1 hour
    refreshToken: true,
    secureFlags: true,
  },
};
```

#### Input Validation

```typescript
// Example: Comprehensive input validation
const UserInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(1000)
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, 'Invalid characters')
    .refine((val) => !containsSqlInjection(val), 'Potential SQL injection')
    .refine((val) => !containsScriptTags(val), 'Script tags not allowed'),

  options: z
    .object({
      format: z.enum(['json', 'xml', 'yaml']),
      maxResults: z.number().min(1).max(100),
    })
    .optional(),
});
```

#### Secure Communication

```typescript
// Example: Secure A2A communication
const secureTransport = createA2ATransport({
  type: 'https',
  endpoint: 'https://secure-endpoint.cortex-os.dev',
  tls: {
    minVersion: 'TLSv1.3',
    cipherSuites: ['TLS_AES_256_GCM_SHA384'],
    certificateValidation: 'strict',
  },
  authentication: {
    type: 'mTLS',
    clientCert: './certs/client.crt',
    clientKey: './certs/client.key',
    caCert: './certs/ca.crt',
  },
});
```

## 🔍 Security Testing

### Automated Security Scanning

We use multiple layers of automated security scanning:

#### Static Application Security Testing (SAST)

```bash
# Semgrep security scanning
pnpm security:scan                  # OWASP precise rules
pnpm security:scan:comprehensive    # All security rulesets
pnpm security:scan:llm              # LLM-specific rules
pnpm security:scan:atlas            # MITRE ATLAS rules
```

#### Dynamic Application Security Testing (DAST)

- Runtime security monitoring
- Penetration testing (automated and manual)
- API security testing
- Container security scanning

#### Dependency Scanning

```bash
# Dependency vulnerability scanning
pnpm audit
pnpm deps:scan
npm audit --audit-level=high
```

#### AI/ML Security Testing

```bash
# LLM-specific security testing
pnpm test:llm-security
pnpm test:prompt-injection
pnpm test:model-extraction
pnpm test:bias-detection
```

### Manual Security Testing

Our security team conducts regular manual testing:

- **Penetration Testing**: Quarterly external penetration tests
- **Code Review**: Security-focused code reviews for all changes
- **Architecture Review**: Security architecture assessments
- **Red Team Exercises**: Simulated attack scenarios

## 🛡️ OWASP Compliance

### OWASP Top-10 2021 Compliance

| Risk                                 | Status       | Implementation                                        |
| ------------------------------------ | ------------ | ----------------------------------------------------- |
| **A01: Broken Access Control**       | ✅ Compliant | RBAC, session management, API authorization           |
| **A02: Cryptographic Failures**      | ✅ Compliant | Strong encryption, secure key management              |
| **A03: Injection**                   | ✅ Compliant | Input validation, parameterized queries, sanitization |
| **A04: Insecure Design**             | ✅ Compliant | Secure architecture, threat modeling                  |
| **A05: Security Misconfiguration**   | ✅ Compliant | Secure defaults, configuration management             |
| **A06: Vulnerable Components**       | ✅ Compliant | Dependency scanning, regular updates                  |
| **A07: Authentication Failures**     | ✅ Compliant | MFA, secure session management                        |
| **A08: Software Integrity Failures** | ✅ Compliant | CI/CD security, code signing                          |
| **A09: Logging & Monitoring**        | ✅ Compliant | Comprehensive audit logging                           |
| **A10: Server-Side Request Forgery** | ✅ Compliant | URL validation, network segmentation                  |

### OWASP LLM Top-10 Compliance

| Risk                                        | Status       | Implementation                        |
| ------------------------------------------- | ------------ | ------------------------------------- |
| **LLM01: Prompt Injection**                 | ✅ Compliant | Input sanitization, prompt validation |
| **LLM02: Insecure Output Handling**         | ✅ Compliant | Output validation, encoding           |
| **LLM03: Training Data Poisoning**          | ✅ Compliant | Data validation, provenance tracking  |
| **LLM04: Model Denial of Service**          | ✅ Compliant | Rate limiting, resource controls      |
| **LLM05: Supply Chain Vulnerabilities**     | ✅ Compliant | Model validation, dependency scanning |
| **LLM06: Sensitive Information Disclosure** | ✅ Compliant | PII detection, data anonymization     |
| **LLM07: Insecure Plugin Design**           | ✅ Compliant | Plugin sandboxing, validation         |
| **LLM08: Excessive Agency**                 | ✅ Compliant | Capability boundaries, authorization  |
| **LLM09: Overreliance**                     | ✅ Compliant | Human oversight, confidence scoring   |
| **LLM10: Model Theft**                      | ✅ Compliant | Access controls, model protection     |

### OWASP ASVS 4.0.3 Alignment

| Verification Requirement                      | L1 | L2 | L3 | Implementation Highlights |
| --------------------------------------------- | -- | -- | -- | ------------------------- |
| **V1 Architecture & Threat Modeling**         | ✅ | ✅ | ⚠️ | Zero-trust reviews, MITRE ATLAS scenarios, design ADRs |
| **V2 Authentication**                         | ✅ | ✅ | ✅ | SPIFFE/SPIRE identity, mTLS mutual auth, MFA enforcement |
| **V3 Session Management**                     | ✅ | ✅ | ⚠️ | OAuth 2.1 + PKCE, short-lived tokens, secure cookie flags |
| **V4 Access Control**                         | ✅ | ✅ | ✅ | RBAC/ABAC policies, policy-engine guardrails |
| **V5 Validation, Sanitization & Encoding**    | ✅ | ✅ | ✅ | Zod validation, safe serialization, output encoding |
| **V6 Stored Cryptography**                    | ✅ | ✅ | ⚠️ | KMS secrets, envelope encryption, rotation runbooks |
| **V7 Error Handling & Logging**               | ✅ | ✅ | ✅ | Structured audit trails, privacy-aware logging |
| **V8 Data Protection**                        | ✅ | ✅ | ⚠️ | Data classification, minimization, L3 encryption backlog |
| **V9 Communications**                         | ✅ | ✅ | ✅ | Enforce TLS 1.3 + mTLS everywhere; any exceptions must follow the Escalation & Exceptions process and be explicitly approved |
| **V10 Malicious Code & Configuration**        | ✅ | ✅ | ✅ | Semgrep OWASP/LLM, IaC policy scans, supply-chain attestations |
| **V11 Business Logic**                        | ✅ | ✅ | ⚠️ | Abuse-case tests, workflow guardrails, manual approvals |
| **V12 Files, Resources & APIs**               | ✅ | ✅ | ✅ | CSP + sandboxing, contract schemas, resource isolation |
| **V13 API & Web Service Security**            | ✅ | ✅ | ✅ | OpenAPI linting, rate limiting, telemetry correlation |
| **V14 Configuration**                         | ✅ | ✅ | ✅ | GitOps baselines, drift detection, secret scanning |

> **Legend:** ✅ = implemented and continuously verified, ⚠️ Planned = tracked in roadmap with open stories, 🚧 = in progress.

Our ASVS alignment work feeds into the MITRE ATLAS navigator to ensure adversarial ML coverage stays in lockstep with web and API controls. Roadmapped L3 capabilities are tracked in the Cortex-OS security program backlog, with quarterly reviews to close any remaining gaps.

## 📋 Security Checklist for Contributors

### Code & Platform Security Checklist (ASVS Mapping)

- [ ] **V1 Architecture & Threat Modeling (L1-L2)** – Document threat models, update ADRs, and record MITRE ATLAS scenarios for new features.
- [ ] **V2 Authentication (L1-L3)** – Enforce SPIFFE/SPIRE identity, rotate credentials, and verify MFA or device attestation where applicable.
- [ ] **V3 Session Management (L1-L2)** – Use short-lived, server-side sessions with secure flags and implement token revocation workflows.
- [ ] **V4 Access Control (L1-L3)** – Apply least privilege RBAC/ABAC rules, add defense-in-depth policy checks, and test negative access paths.
- [ ] **V5 Input Validation (L1-L3)** – Validate all inbound data with schemas, reject on failure, and encode outputs for target contexts.
- [ ] **V6 Cryptography (L1-L2)** – Store secrets in approved KMS, enforce TLS 1.3+, and document rotation cadence.
- [ ] **V7 Error Handling & Logging (L1-L3)** – Emit structured, privacy-safe logs, scrub secrets, and enable tamper detection.
- [ ] **V8 Data Protection (L1-L2)** – Classify data, enforce retention policies, and ensure data minimization in AI prompts.
- [ ] **V9 Communications (L1-L3)** – Require mTLS for service mesh hops, enforce TLS for external clients, and monitor certificate health.
- [ ] **V10 Malicious Code & Configuration (L1-L2)** – Run Semgrep OWASP/LLM rules, IaC scanners, and dependency audits before merge.
- [ ] **V11 Business Logic (L1-L2)** – Write misuse/abuse tests for workflows, ensure fallback and escalation paths exist.
- [ ] **V12 Files & Resources (L1-L3)** – Restrict file access, scan uploads, and sandbox untrusted code execution paths.
- [ ] **V13 API Security (L1-L3)** – Version APIs, enforce schema-based validation, enable rate limits and telemetry correlations.
- [ ] **V14 Configuration (L1-L3)** – Manage configs via GitOps, lock defaults to secure values, and monitor drift across environments.

### AI/ML Security Checklist (OWASP LLM + ASVS Extensions)

- [ ] Map each LLM integration to MITRE ATLAS techniques and associated detections.
- [ ] Enforce prompt hygiene, output filtering, and evidence capture for critical flows.
- [ ] Validate training and fine-tuning datasets for poisoning, lineage, and consent requirements.
- [ ] Apply rate limiting, workload isolation, and cost guards against LLM DoS or resource abuse.
- [ ] Restrict model and tool capabilities via explicit allowlists and contract enforcement.
- [ ] Review fairness/bias dashboards and document mitigations for material risks.

### Infrastructure & Operations Checklist

- [ ] Enforce TLS 1.3 + mTLS; any exceptions must follow the Escalation & Exceptions process and be explicitly approved. Ensure automated certificate rotation.
- [ ] Confirm secret storage (Vault/KMS) policies and audit logs for administrative actions.
- [ ] Run container and host vulnerability scans (CIS Benchmarks, Trivy, etc.) before promotion.
- [ ] Validate network segmentation, egress policies, and zero-trust controls per ASVS V9 requirements.
- [ ] Ensure monitoring, alerting, and incident runbooks cover ASVS V7/V10/V13 controls with MITRE ATLAS adversary playbooks.

## 🆘 Security Incident Response

### Incident Classification

#### Severity Levels

- **P0 (Critical)**: Active exploitation, data breach, system compromise
- **P1 (High)**: High risk vulnerability, potential for significant impact
- **P2 (Medium)**: Moderate risk, limited impact
- **P3 (Low)**: Low risk, minimal impact

#### Response Teams

- **Security Team**: Primary incident response
- **Engineering Team**: Technical remediation
- **Management Team**: Business decisions and communications
- **Legal Team**: Compliance and legal requirements

### Incident Response Process

1. **Detection & Analysis** (0-2 hours)
   - Incident identification and initial assessment
   - Severity classification
   - Team notification

2. **Containment** (2-6 hours)
   - Isolate affected systems
   - Prevent further damage
   - Preserve evidence

3. **Investigation** (6-24 hours)
   - Root cause analysis
   - Impact assessment
   - Evidence collection

4. **Remediation** (24-72 hours)
   - Fix implementation
   - System restoration
   - Verification testing

5. **Recovery** (72+ hours)
   - System monitoring
   - User communication
   - Lessons learned

## 📞 Contact Information

### Security Team

- **Primary**: <security@cortex-os.dev>
- **Security Lead**: <security-lead@cortex-os.dev>
- **Incident Response**: <incident-response@cortex-os.dev>

### Emergency Contacts

- **Critical Vulnerabilities**: Available 24/7 via <security@cortex-os.dev>
- **Security Incidents**: Include "URGENT" in subject line

### Legal and Compliance

- **Privacy Officer**: <privacy@cortex-os.dev>
- **Compliance Team**: <compliance@cortex-os.dev>
- **Legal Team**: <legal@cortex-os.dev>

## 📜 Security Policies

### Data Protection

- **Data Classification**: Confidential, Internal, Public
- **Data Retention**: Automated deletion based on classification
- **Data Encryption**: At rest and in transit
- **Access Controls**: Need-to-know basis

### Privacy Protection

- **PII Handling**: Minimal collection, secure processing
- **User Consent**: Explicit consent for data processing
- **Data Subject Rights**: Right to access, modify, delete
- **Cross-border Transfers**: GDPR compliant mechanisms

### Vendor Security

- **Security Assessments**: Required for all vendors
- **Data Processing Agreements**: Mandatory for data processors
- **Regular Reviews**: Annual security posture reviews
- **Incident Notification**: 24-hour notification requirement

## 🔄 Security Updates

### Update Notifications

- **Security Advisories**: Published on GitHub Security tab
- **Email Notifications**: Available for security-sensitive repositories
- **RSS Feeds**: Security update feeds available
- **API**: Programmatic access to security information

### Patch Management

- **Critical Patches**: Released within 24-72 hours
- **High Priority Patches**: Released within 1-2 weeks
- **Regular Patches**: Included in monthly releases
- **Emergency Patches**: Out-of-band releases for critical issues

---

**Security is Everyone's Responsibility** 🛡️
_Help us keep Cortex-OS secure for everyone_

[![Report Vulnerability](https://img.shields.io/badge/report-vulnerability-red.svg)](mailto:security@cortex-os.dev)

**Last Updated**: November 18, 2025 | **Version**: 1.2.0
