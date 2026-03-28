-- Script to give a user every waifu
UPDATE users 
SET waifus = (SELECT jsonb_agg(id) FROM waifus)
WHERE id = 1;