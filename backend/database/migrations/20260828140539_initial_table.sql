-- +migrate Up

CREATE TABLE `user` (
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
  `kategori` VARCHAR(100) DEFAULT NULL,
  `isi_html` TEXT NOT NULL,
  `daftar_placeholder` JSON DEFAULT NULL,
  `deskripsi` TEXT,
  `status` ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_template_kode` (`kode`)
);

CREATE TABLE `penduduk` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nik_hash` CHAR(64) NOT NULL,
  `nik` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `alamat` TEXT DEFAULT NULL,
  `tanggalLahir` VARCHAR(255) DEFAULT NULL,
  `tempatLahir` VARCHAR(255) DEFAULT NULL,
  `jenisKelamin` ENUM('laki-laki','perempuan') NOT NULL,
  `agama` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('kepala keluarga','istri','anak','mertua','cucu','menantu') DEFAULT NULL, -- Typo 'mentantu' diperbaiki
  `id_kepalakeluarga` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nik_hash` (`nik_hash`),
  KEY `idx_penduduk_kepalakeluarga` (`id_kepalakeluarga`),
  CONSTRAINT `fk_penduduk_kepalakeluarga` FOREIGN KEY (`id_kepalakeluarga`)
    REFERENCES `penduduk` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
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
  CONSTRAINT `fk_refresh_token_user` FOREIGN KEY (`user_id`)
    REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `pelayanan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama_layanan` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT NOT NULL,
  `id_surat_template` INT DEFAULT NULL,
  `status` ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pelayanan_template` (`id_surat_template`),
  CONSTRAINT `fk_pelayanan_template` FOREIGN KEY (`id_surat_template`)
    REFERENCES `surat_template` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE `suratmasuk` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nomorSurat` VARCHAR(50) NOT NULL,
  `pengirim` VARCHAR(100) NOT NULL,
  `perihal` TEXT DEFAULT NULL,
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
  `nama_pemohon` VARCHAR(255) DEFAULT NULL,
  `nik_pemohon` VARCHAR(255) DEFAULT NULL,
  `data_placeholder` JSON DEFAULT NULL,
  `status` ENUM('dicetak', 'diresmikan') NOT NULL DEFAULT 'dicetak', 
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_kode_unik` (`kode_unik`),
  KEY `idx_log_template` (`id_template`),
  CONSTRAINT `fk_log_template` FOREIGN KEY (`id_template`)
    REFERENCES `surat_template` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE `suratkeluar` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nomorSurat` VARCHAR(50) NOT NULL,
  `penerima` VARCHAR(100) NOT NULL,
  `perihal` TEXT DEFAULT NULL,
  `tanggalKirim` DATE NOT NULL,
  `file` VARCHAR(255) DEFAULT NULL,
  `id_log_cetak` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nomorSurat_keluar` (`nomorSurat`),
  KEY `idx_suratkeluar_log` (`id_log_cetak`),
  CONSTRAINT `fk_suratkeluar_log` FOREIGN KEY (`id_log_cetak`)
    REFERENCES `log_cetak_surat` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- +migrate Down

DROP TABLE IF EXISTS `suratkeluar`;
DROP TABLE IF EXISTS `log_cetak_surat`;
DROP TABLE IF EXISTS `suratmasuk`;
DROP TABLE IF EXISTS `pelayanan`;
DROP TABLE IF EXISTS `user_refresh_token`;
DROP TABLE IF EXISTS `penduduk`;
DROP TABLE IF EXISTS `surat_template`;
DROP TABLE IF EXISTS `media`;
DROP TABLE IF EXISTS `pengumuman`;
DROP TABLE IF EXISTS `danakeluar`;
DROP TABLE IF EXISTS `danamasuk`;
DROP TABLE IF EXISTS `berita`;
DROP TABLE IF EXISTS `aparatur`;
DROP TABLE IF EXISTS `user`;