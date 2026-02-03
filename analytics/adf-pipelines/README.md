# Azure Data Factory (ADF) Pipelines

## Overview

This directory contains ADF pipeline definitions for extracting data from PostgreSQL (production) and loading it into Azure SQL (analytics database) for Power BI reporting.

## Architecture

```
PostgreSQL (Railway - Production)
        ↓
    ADF Pipeline (Scheduled ETL)
        ↓
Azure SQL Database (Analytics)
        ↓
Power BI (Scheduled Refresh)
```

## Pipeline: Daily Hospital Analytics ETL

**Schedule**: Daily at 00:00 UTC (runs automatically)

**Steps**:
1. **Extract**: Pull data from PostgreSQL production database
2. **Transform**: Clean and aggregate data
3. **Load**: Upsert into Azure SQL analytics tables

## Setup Instructions

### 1. Create Azure SQL Database

1. Go to Azure Portal → Create SQL Database
2. Choose Basic tier (sufficient for analytics)
3. Note connection string

### 2. Create ADF Pipeline

1. In Azure Data Factory:
   - Create new pipeline: "Daily Hospital Analytics ETL"
   - Add Copy activity: PostgreSQL → Azure SQL
   - Configure source (PostgreSQL Railway connection)
   - Configure sink (Azure SQL connection)

### 3. Configure Schedule Trigger

1. In ADF, create new **Schedule Trigger**:
   - Name: "Daily Analytics ETL"
   - Frequency: Daily
   - Time: 00:00 UTC
   - Timezone: UTC

2. Attach trigger to pipeline

### 4. Test Pipeline

1. Click "Debug" in ADF
2. Verify data flows correctly
3. Check Azure SQL tables are populated

## Data Flow

### Source Tables (PostgreSQL)
- `orders`
- `users`
- `procedures`
- `order_updates`

### Target Tables (Azure SQL)
- `fact_daily_orders` - Order details
- `fact_daily_revenue` - Revenue metrics
- `dim_procedure_performance` - Procedure analytics
- `dim_patient_demographics` - Patient insights
- `dim_worker_performance` - Staff metrics
- `fact_hourly_checkins` - Time series data

## Monitoring

- Check ADF pipeline runs in Azure Portal
- Monitor execution time and errors
- Set up alerts for failed runs

## Important Notes

✅ **ADF runs automatically** on schedule  
✅ **Power BI pulls** data after ADF completes  
❌ ADF does NOT push to Power BI directly  
✅ This is the **industry standard** approach
