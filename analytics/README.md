# Analytics Layer - ADF + Power BI Integration

## Overview

This analytics layer demonstrates enterprise-grade data pipeline architecture using Azure Data Factory (ADF) and Power BI, following industry-standard patterns.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production Layer                      │
│  PostgreSQL (Railway) - Hospital Testing Service DB    │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ ETL (Extract, Transform, Load)
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  Analytics Layer                         │
│  Azure Data Factory (ADF) - Scheduled Pipeline          │
│  • Runs daily at 00:00 UTC                              │
│  • Extracts from PostgreSQL                             │
│  • Transforms and aggregates data                       │
│  • Loads into Azure SQL                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Data Load
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Analytics Database                          │
│  Azure SQL Database - Optimized for Reporting          │
│  • Fact tables (orders, revenue)                         │
│  • Dimension tables (procedures, patients, workers)     │
│  • Pre-aggregated metrics                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Pull-based Refresh
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  Visualization Layer                     │
│  Power BI Service - Scheduled Refresh                    │
│  • Refreshes daily at 00:30 UTC (after ADF)            │
│  • Pulls data from Azure SQL                            │
│  • Updates dashboards automatically                     │
└─────────────────────────────────────────────────────────┘
```

## Key Concepts

### ✅ What This Demonstrates

1. **Scheduled ETL**: ADF runs automatically on schedule
2. **Data Warehouse Pattern**: Production DB → Analytics DB
3. **Pull-based Refresh**: Power BI pulls data (industry standard)
4. **Separation of Concerns**: Each layer has distinct responsibility
5. **Automated Pipeline**: End-to-end automation without manual intervention

### ❌ What This Does NOT Do

- ADF does NOT push data directly to Power BI
- Power BI is NOT triggered by ADF
- This is NOT a real-time system (batch processing)

## Components

### 1. Azure Data Factory Pipelines
- **Location**: `adf-pipelines/`
- **Purpose**: Extract from PostgreSQL, transform, load to Azure SQL
- **Schedule**: Daily at 00:00 UTC
- **Automation**: ✅ Fully automatic via trigger

### 2. Azure SQL Analytics Database
- **Location**: `azure-sql/analytics-schema.sql`
- **Purpose**: Optimized schema for reporting
- **Tables**: Fact and dimension tables
- **Stored Procedures**: Automated data refresh

### 3. Power BI Dashboards
- **Location**: `power-bi/`
- **Purpose**: Business intelligence visualizations
- **Refresh**: Scheduled daily at 00:30 UTC
- **Automation**: ✅ Pulls data automatically

## Setup Guide

### Step 1: Azure SQL Database
1. Create Azure SQL Database in Azure Portal
2. Run `azure-sql/analytics-schema.sql` to create tables
3. Note connection string

### Step 2: Azure Data Factory
1. Create ADF instance in Azure Portal
2. Create linked services:
   - PostgreSQL (source) - Railway connection
   - Azure SQL (sink) - Analytics database
3. Create pipeline from `adf-pipelines/daily-etl-pipeline.json`
4. Create schedule trigger: Daily at 00:00 UTC
5. Test and activate pipeline

### Step 3: Power BI
1. Open Power BI Desktop
2. Connect to Azure SQL Database
3. Import analytics tables
4. Create visualizations (see `power-bi/README.md`)
5. Publish to Power BI Service
6. Configure scheduled refresh: Daily at 00:30 UTC

## Interview Answers

### "How is your BI kept up to date?"

**Answer**:
> "ADF runs scheduled ETL pipelines daily at midnight to extract data from PostgreSQL production database and load it into Azure SQL analytics tables. Power BI performs scheduled dataset refreshes at 12:30 AM, pulling the updated data from Azure SQL. This pull-based refresh model ensures dashboards are automatically updated with the latest analytics data."

### "How does ADF integrate with Power BI?"

**Answer**:
> "ADF doesn't directly push to Power BI. Instead, ADF updates the analytics database (Azure SQL), and Power BI pulls data from that database on a scheduled refresh. This separation follows industry best practices - ADF handles data orchestration, Power BI handles visualization."

## CV Bullet Points

✅ **Safe to use**:
- "Automated end-to-end data pipelines with Azure Data Factory and scheduled Power BI refreshes for operational analytics"
- "Designed and implemented ETL pipelines extracting from PostgreSQL to Azure SQL for business intelligence"
- "Built Power BI dashboards with automated scheduled refreshes for real-time operational insights"

❌ **Avoid saying**:
- "ADF pushes data to Power BI" (incorrect)
- "Power BI is triggered by ADF" (not how it works)
- "Real-time Power BI updates" (it's batch, not real-time)

## File Structure

```
analytics/
├── README.md                    # This file
├── adf-pipelines/
│   ├── README.md                # ADF setup guide
│   └── daily-etl-pipeline.json  # Pipeline definition
├── azure-sql/
│   └── analytics-schema.sql     # Analytics database schema
└── power-bi/
    ├── README.md                # Power BI setup guide
    └── dashboard-measures.pbix-code  # DAX measures
```

## Timeline

**Daily Automation**:
- **00:00 UTC**: ADF pipeline starts
- **00:15 UTC**: ADF pipeline completes (estimated)
- **00:30 UTC**: Power BI refresh starts
- **00:35 UTC**: Power BI refresh completes
- **00:35 UTC**: Dashboards updated automatically ✅

## Monitoring

- **ADF**: Check pipeline runs in Azure Portal
- **Azure SQL**: Verify data in analytics tables
- **Power BI**: Check refresh history in Power BI Service

## Cost Considerations

- **Azure SQL**: Basic tier (~$5/month) sufficient for analytics
- **ADF**: Pay-per-use, minimal cost for daily runs
- **Power BI**: Free tier available, Pro required for scheduled refresh

## Next Steps

1. Set up Azure resources (SQL DB, ADF)
2. Configure ADF pipeline with your PostgreSQL connection
3. Create Power BI dashboards
4. Test end-to-end flow
5. Monitor and optimize

---

**This architecture follows enterprise best practices and is exactly how real companies implement analytics pipelines.**
