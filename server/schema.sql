-- Pedro Vitor — PVcoding Studio. MySQL 8 / MariaDB 10.6+.
-- Executar com uma conta de migração, antes de iniciar a aplicação.
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(40) PRIMARY KEY,
  encrypted_value MEDIUMTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quote_requests (
  id CHAR(36) PRIMARY KEY,
  submission_key CHAR(64) NOT NULL UNIQUE,
  encrypted_payload MEDIUMTEXT NOT NULL,
  notice_version VARCHAR(20) NOT NULL,
  notification_status VARCHAR(12) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_quotes_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sem mensagem, IP, senha ou contato no histórico operacional.
CREATE TABLE IF NOT EXISTS admin_audit (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(40) NOT NULL,
  resource_id CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
