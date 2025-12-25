-- Add email verification column to app_user table
ALTER TABLE app_user
ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE NOT NULL;

-- Create sequence for email verification tokens
CREATE SEQUENCE email_verification_tokens_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create email verification tokens table
CREATE TABLE email_verification_tokens (
    id BIGINT PRIMARY KEY DEFAULT nextval('email_verification_tokens_seq'),
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_email_verification_token_user FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE
);

-- Create index on token for faster lookups
CREATE INDEX idx_email_verification_token ON email_verification_tokens (token);

-- Create index on user_id for faster lookups
CREATE INDEX idx_email_verification_user_id ON email_verification_tokens (user_id);

-- Update existing users to have email verified set to true (so they can still log in)
UPDATE app_user
SET
    is_email_verified = TRUE
WHERE
    is_email_verified = FALSE;