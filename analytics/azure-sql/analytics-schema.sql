-- Azure SQL Analytics Database Schema
-- This is the target database for Power BI reports
-- ADF loads data from PostgreSQL (production) into these tables

-- Daily Orders Summary (Fact Table)
CREATE TABLE IF NOT EXISTS fact_daily_orders (
    order_date DATE NOT NULL,
    order_id INT PRIMARY KEY,
    user_id INT,
    procedure_id INT,
    procedure_name NVARCHAR(255),
    total_amount DECIMAL(10, 2),
    payment_status NVARCHAR(50),
    order_status NVARCHAR(50),
    room_number NVARCHAR(50),
    queue_number NVARCHAR(50),
    created_at DATETIME2,
    completed_at DATETIME2,
    processing_time_minutes INT,
    INDEX IX_order_date (order_date),
    INDEX IX_procedure_id (procedure_id),
    INDEX IX_order_status (order_status)
);

-- Daily Revenue Summary
CREATE TABLE IF NOT EXISTS fact_daily_revenue (
    revenue_date DATE PRIMARY KEY,
    total_orders INT,
    total_revenue DECIMAL(10, 2),
    completed_orders INT,
    completed_revenue DECIMAL(10, 2),
    pending_orders INT,
    cancelled_orders INT,
    average_order_value DECIMAL(10, 2),
    INDEX IX_revenue_date (revenue_date)
);

-- Procedure Performance (Dimension Table)
CREATE TABLE IF NOT EXISTS dim_procedure_performance (
    procedure_id INT PRIMARY KEY,
    procedure_name NVARCHAR(255),
    total_orders INT,
    total_revenue DECIMAL(10, 2),
    average_revenue DECIMAL(10, 2),
    completion_rate DECIMAL(5, 2),
    average_processing_time_minutes INT,
    last_updated DATETIME2 DEFAULT GETDATE()
);

-- Patient Demographics (Dimension Table)
CREATE TABLE IF NOT EXISTS dim_patient_demographics (
    user_id INT PRIMARY KEY,
    age_group NVARCHAR(50), -- '18-30', '31-45', '46-60', '60+'
    total_orders INT,
    total_spent DECIMAL(10, 2),
    last_visit_date DATE,
    preferred_procedure NVARCHAR(255)
);

-- Worker Performance (Dimension Table)
CREATE TABLE IF NOT EXISTS dim_worker_performance (
    worker_id INT PRIMARY KEY,
    worker_name NVARCHAR(255),
    total_tests_completed INT,
    average_completion_time_minutes INT,
    last_activity_date DATE,
    INDEX IX_worker_name (worker_name)
);

-- Hourly Check-ins (Time Series)
CREATE TABLE IF NOT EXISTS fact_hourly_checkins (
    checkin_datetime DATETIME2 PRIMARY KEY,
    hour_of_day INT,
    total_checkins INT,
    unique_patients INT,
    INDEX IX_hour_of_day (hour_of_day)
);

-- Stored Procedure: Refresh Daily Analytics
CREATE PROCEDURE sp_refresh_daily_analytics
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Refresh daily orders summary
    TRUNCATE TABLE fact_daily_orders;
    
    INSERT INTO fact_daily_orders
    SELECT 
        CAST(o.created_at AS DATE) as order_date,
        o.id as order_id,
        o.user_id,
        o.procedure_id,
        p.name as procedure_name,
        o.total_amount,
        o.payment_status,
        o.status as order_status,
        o.room_number,
        o.queue_number,
        o.created_at,
        o.completed_at,
        CASE 
            WHEN o.completed_at IS NOT NULL 
            THEN DATEDIFF(MINUTE, o.created_at, o.completed_at)
            ELSE NULL
        END as processing_time_minutes
    FROM orders o
    INNER JOIN procedures p ON o.procedure_id = p.id
    WHERE CAST(o.created_at AS DATE) >= DATEADD(DAY, -30, GETDATE());
    
    -- Refresh daily revenue summary
    MERGE fact_daily_revenue AS target
    USING (
        SELECT 
            CAST(created_at AS DATE) as revenue_date,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
            SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as completed_revenue,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
            AVG(total_amount) as average_order_value
        FROM orders
        WHERE CAST(created_at AS DATE) >= DATEADD(DAY, -30, GETDATE())
        GROUP BY CAST(created_at AS DATE)
    ) AS source
    ON target.revenue_date = source.revenue_date
    WHEN MATCHED THEN
        UPDATE SET
            total_orders = source.total_orders,
            total_revenue = source.total_revenue,
            completed_orders = source.completed_orders,
            completed_revenue = source.completed_revenue,
            pending_orders = source.pending_orders,
            cancelled_orders = source.cancelled_orders,
            average_order_value = source.average_order_value
    WHEN NOT MATCHED THEN
        INSERT (revenue_date, total_orders, total_revenue, completed_orders, completed_revenue, pending_orders, cancelled_orders, average_order_value)
        VALUES (source.revenue_date, source.total_orders, source.total_revenue, source.completed_orders, source.completed_revenue, source.pending_orders, source.cancelled_orders, source.average_order_value);
    
    -- Refresh procedure performance
    UPDATE dim_procedure_performance
    SET 
        total_orders = stats.total_orders,
        total_revenue = stats.total_revenue,
        average_revenue = stats.avg_revenue,
        completion_rate = stats.completion_rate,
        average_processing_time_minutes = stats.avg_time,
        last_updated = GETDATE()
    FROM (
        SELECT 
            p.id as procedure_id,
            COUNT(o.id) as total_orders,
            SUM(o.total_amount) as total_revenue,
            AVG(o.total_amount) as avg_revenue,
            CAST(SUM(CASE WHEN o.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(o.id) AS DECIMAL(5,2)) as completion_rate,
            AVG(DATEDIFF(MINUTE, o.created_at, o.completed_at)) as avg_time
        FROM procedures p
        LEFT JOIN orders o ON p.id = o.procedure_id
        WHERE o.created_at >= DATEADD(DAY, -30, GETDATE())
        GROUP BY p.id
    ) stats
    WHERE dim_procedure_performance.procedure_id = stats.procedure_id;
    
    PRINT 'Daily analytics refresh completed successfully';
END;
