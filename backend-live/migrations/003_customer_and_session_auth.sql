CREATE TABLE IF NOT EXISTS customer_accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  phone VARCHAR(40) NULL,
  address VARCHAR(240) NULL,
  subdistrict VARCHAR(120) NULL,
  district VARCHAR(120) NULL,
  province VARCHAR(120) NULL,
  postal_code VARCHAR(20) NULL,
  status ENUM('PENDING_VERIFICATION','ACTIVE','DISABLED','DELETED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
  email_verified_at TIMESTAMP NULL,
  last_login_at TIMESTAMP NULL,
  notification_frequency ENUM('realtime','daily','none') NOT NULL DEFAULT 'realtime',
  marketing_preference TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_customer_accounts_email (email),
  INDEX idx_customer_accounts_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_customer_sessions_token_hash (token_hash),
  INDEX idx_customer_sessions_expiry (expires_at),
  INDEX idx_customer_sessions_customer (customer_id),
  CONSTRAINT fk_customer_sessions_customer FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_staff_sessions_token_hash (token_hash),
  INDEX idx_staff_sessions_expiry (expires_at),
  INDEX idx_staff_sessions_user (user_id),
  CONSTRAINT fk_staff_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_action_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  purpose ENUM('EMAIL_VERIFICATION','PASSWORD_RESET','EMAIL_CHANGE') NOT NULL,
  token_hash CHAR(64) NOT NULL,
  pending_email VARCHAR(190) NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_customer_action_tokens_hash (token_hash),
  INDEX idx_customer_action_tokens_expiry (expires_at),
  INDEX idx_customer_action_tokens_customer_purpose (customer_id, purpose, used_at),
  CONSTRAINT fk_customer_action_tokens_customer FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_favorites (
  customer_id BIGINT UNSIGNED NOT NULL,
  listing_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id, listing_id),
  INDEX idx_customer_favorites_listing (listing_id),
  CONSTRAINT fk_customer_favorites_customer FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_customer_favorites_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
