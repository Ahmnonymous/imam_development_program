-- Password Reset Tokens Table
-- Stores temporary tokens for password reset functionality
CREATE TABLE IF NOT EXISTS Password_Reset_Tokens (
    ID BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    employee_id BIGINT,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_employee_reset FOREIGN KEY (employee_id) REFERENCES Employee(ID) ON DELETE CASCADE
);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON Password_Reset_Tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON Password_Reset_Tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON Password_Reset_Tokens(expires_at);

-- Clean up expired tokens (older than 24 hours) - can be run periodically
-- DELETE FROM Password_Reset_Tokens WHERE expires_at < NOW() OR used = true;

