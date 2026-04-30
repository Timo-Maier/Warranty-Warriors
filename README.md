# Warranty Warriors

An AI-powered warranty claims analysis tool built on SAP CAP (Cloud Application Programming Model). A LangGraph ReAct agent analyzes warranty claims by querying a local database, fetching enriched data from SAP Datasphere, and running AI analysis via SAP AI Core (Claude Opus).

## Architecture

```
UI (SAP UI5 / React)
        │
        ▼
CAP AgentService  ─── analyzeWarrantyClaims(query)
        │
        ├── Tool: retrieve_material_numbers   →  HANA / SQLite (local Reports table)
        ├── Tool: fetch_long_text_from_claims →  SAP Datasphere (via Destination Service)
        ├── Tool: create_query_from_prompt    →  SAP AI Core (Claude Opus)
        └── Tool: analyze_data               →  SAP AI Core (Claude Opus)
```

**BTP Services used:**
- SAP HANA (HDI container) — persistent data & vector embeddings
- SAP AI Core — LLM inference (Generative AI Hub, model `anthropic--claude-4.6-opus`)
- Destination Service — manages connection to Datasphere
- XSUAA — OAuth2 authentication (production only)

---

## Prerequisites

- [Node.js](https://nodejs.org) >= 20
- [SAP CDS CLI](https://cap.cloud.sap/docs/get-started/): `npm install -g @sap/cds-dk`
- [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/) with the `multiapps` plugin
- Access to the BTP space `mh-cih-test / warranty` (EU10)

---

## Local Setup (Hybrid Mode)

In hybrid mode the app runs locally but connects to the real HANA, AI Core, and Destination services in BTP.

### 1. Install dependencies

```bash
# Root CAP service
npm install

# React frontend
cd app/chatapp-react && npm install && cd ../..
```

### 2. Log in to Cloud Foundry

```bash
cf login -a https://api.cf.eu10-004.hana.ondemand.com
cf target -o mh-cih-test -s warranty
```

### 3. Bind BTP services

These commands populate `.cdsrc-private.json` with the service credentials used in hybrid mode.

```bash
# HANA HDI container
cds bind db --to hdi-shared --kind hana --for hybrid

# SAP AI Core
cds bind aicore --to aicore --for hybrid

# Destination Service
cds bind destinations --to Warranty-destination --for hybrid
```

### 4. Create the `.env` file

Create a `.env` file in the project root and add your AI Core service key:

```bash
# Retrieve the service key from BTP (if not already done)
cf create-service-key aicore aicore-key
cf service-key aicore aicore-key
```

Then create `.env`:

```
AICORE_SERVICE_KEY=<paste the full JSON service key here as a single line>
```

Example structure:
```
AICORE_SERVICE_KEY={"serviceurls":{"AI_API_URL":"https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com"},"appname":"...","clientid":"...","clientsecret":"...","identityzone":"...","url":"https://....authentication.eu10.hana.ondemand.com"}
```

### 5. Start the application

```bash
# Start CAP server in hybrid mode (connects to remote HANA, AI Core, Destination)
cds watch --profile hybrid
```

Open the UI5 Fiori app: [http://localhost:4004/chatapp/webapp/index.html](http://localhost:4004/chatapp/webapp/index.html)

To run the React frontend in parallel:

```bash
cd app/chatapp-react && npm run dev
```

---

## Local Testing (SQLite, no BTP)

For quick local development without any BTP services. DATASPHERE calls will not work in this mode.

```bash
# Install dependencies (if not done)
npm install

# Set AICORE_SERVICE_KEY in .env (required even locally)
# Then start with the default profile (uses SQLite in-memory)
cds watch
```

---

## Production Deployment (BTP / Cloud Foundry)

### Build & deploy via MTA

```bash
# Build the MTA archive
mbt build

# Deploy to BTP
cf deploy mta_archives/Warranty-Warriors_1.0.0.mtar
```

This provisions all required services (HANA, XSUAA, Destination) as defined in `mta.yaml`. After deployment, manually configure the destination `mh-bdc-dsp-dev-warranty` in BTP Cockpit to point to your Datasphere instance.

---

## Project Structure

| Path | Purpose |
|------|---------|
| `srv/` | CAP service definition and LangGraph agent implementation |
| `srv/agent/` | Agent factory, tool definitions |
| `db/` | CDS schema (Reports, ClaimLongText, EnrichedClaims) |
| `app/chatapp/` | SAP UI5 Fiori chat frontend |
| `app/chatapp-react/` | React chat frontend (Vite) |
| `mta.yaml` | MTA deployment descriptor for BTP |
| `xs-security.json` | XSUAA role configuration |
| `.cdsrc-private.json` | Local hybrid service bindings (git-ignored) |
| `.env` | Local environment variables — `AICORE_SERVICE_KEY` (git-ignored) |

---

## Learn More

- [SAP CAP Documentation](https://cap.cloud.sap/docs/get-started/)
- [SAP AI Core & Generative AI Hub](https://help.sap.com/docs/sap-ai-core)
- [LangGraph](https://langchain-ai.github.io/langgraphjs/)
