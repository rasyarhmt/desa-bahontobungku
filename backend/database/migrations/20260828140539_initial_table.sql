-- +migrate Up

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin','admin') NOT NULL DEFAULT 'admin',
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email` (`email`)
);

CREATE TABLE `aparatur` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(100) NOT NULL,
  `nip` VARCHAR(30) NOT NULL,
  `jabatan` VARCHAR(100) NOT NULL,
  `telepon` VARCHAR(20) DEFAULT NULL,
  `foto` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `berita` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `foto` VARCHAR(255) NOT NULL,
  `judul` VARCHAR(255) NOT NULL,
  `isi` TEXT NOT NULL,
  `tanggalTerbit` DATE NOT NULL,
  `penulis` VARCHAR(100) NOT NULL,
  `status` ENUM('dipublikasi','draft') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `danamasuk` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tahun` INT NOT NULL,
  `bulan` INT NOT NULL,
  `jumlah` DECIMAL(15,2) NOT NULL,
  `sumber` VARCHAR(255) NOT NULL,
  `keterangan` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `danakeluar` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tahun` INT NOT NULL,
  `bulan` INT NOT NULL,
  `jumlah` DECIMAL(15,2) NOT NULL,
  `kategori` VARCHAR(255) NOT NULL,
  `keterangan` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `pengumuman` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(255) NOT NULL,
  `isi` TEXT NOT NULL,
  `tanggalMulai` DATE NOT NULL,
  `tanggalSelesai` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `media` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(100) NOT NULL,
  `tipe` ENUM('foto','video','dokumen') NOT NULL,
  `file` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT,
  `thumbnail` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `surat_template` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kode` VARCHAR(50) NOT NULL,
  `nama_template` VARCHAR(255) NOT NULL,
  `file_template` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT,
  `status` ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_template_kode` (`kode`)
);

CREATE TABLE `status_keluarga` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(100) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_status_keluarga_nama` (`nama`)
);

CREATE TABLE `penduduk` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nik_hash` CHAR(64) NOT NULL,
  `nik` VARCHAR(255) NOT NULL,            -- Dienkripsi (Cukup 255)
  `nama` VARCHAR(512) NOT NULL,           -- Dienkripsi
  `alamat` TEXT DEFAULT NULL,             -- Dienkripsi
  `tanggalLahir` VARCHAR(255) DEFAULT NULL, -- Dienkripsi
  `tempatLahir` VARCHAR(512) DEFAULT NULL,  -- Dienkripsi
  `nomor_kk` VARCHAR(255) DEFAULT NULL,     -- Dienkripsi
  `jenisKelamin` ENUM('laki-laki','perempuan') NOT NULL,
  `agama` VARCHAR(255) DEFAULT NULL,
  `id_status_keluarga` INT DEFAULT NULL,
  `id_kepalakeluarga` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nik_hash` (`nik_hash`),
  KEY `idx_penduduk_status_keluarga` (`id_status_keluarga`),
  KEY `idx_penduduk_kepalakeluarga` (`id_kepalakeluarga`),
  CONSTRAINT `fk_penduduk_status_keluarga`
    FOREIGN KEY (`id_status_keluarga`)
    REFERENCES `status_keluarga` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_penduduk_kepalakeluarga`
    FOREIGN KEY (`id_kepalakeluarga`)
    REFERENCES `penduduk` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE `user_refresh_token` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `is_revoked` BOOLEAN NOT NULL DEFAULT FALSE,
  `expired_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_token_hash` (`token_hash`),
  KEY `idx_token_user_active` (`user_id`, `is_revoked`, `expired_at`),
  CONSTRAINT `fk_refresh_token_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE `pelayanan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama_layanan` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT NOT NULL,
  `id_surat_template` INT NOT NULL,
  `status` ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pelayanan_template` (`id_surat_template`),
  CONSTRAINT `fk_pelayanan_template`
    FOREIGN KEY (`id_surat_template`)
    REFERENCES `surat_template` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE `suratmasuk` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nomorSurat` VARCHAR(50) NOT NULL,
  `pengirim` VARCHAR(512) NOT NULL,       -- Dienkripsi
  `perihal` TEXT DEFAULT NULL,            -- Dienkripsi
  `tanggalTerima` DATE NOT NULL,
  `file` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nomorSurat_masuk` (`nomorSurat`)
);

CREATE TABLE `log_cetak_surat` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kode_unik` VARCHAR(32) NOT NULL,
  `id_template` INT DEFAULT NULL,
  `id_pelayanan` INT DEFAULT NULL,
  `nama_pemohon` VARCHAR(512) DEFAULT NULL, -- Dienkripsi
  `nik_pemohon` VARCHAR(255) DEFAULT NULL,  -- Dienkripsi
  `file` VARCHAR(255) DEFAULT NULL,
  `nomor_surat` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('dicetak', 'diresmikan') NOT NULL DEFAULT 'dicetak',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_kode_unik` (`kode_unik`),
  KEY `idx_log_template` (`id_template`),
  KEY `idx_log_pelayanan` (`id_pelayanan`),
  CONSTRAINT `fk_log_template`
    FOREIGN KEY (`id_template`)
    REFERENCES `surat_template` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_log_pelayanan`
    FOREIGN KEY (`id_pelayanan`)
    REFERENCES `pelayanan` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE `suratkeluar` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nomorSurat` VARCHAR(50) NOT NULL,
  `penerima` VARCHAR(512) NOT NULL,       -- Dienkripsi
  `perihal` TEXT DEFAULT NULL,            -- Dienkripsi
  `tanggalKirim` DATE NOT NULL,
  `file` VARCHAR(255) DEFAULT NULL,
  `id_log_cetak` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nomorSurat_keluar` (`nomorSurat`),
  KEY `idx_suratkeluar_log` (`id_log_cetak`),
  CONSTRAINT `fk_suratkeluar_log`
    FOREIGN KEY (`id_log_cetak`)
    REFERENCES `log_cetak_surat` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE `surat_template_field` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_template` INT NOT NULL,
  `field_key` VARCHAR(100) NOT NULL,
  `label` VARCHAR(150) NOT NULL,
  `tipe` ENUM('text','textarea','date','number','select') NOT NULL DEFAULT 'text',
  `options` TEXT DEFAULT NULL,
  `required` BOOLEAN NOT NULL DEFAULT TRUE,
  `urutan` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_template_field` (`id_template`, `field_key`),
  KEY `idx_template_field_template` (`id_template`),
  CONSTRAINT `fk_template_field_template`
    FOREIGN KEY (`id_template`)
    REFERENCES `surat_template` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- +migrate Down

DROP TABLE IF EXISTS `surat_template_field`;
DROP TABLE IF EXISTS `suratkeluar`;
DROP TABLE IF EXISTS `log_cetak_surat`;
DROP TABLE IF EXISTS `suratmasuk`;
DROP TABLE IF EXISTS `pelayanan`;
DROP TABLE IF EXISTS `user_refresh_token`;
DROP TABLE IF EXISTS `penduduk`;
DROP TABLE IF EXISTS `status_keluarga`;
DROP TABLE IF EXISTS `surat_template`;
DROP TABLE IF EXISTS `media`;
DROP TABLE IF EXISTS `pengumuman`;
DROP TABLE IF EXISTS `danakeluar`;
DROP TABLE IF EXISTS `danamasuk`;
DROP TABLE IF EXISTS `berita`;
DROP TABLE IF EXISTS `aparatur`;
DROP TABLE IF EXISTS `users`;