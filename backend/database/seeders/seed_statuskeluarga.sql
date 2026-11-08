-- +seeder
INSERT INTO `status_keluarga` (`nama`, `is_active`)
VALUES
  ('kepala keluarga', TRUE),
  ('istri', TRUE),
  ('anak', TRUE),
  ('mertua', TRUE),
  ('cucu', TRUE),
  ('menantu', TRUE)
ON DUPLICATE KEY UPDATE `is_active` = VALUES(`is_active`);
