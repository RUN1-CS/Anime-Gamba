-- Script to give user a waifu
UPDATE users SET waifus = COALESCE(waifus, '[]'::jsonb) || to_jsonb("<waifu_name>") WHERE id = <user_id> RETURNING waifus
-- Warning: Replace <waifu_name> with the name of the waifu you want to add and <user_id> with the ID of the user you want to update.

-- Script to add score to a user
UPDATE users SET score = COALESCE(score, 0) + <score_value> WHERE id = <user_id> RETURNING score
-- Warning: Replace <score_value> with the number of points you want to add and <user_id> with the ID of the user you want to update.
-- Warning: Score is based on favorites and WILL change