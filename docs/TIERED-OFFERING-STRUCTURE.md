# brAInwav Tiered Offering Structure

**Version**: 0.3.0 (Proposed)
**Status**: Strategic Planning
**Target Audience**: Open Source Community, Teams, Enterprises

---

## Overview

brAInwav uses a **progressive enhancement model**: Start simple, add governance as you grow. This reduces adoption friction while maintaining an upgrade path to gold-standard compliance.

### Design Principles

1. **Zero-to-value in 5 minutes** | Starter tier requires no external tools
2. **Pay for what you need** | Each tier adds clear capabilities
3. **Never remove features** | Upgrades are additive only
4. **Clear upgrade paths** | Automation for seamless transitions

---

## Tier Comparison Matrix

| Capability | Starter | Standard | Enterprise |
|------------|---------|----------|------------|
| **Target** | Solo devs, small teams | Growing teams, startups | Regulated industries, enterprise |
| **Price** | Free (MIT) | Free (MIT) | Paid / Enterprise support |
| **Time to value** | 5 min | 15 min | 1 hour |
| **External tools required** | 0 | 3 | 9+ |
| **Workflow governance** | ✅ Full | ✅ Full | ✅ Full |
| **Security scanning** | ❌ | ✅ Basic | ✅ Full suite |
| **Compliance mapping** | ❌ | ❌ | ✅ OWASP/NIST/ISO/SLSA |
| **Evidence requirements** | ✅ Basic | ✅ Standard | ✅ Full audit trail |
| **CI/CD integration** | ✅ Basic | ✅ Full | ✅ Full + customizable |
| **Support** | Community | Community | SLA + dedicated |

---

## Tier 1: Starter (Free, MIT)

### Positioning

**"Guardrails, not gates"** — Workflow structure without overhead.

### Target Users

- Solo developers using AI assistants
- Small teams (1-5 people) experimenting with AI workflows
- Open source projects wanting basic governance
- Teams new to AI-assisted development

### Features Included

#### Workflow Controls (Full)
- **Step Budget**: ≤7 steps per plan (prevents over-planning)
- **Ask-First**: ≤3 clarifications per session (prevents chat loops)
- **Evidence Triplet**: Test proof + contract + review placeholders
- **Task Folders**: Structured workspace per task
- **Plan Validation**: JSON schema for plan artifacts

#### Governance Validation
- Required token checks (AGENTS.md, governance index)
- Hash drift detection (governance integrity)
- File structure validation
- Basic linting (markdownlint for docs)

#### CI/CD Templates
- Basic GitHub Actions workflow
- Validation gates (hash drift, required files)
- Evidence triplet validation

### Features Excluded (Upgrade Required)

- ❌ No security scanners (semgrep, gitleaks, trivy, cosign, etc.)
- ❌ No compliance mapping (OWASP, NIST, ISO)
- ❌ No SBOM/provenance generation
- ❌ No Cortex-Aegis oversight integration
- ❌ No supply-chain validation

### Installation

```bash
pnpm add -D brainwav-governance
pnpm exec brainwav-governance init --profile starter
```

### Use Cases

- **Side projects**: Govern AI work without overhead
- **Prototyping**: Quick iteration with basic structure
- **Learning**: Understand workflow governance before adding security
- **Open source**: Minimal barrier to contribution

### Upgrade Triggers

You're ready for Standard when:
- Team grows beyond 5 people
- Deploying to production environments
- Handling user data (PII)
- Need basic security scanning

---

## Tier 2: Standard (Free, MIT)

### Positioning

**"Production-ready governance"** — Workflow + security basics for teams shipping code.

### Target Users

- Startups and growth-stage companies
- Teams (5-50 people) in production
- SaaS products handling user data
- Companies pre-Regulation/Audit

### Everything in Starter, Plus:

#### Security Scanning (Basic)
- **semgrep**: Policy and security linting
- **gitleaks**: Secret and credential detection
- **pnpm audit / osv-scanner**: Dependency vulnerability checks

#### Enhanced Validation
- Security policy enforcement (semgrep rules)
- Secret scanning in commits (gitleaks)
- Dependency vulnerability blocking (high/critical runtime only)

#### CI/CD Templates
- Security gate integration
- Fail-fast on policy violations
- Optional Docker toolchain container

#### Documentation
- Security baseline guide
- Threat modeling template
- Incident response runbook

### Features Excluded (Upgrade Required)

- ❌ No container/infrastructure scanning (trivy)
- ❌ No code signing (cosign)
- ❌ No SBOM generation (cyclonedx)
- ❌ No formal compliance mapping (OWASP ASVS, NIST, ISO)
- ❌ No Cortex-Aegis oversight
- ❌ No supply-chain provenance

### Installation

```bash
pnpm exec brainwav-governance init --profile standard
pnpm exec brainwav-governance doctor  # Checks for semgrep, gitleaks, osv-scanner
```

Or use Docker (all tools included):

```bash
docker run --rm -v $(pwd):/workspace brainwav/governance-tools:standard validate
```

