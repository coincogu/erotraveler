-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert sample hotel data
INSERT INTO hotels (name, location, description, image_url, price_per_night) VALUES
    ('The Ritz-Carlton', 'San Francisco, CA', 'Luxury hotel in the heart of San Francisco, offering stunning views of the city and bay. Features world-class dining and spa services.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 599.00),
    ('Fontainebleau Miami Beach', 'Miami Beach, FL', 'Iconic oceanfront resort featuring multiple pools, luxury spa, and award-winning restaurants. Located on the famous Miami Beach strip.', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 449.00),
    ('The Venetian Resort', 'Las Vegas, NV', 'Luxury resort and casino featuring Venice-inspired architecture, gondola rides, and world-class entertainment. Located on the Las Vegas Strip.', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 299.00),
    ('The Plaza Hotel', 'New York, NY', 'Historic luxury hotel at the corner of Central Park, offering elegant rooms, fine dining, and the famous Palm Court. A New York City landmark.', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 799.00),
    ('The Driskill Hotel', 'Austin, TX', 'Historic luxury hotel in downtown Austin, featuring elegant architecture, fine dining, and live music. A landmark of Texas hospitality.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 349.00); 