-- IT Portal Database Initialization Script

-- Create portal_items table
CREATE TABLE IF NOT EXISTS portal_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on category for faster queries
CREATE INDEX IF NOT EXISTS idx_portal_items_category ON portal_items(category);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_portal_items_created_at ON portal_items(created_at DESC);

-- Insert sample data
INSERT INTO portal_items (title, description, category) VALUES
    ('Welcome to IT Portal', 'This is your central hub for IT architectural management', 'General'),
    ('System Architecture', 'Overview of the current system architecture', 'Architecture'),
    ('API Documentation', 'REST API endpoints and usage examples', 'Documentation'),
    ('Deployment Guide', 'Guide for deploying applications', 'Operations')
ON CONFLICT DO NOTHING;