### Use Cases

- **SaaS products**: Production apps with security gates
- **Fintech (early)**: Pre-regulatory compliance preparation
- **Healthtech (early)**: HIPAA awareness without full audit
- **Agencies**: Client deliverables with security checks

### Upgrade Triggers

You're ready for Enterprise when:
- Facing regulatory audit (SOC 2, HIPAA, PCI DSS)
- Required to produce SBOMs (software bill of materials)
- Need formal compliance mapping (NIST AI RMF, EU AI Act)
- Want code signing / provenance

---

## Tier 3: Enterprise (Paid / Open Core)

### Positioning

**"Gold-standard compliance"** — Full governance suite for regulated industries.

### Target Users

- Regulated industries (fintech, healthtech, govtech, defense)
- Enterprises with compliance requirements
- High-security environments
- Organizations subject to audits

### Everything in Standard, Plus:

#### Complete Security Suite
- **trivy**: Container, filesystem, and misconfiguration scanning
- **cosign**: Code signing and Sigstore integration
- **cyclonedx**: SBOM generation (CycloneDX 1.7, SPDX 3.0.1)
- **markdownlint**: Documentation quality enforcement

#### Formal Compliance Mapping
- **OWASP Top 10:2025** (web application security)
- **OWASP ASVS 5.0.0** (verification standard targeting)
- **OWASP LLM Top 10 2025 v1.1** (AI/ML security)
- **NIST SSDF 1.1** (secure development lifecycle)
- **NIST AI RMF + GenAI Profile** (AI risk management)
- **SLSA v1.2** (supply-chain levels for software artifacts)
- **ISO/IEC 42001:2023** (AI management systems)

#### Advanced Features
- **Cortex-Aegis Oversight**: Pre-flight risk assessment
- **Academic Research Integration**: Citation and license tracking
- **Supply-Chain Provenance**: Sigstore Cosign v3 attestation
- **Evidence Triplet (Full)**: Complete audit trail with logs

#### CI/CD Templates
- Full GitHub Actions workflow with all gates
- GitLab CI, CircleCI, Azure Pipelines templates
- Customizable compliance profiles
- Multi-repo portfolio drift detection

#### Support & Services
- **SLA**: 24-hour response for critical issues
- **Dedicated support**: Engineering contact
- **Custom packs**: Industry-specific governance packs
- **Training**: Team onboarding and governance workshops
- **Audit support**: Evidence bundle generation for auditors

### Pricing (Open Core Model)

#### Self-Hosted (Free, MIT)
- Full Enterprise tier capabilities
- Community support only
- Self-managed infrastructure

#### Managed / Supported (Paid)
- **Starter**: $299/month (up to 25 devs, email support)
- **Growth**: $999/month (up to 100 devs, Slack support)
- **Enterprise**: Custom (unlimited devs, dedicated support, SLA)

### Installation

```bash
pnpm exec brainwav-governance init --profile enterprise
```

Or with Docker:

```bash
docker run --rm -v $(pwd):/workspace brainwav/governance-tools:enterprise validate
```

### Use Cases

- **Fintech**: SOC 2, PCI DSS compliance preparation
- **Healthtech**: HIPAA, FDA SaMD, GDPR compliance
- **Govtech / Defense**: FedRAMP, DoD SRG alignment
- **Public companies**: SOX, SEC cybersecurity disclosure

### Compliance Mapping Example

| Regulation | brAInwav Controls | Evidence Generated |
|------------|-------------------|-------------------|
| **SOC 2** | NIST SSDF + SLSA | Commit logs, SBOM, access reviews |
| **HIPAA** | OWASP Top 10 + ASVS | Threat models, pen test reports |
| **PCI DSS** | ASVS L2 + SLSA | Code review logs, vulnerability scans |
| **EU AI Act** | NIST AI RMF + GenAI | Risk assessments, impact analyses |
| **FedRAMP** | NIST SP 800-53 + SLSA | Control assessments, audit trails |

---

## Upgrade Paths

### Automated Upgrades

All tiers support seamless upgrades:

```bash
# Starter → Standard
pnpm exec brainwav-governance upgrade --profile standard

# Standard → Enterprise
pnpm exec brainwav-governance upgrade --profile enterprise

# Skip intermediate tiers
pnpm exec brainwav-governance upgrade --profile enterprise
```

### What's Preserved

- Task folder structure and evidence
- Governance configuration (mode, packs)
- Custom overlays and local settings
- Git history and hashes

### What's Added

- New CI/CD workflow templates (merged, not replaced)
- Additional validation checks (non-blocking until adopted)
- Toolchain requirements (warned, then enforced)

### Rollback Support

```bash
# Rollback to previous tier
pnpm exec brainwav-governance upgrade --profile standard --rollback
```

---

## Feature Comparison Detail

### Workflow Governance (All Tiers)

