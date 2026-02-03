# Power BI Dashboards

## Overview

Power BI dashboards that connect to Azure SQL analytics database. Dashboards refresh automatically after ADF pipeline completes.

## Architecture

```
ADF Pipeline (00:00 UTC)
    ↓
Azure SQL Database Updated
    ↓
Power BI Scheduled Refresh (00:30 UTC)
    ↓
Dashboards Update Automatically
```

## Dashboards

### 1. Executive Dashboard
- **Daily Revenue**: Total revenue, completed orders
- **Order Trends**: Orders over time (line chart)
- **Status Distribution**: Pie chart of order statuses
- **Top Procedures**: Bar chart of most popular procedures

### 2. Operational Dashboard
- **Today's Orders**: Real-time order list
- **Room Utilization**: Orders by room
- **Queue Status**: Current queue numbers
- **Worker Performance**: Tests completed per worker

### 3. Analytics Dashboard
- **Patient Demographics**: Age groups, repeat customers
- **Procedure Performance**: Revenue, completion rates
- **Time Analysis**: Peak hours, average processing time
- **Revenue Forecast**: Trend analysis

## Setup Instructions

### 1. Create Power BI Report

1. Open Power BI Desktop
2. **Get Data** → **Azure SQL Database**
3. Enter Azure SQL connection string
4. Select tables:
   - `fact_daily_orders`
   - `fact_daily_revenue`
   - `dim_procedure_performance`
   - `dim_patient_demographics`

### 2. Build Visualizations

#### Daily Revenue Card
```
Visual: Card
Field: fact_daily_revenue[total_revenue]
Filter: revenue_date = TODAY()
```

#### Orders Over Time
```
Visual: Line Chart
X-axis: fact_daily_orders[order_date]
Y-axis: COUNT(fact_daily_orders[order_id])
```

#### Top Procedures
```
Visual: Bar Chart
X-axis: dim_procedure_performance[procedure_name]
Y-axis: dim_procedure_performance[total_revenue]
Sort: Descending
```

#### Status Distribution
```
Visual: Pie Chart
Values: fact_daily_orders[order_status]
```

### 3. Publish to Power BI Service

1. Click **Publish** in Power BI Desktop
2. Select workspace
3. Wait for upload

### 4. Configure Scheduled Refresh

1. Go to Power BI Service (app.powerbi.com)
2. Navigate to your dataset
3. Click **Settings** → **Scheduled refresh**
4. Configure:
   - **Refresh frequency**: Daily
   - **Time**: 00:30 UTC (30 min after ADF)
   - **Timezone**: UTC
   - **Enable**: ✅

### 5. Set Up Data Source Credentials

1. In Power BI Service → Dataset settings
2. Click **Data source credentials**
3. Enter Azure SQL credentials
4. Test connection
5. Save

## Refresh Schedule

**Recommended Timing**:
- **ADF Pipeline**: 00:00 UTC (daily)
- **Power BI Refresh**: 00:30 UTC (daily)

This ensures:
- ADF completes data load
- Power BI refreshes with fresh data
- Dashboards update automatically

## How It Works (Interview Answer)

**Question**: "How is your BI kept up to date?"

**Answer**: 
> "ADF runs scheduled ETL pipelines daily at midnight to extract data from PostgreSQL production database and load it into Azure SQL analytics tables. Power BI performs scheduled dataset refreshes at 12:30 AM, pulling the updated data from Azure SQL. This pull-based refresh model ensures dashboards are automatically updated with the latest analytics data."

## Key Points

✅ **ADF automation**: YES - Runs on schedule  
✅ **Power BI auto-refresh**: YES - Scheduled refresh  
❌ **Direct ADF → Power BI push**: NO - Not how it works  
✅ **Pull-based refresh**: Industry standard  

## Troubleshooting

### Refresh Fails
- Check Azure SQL connection credentials
- Verify ADF pipeline completed successfully
- Check Power BI service status

### Data Not Updating
- Verify ADF pipeline ran
- Check Azure SQL tables have new data
- Manually trigger Power BI refresh to test

### Performance Issues
- Optimize Azure SQL queries
- Add indexes to analytics tables
- Consider incremental refresh in Power BI

## CV Bullet Point

> "Automated end-to-end data pipelines with Azure Data Factory and scheduled Power BI refreshes for operational analytics and business intelligence."
