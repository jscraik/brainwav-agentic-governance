# Context

> **⚠️ HISTORICAL DOCUMENT**: This document references `apps/api` which has been removed from the codebase. Content preserved for historical reference and deployment context.

**Task**: Update diagram and plan to match OrbStack + host-native local models, clarify containerization, assess VM.
**Key constraint**: Local models on host. Vendor-neutral. MCP/A2A only.
**Deliverables**: Updated wireframe, container map, run plan, VM verdict.

# Wireframe (container + host layout)

```text
User → Web/CLI/API
            │
            ▼
Cloudflare Workers/Queues/Tunnels (edge egress allowlist)
            │
            ▼
┌──────────────────────────────────────────────────────────────────────┐
│ OrbStack (Docker-compatible VM on macOS) / Docker Engine on Linux   │
│                                                                      │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐          │
│  │ apps/api     │   │ apps/cortex- │   │ apps/cortex-web  │          │
│  │ REST/Webhook │   │ os (ASBR-lite)│  │ Next.js UI       │          │
│  └──────┬───────┘   └──────┬───────┘   └────────┬─────────┘          │
│         │ A2A/HTTP         │ A2A/HTTP           HTTP                 │
│  ┌──────▼────────┐   ┌─────▼──────────┐   ┌─────▼──────────┐         │
│  │ packages/     │   │ packages/model │   │ packages/mcp-   │         │
│  │ agents (worker│   │ -gateway (/chat│   │ registry (HTTP) │         │
│  │ processes)    │   │ /embed /rank)  │   └─────────────────┘         │
│  └───────────────┘   └─────┬──────────┘                               │
│                            │ HTTP/MCP                                 │
│  ┌──────────────┐   ┌──────▼───────┐   ┌──────────────┐               │
│  │ NATS (JetStr)│   │ Postgres     │   │ Qdrant (opt.)│               │
│  │ A2A bus      │   │ meta/outbox  │   │ vectors      │               │
│  └──────────────┘   └──────────────┘   └──────────────┘               │
└──────────────────────────────────────────────────────────────────────┘

Host (macOS):
  Local model servers (Ollama) → http://host.docker.internal:11434
Optional:
  Additional inference servers (host or container)
Frontier APIs:
  via Cloudflare edge allowlist
```

# What runs as a container vs library

**Containers (deployable services):**

- `apps/cortex-os` (ASBR-lite brain)
- `apps/api`
- `apps/cortex-web`
- `packages/model-gateway`
- `packages/mcp-registry`
- `packages/agents` workers (only if long-running consumers)
- Infra: `nats`, `postgres`, `qdrant`, `ollama`(opt)

**Libraries inside images (not separate containers):**

- `packages/orchestration`, `packages/mvp|kernel`, `packages/a2a-services`, `packages/security`, `packages/observability`, `packages/mcp` client, `packages/rag`, `packages/memories` (unless you expose a standalone service)

**Host-native (not in a container):**

- Local inference servers (Ollama) for optimal GPU performance

# Plan deltas

1. **Compose defaults**

   - Dev: `docker-compose.dev.yml` under OrbStack. Point `MODEL_GATEWAY` to `http://host.docker.internal:11434` for local models.
   - Prod: `docker-compose.prod.yml` or Helm on Linux. Local models via Ollama or containerized inference.

2. **Service boundaries**

   - Keep `cortex-os` lean: DI, router, A2A, contracts, proofs.
   - Put model vendor logic only in `model-gateway`.
   - Run agent workers as separate containers if they subscribe to A2A.

3. **Networking**

   - All containers talk A2A/HTTP inside the bridge network.
   - Local inference host reachable via `host.docker.internal`.

4. **Security**

   - Non-root, read-only FS, drop caps.
   - Egress allowlist at Cloudflare.
   - Problem+JSON on errors.

5. **CI/CD**

   - Buildx multi-arch. Cosign sign. Syft SBOM. OSV/CodeQL/gitleaks gates.

# Answer to “packages inside cortex-os container?”

No. Do not nest services. Each **service** gets its own image. **Packages** are libraries bundled into the images that use them. Only create another container if it exposes a networked API or consumes A2A independently.

# VM setup: is there a benefit?

**Dev on macOS:**

- OrbStack already runs Docker inside a lightweight VM. Extra full VM adds little.
- Use a dedicated VM only if you need strict Linux kernel features, SELinux/AppArmor testing, or to isolate heavy I/O.

**Prod on Linux:**

- VM or cloud node gives stronger isolation, snapshots, and kernel control.
- Use KVM-backed VMs if you need noisy-neighbor isolation or different kernels.

**Trade-offs:**

- **Pros**: Kernel parity, isolation, snapshot/rollback.
- **Cons**: More RAM/CPU overhead, more network hops, same local-model considerations on mac.

# What / Why / Where / How / Result

- **What**: Service-per-container, host-native local models, OrbStack dev.
- **Why**: Best mac perf, clean boundaries, vendor-neutral routing.
- **Where**: Compose/Helm manifests; Dockerfiles per service.
- **How**: Images consume packages as libs; A2A/HTTP glue; Cloudflare egress.
- **Result**: Fast dev, predictable prod, local-first without Docker GPU gaps.

# Analysis Block

- **Pros**: Clear isolation. Faster mac dev. Deterministic routing.
- **Cons**: One hop to host local models. More services to operate.
- **Improvements**: Collocate `cortex-os` and `model-gateway` to cut latency; enable sticky routing; cache embeddings.
- **Missed**: Autoscale on p95; canary per provider.
- **Moving forward**: Implement Compose now; add Helm; keep local models host-native; revisit VM only for Linux-parity testing.
