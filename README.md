# High-Scale Energy Ingestion Engine

## Executive Summary

This project implements a high-scale telemetry ingestion and analytics engine for a fleet platform managing 10,000+ Smart Meters and EVs.

The system consumes two independent 1-minute heartbeat streams:

- **Smart Meter (AC Side)** → Measures AC energy drawn from the grid.
- **Vehicle/Charger (DC Side)** → Reports DC energy delivered to the battery.

The platform correlates these streams to compute energy efficiency and detect potential power loss.

The system is optimized for:

- High write throughput (millions of daily records)
- Fast real-time operational access
- Efficient analytical queries without full table scans

---

## Domain Context

### Smart Meter (Grid Side)
Reports:
- `meterId`
- `kwhConsumedAc`
- `voltage`
- `timestamp`

### Vehicle / Charger (Vehicle Side)
Reports:
- `vehicleId`
- `kwhDeliveredDc`
- `soc`
- `batteryTemp`
- `timestamp`

### Power Loss Thesis

Energy loss occurs due to heat and conversion inefficiencies.  
Efficiency is calculated as:


A drop below expected thresholds (e.g., <85%) may indicate hardware issues or energy leakage.

---

## Architecture Overview

The application is built using:

- **NestJS (TypeScript)**
- **PostgreSQL**
- **TypeORM**
- **Docker & Docker Compose**

### Modular Structure

The system is divided into two main modules:

- **IngestModule** → Handles high-frequency telemetry ingestion (write-heavy path)
- **AnalyticsModule** → Handles read-heavy analytical queries

This separation ensures clean responsibility boundaries and scalability.

---

## Data Strategy (Hot vs Cold Storage)

At scale:

- 10,000 devices
- 1 heartbeat per minute
- ≈ 14.4 million records per day

To support this load efficiently, the database follows a **Hot + Cold storage pattern**.

---

### Historical Store (Cold Path)

Purpose:
- Long-term storage
- Audit trail
- Analytical reporting

Characteristics:
- Append-only
- Uses `INSERT` only
- Stores every heartbeat
- Indexed by `(vehicle_id, timestamp)` and `(meter_id, timestamp)`

This ensures immutability and historical accuracy.

---

### Operational Store (Hot Path)

Purpose:
- Fast dashboard queries
- Current state retrieval

Characteristics:
- Stores only latest state per device
- Uses `UPSERT`
- Avoids scanning millions of historical rows

This enables constant-time access for live status.

---

## Persistence Strategy

### INSERT for History

Historical telemetry is immutable and stored using `INSERT` to maintain a complete audit trail.

### UPSERT for Live Data

Live tables use `UPSERT` with unique constraints to atomically update the latest device state.

This ensures:

- No duplicates  
- Atomic updates  
- High performance  

---

## Vehicle-to-Meter Correlation

Since vehicle and meter telemetry are independent streams, a **correlation layer** is required to calculate efficiency accurately.  

We introduced a **vehicle-to-meter mapping table**:

| vehicleId | meterId |
|-----------|---------|
| V1        | M1      |
| V2        | M2      |

- Mapping is **master data**, created during fleet onboarding.
- Telemetry streams do **not** create mapping automatically.
- Analytics queries use this mapping to fetch AC data for the corresponding vehicle.

---

## Analytical Endpoint

### GET `/v1/analytics/performance/:vehicleId`

Returns a 24-hour summary including:

- Total AC energy consumed
- Total DC energy delivered
- Efficiency ratio (DC / AC)
- Average battery temperature

The query filters data using:

```sql
WHERE timestamp >= NOW() - INTERVAL '24 hours'


Example API Usage

- Ingest Telemetry

POST http://localhost:3000/v1/ingest

Vehicle Payload:
{
  "vehicleId": "V1",
  "soc": 80,
  "kwhDeliveredDc": 12.5,
  "batteryTemp": 35,
  "timestamp": "2026-02-12T10:00:00Z"
}
Meter Payload:
{
  "meterId": "M1",
  "kwhConsumedAc": 15,
  "voltage": 220,
  "timestamp": "2026-02-12T12:00:00Z"
}

Analytics Response:
GET http://localhost:3000/v1/analytics/performance/V2

{
  "vehicleId": "V1",
  "last24Hours": {
    "totalAc": 46.2,
    "totalDc": 39.9,
    "efficiency": 0.86,
    "avgBatteryTemp": 35
  }
}
