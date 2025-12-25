CREATE TABLE IF NOT EXISTS backup_metadata (
    id VARCHAR(36) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    restored_at TIMESTAMP,
    CONSTRAINT uk_backup_filename UNIQUE(file_name)
);

CREATE INDEX idx_backup_status ON backup_metadata(status);
CREATE INDEX idx_backup_created_at ON backup_metadata(created_at DESC);