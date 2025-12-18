-- Migration: V4 - Change team string to trainer relationship
-- Description: Converts the team field (String) to a proper @ManyToOne relationship with User
-- This fixes the bug where azubis lose their trainer when the trainer updates their name/email/username

-- 1. Add the trainer_id foreign key column
ALTER TABLE app_user ADD COLUMN trainer_id UUID;

-- 2. Create the foreign key constraint
ALTER TABLE app_user
ADD CONSTRAINT fk_app_user_trainer_id FOREIGN KEY (trainer_id) REFERENCES app_user (id) ON DELETE SET NULL;

-- 3. Drop the old team column (since we're replacing it with trainer_id)
ALTER TABLE app_user DROP COLUMN team;

-- 4. Create an index on trainer_id for better performance
CREATE INDEX idx_app_user_trainer_id ON app_user (trainer_id);

-- Migration complete: team field removed and replaced with trainer_id foreign key relationship