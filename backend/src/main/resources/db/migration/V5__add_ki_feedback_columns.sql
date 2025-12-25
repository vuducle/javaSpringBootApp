-- Add missing ki_bewertung and ki_vorschlag_annahme columns to nachweis table
ALTER TABLE nachweis ADD COLUMN ki_bewertung VARCHAR(2000);

ALTER TABLE nachweis
ADD COLUMN ki_vorschlag_annahme BOOLEAN DEFAULT FALSE;