| Feature | Starter | Standard | Enterprise |
|---------|---------|----------|------------|
| Step Budget (≤7 steps) | ✅ | ✅ | ✅ |
| Ask-First (≤3 clarifications) | ✅ | ✅ | ✅ |
| Evidence Triplet | ✅ Basic | ✅ Standard | ✅ Full |
| Task Folders | ✅ | ✅ | ✅ |
| Plan Validation | ✅ | ✅ | ✅ |
| Hash Drift Detection | ✅ | ✅ | ✅ |
| Required Token Checks | ✅ | ✅ | ✅ |

### Security & Compliance

| Feature | Starter | Standard | Enterprise |
|---------|---------|----------|------------|
| semgrep (policy linting) | ❌ | ✅ | ✅ |
| gitleaks (secrets) | ❌ | ✅ | ✅ |
| pnpm audit / osv-scanner | ❌ | ✅ | ✅ |
| trivy (containers/misconfig) | ❌ | ❌ | ✅ |
| cosign (signing) | ❌ | ❌ | ✅ |
| cyclonedx (SBOM) | ❌ | ❌ | ✅ |
| OWASP mapping | ❌ | ❌ | ✅ |
| NIST/ISO mapping | ❌ | ❌ | ✅ |

### CI/CD Integration

| Feature | Starter | Standard | Enterprise |
|---------|---------|----------|------------|
| GitHub Actions | ✅ Basic | ✅ Full | ✅ Full + customizable |
| GitLab CI | ❌ | ❌ | ✅ |
| CircleCI | ❌ | ❌ | ✅ |
| Azure Pipelines | ❌ | ❌ | ✅ |
| Docker container | ❌ | ✅ Standard | ✅ Enterprise |

### Support

| Feature | Starter | Standard | Enterprise |
|---------|---------|----------|------------|
| Documentation | ✅ | ✅ | ✅ |
| Community (GitHub) | ✅ | ✅ | ✅ |
| Email support | ❌ | ❌ | ✅ |
| Slack support | ❌ | ❌ | ✅ (Growth+) |
| SLA | ❌ | ❌ | ✅ (Growth+) |
| Training | ❌ | ❌ | ✅ (Enterprise) |
| Custom packs | ❌ | ❌ | ✅ (Enterprise) |

---

## Go-to-Market Strategy

### Phase 1: Foundation (Months 1-3)
- ✅ Release Starter tier as MIT-licensed open source
- ✅ Publish 5-minute quickstart guide
- ✅ Release Docker toolchain images
- ✅ Create interactive init wizard

### Phase 2: Adoption (Months 4-6)
- ⏳ Release Standard tier as MIT-licensed open source
- ⏳ Add case studies from early adopters
- ⏳ Launch community Discord/Slack
- ⏳ Publish "Why brAInwav" blog series

### Phase 3: Enterprise (Months 7-12)
- ⏳ Release Enterprise tier (self-hosted, free)
- ⏳ Launch paid support tiers (Starter/Growth/Enterprise)
- ⏳ Publish compliance mapping whitepapers
- ⏋ Secure first design partner (regulated industry)

### Phase 4: Ecosystem (Year 2)
- ⏋ Governance pack marketplace
- ⏋ Certified practitioner program
- ⏋ Industry-specific packs (healthcare, finance, govtech)
- ⏋ Multi-language SDKs (Python, Rust, Go)

---

## Success Metrics

### Adoption Metrics
- **Weekly active installs** (all tiers)
- **Tier distribution** (Starter vs Standard vs Enterprise)
- **Upgrade conversion rate** (Starter→Standard→Enterprise)
- **Time to first validation** (target: <5 min for Starter)

### Quality Metrics
- **Validation pass rate** (target: >80% first try)
- **Hash drift incidents** (target: <1% of runs)
- **Security scan findings** (trend: down over time)
- **Evidence completeness** (target: 100% for Enterprise)

### Business Metrics
- **Community engagement** (GitHub stars, issues, PRs)
- **Support inquiries** (Enterprise tier interest)
- **Design partner conversions** (regulated industry pilots)
- **Revenue** (paid support tiers, Year 2+)

---

## Open Questions

1. **Should Starter tier include any security scanning by default?**
   - Tradeoff: Reduced friction vs. security baseline
   - Proposal: Keep Starter at zero external tools; add optional "security-light" pack

2. **Should Enterprise tier be open source or proprietary?**
   - Tradeoff: Community contributions vs. revenue capture
   - Proposal: Open core (MIT) with paid support/services

3. **Should we offer a hosted SaaS version?**
   - Tradeoff: Easier adoption vs. data residency concerns
   - Proposal: Start with self-hosted only; evaluate SaaS in Year 2

4. **How do we handle compliance for different jurisdictions?**
   - Challenge: EU AI Act, US executive orders, China's AI regulations conflict
   - Proposal: Create compliance packs by region (eu, us, cn)

---

**Next Steps**:
1. [ ] Review and approve tier structure
2. [ ] Update package.json to support `--profile starter|standard|enterprise`
3. [ ] Create Docker images for each tier
4. [ ] Publish pricing page (if selling support)
5. [ ] Draft case study template for early adopters
