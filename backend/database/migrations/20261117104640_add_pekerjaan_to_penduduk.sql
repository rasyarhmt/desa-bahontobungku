-- +migrate Up

ALTER TABLE `penduduk`
  ADD COLUMN `pekerjaan` VARCHAR(255) DEFAULT NULL AFTER `agama`;

-- +migrate Down

ALTER TABLE `penduduk`
  DROP COLUMN `pekerjaan`;
