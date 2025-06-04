-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    hotel_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    check_in TIMESTAMPTZ NOT NULL,
    check_out TIMESTAMPTZ NOT NULL,
    nights INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
); 