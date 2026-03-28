--CREATE TABLE waifus (
--    id SERIAL PRIMARY KEY,
--    name VARCHAR(255) NOT NULL,
--    image_url VARCHAR(255) NOT NULL,
--    score INTEGER DEFAULT 0,
--    rarity VARCHAR(50) NOT NULL
--);

INSERT INTO waifus (name, image_url, score, rarity) VALUES
-- 1 (Mythic 1 - 6)
('Zero Two', 'https://example.com/zero-two.jpg', 10000000, 'Mythic'),
-- 2
('Kurisu Makise', 'https://example.com/kurisu.jpg', 9999000, 'Mythic'),
-- 3
('Rem', 'https://example.com/rem.jpg', 9950000, 'Mythic'),
-- 4
('Mikasa Ackerman', 'https://example.com/mikasa.jpg', 9800000, 'Mythic'),
-- 5
('Saber', 'https://example.com/saber.jpg', 9750000, 'Mythic'),
-- 6
('Hitagi Senjougahara', 'https://example.com/hitagi.jpg', 9600000, 'Mythic'),
-- 7 (Legendry 7 - 11)
('Yukino Yukinoshita', 'https://example.com/yukino.jpg', 8500000, 'Legendry'),
-- 8
('Asuka Langley Soryu', 'https://example.com/asuka.jpg', 8400000, 'Legendry'),
-- 9
('Violet Evergarden', 'https://example.com/violet.jpg', 8100000, 'Legendry'),
-- 10
('Kaguya Shinomiya', 'https://example.com/kaguya.jpg', 8000000, 'Legendry'),
-- 11
('Holow', 'https://example.com/holow.jpg', 7800000, 'Legendry'),
-- 12 (Epic 12 - 17)
('Megumin', 'https://example.com/megumin.jpg', 6500000, 'Epic'),
-- 13
('Rin Tohsaka', 'https://example.com/rin.jpg', 6400000, 'Epic'),
-- 14
('C.C.', 'https://example.com/cc.jpg', 6200000, 'Epic'),
-- 15
('Esdeath', 'https://example.com/esdeath.jpg', 5900000, 'Epic'),
-- 16
('Yoruichi Shihouin', 'https://example.com/yoruichi.jpg', 5700000, 'Epic'),
-- 17
('Frieren', 'https://example.com/frieren.jpg', 5500000, 'Epic'),
-- 18 (Rare 18 - 22)
('Marin Kitagawa', 'https://example.com/marin.jpg', 4500000, 'Rare'),
-- 19
('Yor Forger', 'https://example.com/yor.jpg', 4200000, 'Rare'),
-- 20
('Makima', 'https://example.com/makima.jpg', 4000000, 'Rare'),
-- 21
('Power', 'https://example.com/power.jpg', 3800000, 'Rare'),
-- 22
('Lucy', 'https://example.com/lucy.jpg', 3500000, 'Rare'),
-- 23 (Uncommon 23 - 25)
('Emilia', 'https://example.com/emilia.jpg', 2500000, 'Uncommon'),
-- 24
('Nezuko Kamado', 'https://example.com/nezuko.jpg', 2000000, 'Uncommon'),
-- 25
('Miku Nakano', 'https://example.com/miku.jpg', 1800000, 'Uncommon');