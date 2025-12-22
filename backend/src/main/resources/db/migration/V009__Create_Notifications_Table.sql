-- 🔔 Notifications Table für Notification Center (Nachweis-fokussiert)

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'INFO', -- INFO, SUCCESS, WARNING, ERROR
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD', -- UNREAD, READ
    nachweis_id UUID, -- Bezug zum Nachweis
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    action_url VARCHAR(500),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE
);

-- Indices für Performance
CREATE INDEX idx_notifications_user_id_status ON notifications (user_id, status);

CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);

CREATE INDEX idx_notifications_user_id_created_at ON notifications (user_id, created_at DESC);

CREATE INDEX idx_notifications_nachweis_id ON notifications (nachweis_id);

-- Kommentar zur Erklärung
COMMENT ON TABLE notifications IS '🔔 Speichert Benachrichtigungen zu Nachweisen (akzeptiert, abgelehnt, etc.)';