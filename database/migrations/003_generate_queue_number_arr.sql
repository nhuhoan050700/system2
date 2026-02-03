-- Add wrapper for n8n (array param → first element → generate_queue_number)
-- Run once on your existing database (Railway → Data → Query, then paste and Run).

CREATE OR REPLACE FUNCTION generate_queue_number_arr(proc_room_arr anyarray) RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN generate_queue_number(proc_room_arr[1]::text);
END;
$$ LANGUAGE plpgsql;
