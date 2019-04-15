CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    comment TEXT,
    username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_id INT NOT NULL REFERENCES images(id) 
);