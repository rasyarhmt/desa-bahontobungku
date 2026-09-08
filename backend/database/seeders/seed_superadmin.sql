-- +seeder
INSERT INTO `user` (nama, email, password, role)
VALUES ('Super Admin', 'adminBahontobungku@gmail.com', '$2a$10$.ZS4sWp6jRHI5TvcKYMdDOnzVajkZgCDavyY4WqvO2sw5hmxkcq/S', 'superadmin')
ON DUPLICATE KEY UPDATE 
    nama = VALUES(nama), 
    password = VALUES(password), 
    role = VALUES(role);