ALTER TABLE listings
  MODIFY price_amount DECIMAL(14,2) UNSIGNED NULL,
  MODIFY buy_price DECIMAL(14,2) UNSIGNED NULL,
  MODIFY rent_monthly_price DECIMAL(14,2) UNSIGNED NULL,
  MODIFY deposit_amount DECIMAL(14,2) UNSIGNED NULL,
  ADD COLUMN transaction_mode ENUM('SALE','RENT') NOT NULL DEFAULT 'SALE' AFTER section,
  ADD COLUMN listing_channel ENUM('STANDARD','SENIOR_HOME') NOT NULL DEFAULT 'STANDARD' AFTER transaction_mode,
  ADD COLUMN public_status_label VARCHAR(120) NULL AFTER status,
  ADD COLUMN normalized_property_type VARCHAR(80) NULL AFTER property_type,
  ADD COLUMN special_category VARCHAR(80) NULL AFTER normalized_property_type,
  ADD COLUMN property_condition VARCHAR(80) NULL AFTER special_category,
  ADD COLUMN condition_label VARCHAR(120) NULL AFTER property_condition,
  ADD COLUMN view_type VARCHAR(40) NULL AFTER condition_label,
  ADD COLUMN floor_count SMALLINT UNSIGNED NULL AFTER bathrooms,
  ADD COLUMN garage_spaces SMALLINT UNSIGNED NULL AFTER floor_count,
  ADD COLUMN deposit_months DECIMAL(5,2) UNSIGNED NULL AFTER deposit_amount,
  ADD COLUMN village VARCHAR(160) NULL AFTER street_address,
  ADD COLUMN soi VARCHAR(160) NULL AFTER village,
  ADD COLUMN tambon VARCHAR(120) NULL AFTER soi,
  ADD COLUMN amphoe VARCHAR(120) NULL AFTER tambon,
  ADD COLUMN down_payment_amount DECIMAL(14,2) UNSIGNED NULL AFTER deposit_months,
  ADD COLUMN mortgage_term VARCHAR(80) NULL AFTER down_payment_amount,
  ADD COLUMN mortgage_interest_rate DECIMAL(6,3) UNSIGNED NULL AFTER mortgage_term,
  ADD COLUMN estimated_monthly_mortgage DECIMAL(14,2) UNSIGNED NULL AFTER mortgage_interest_rate;

UPDATE listings
SET transaction_mode = CASE WHEN section = 'RENT' THEN 'RENT' ELSE 'SALE' END,
    listing_channel = CASE WHEN section = 'SENIOR_HOME' THEN 'SENIOR_HOME' ELSE 'STANDARD' END,
    public_status_label = CASE status WHEN 'PUBLISHED' THEN 'Published' WHEN 'ARCHIVED' THEN 'Archived' ELSE 'Draft' END,
    normalized_property_type = property_type,
    special_category = category;

CREATE TABLE agents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(190) NOT NULL,
  agency VARCHAR(160) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_verified TINYINT(1) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_agents_active_name (is_active, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE listing_agent_assignments (
  listing_id BIGINT UNSIGNED PRIMARY KEY,
  agent_id BIGINT UNSIGNED NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 1,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_listing_agent_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  CONSTRAINT fk_listing_agent_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE senior_details (
  listing_id BIGINT UNSIGNED PRIMARY KEY,
  room_size DECIMAL(12,2) NULL,
  building_size DECIMAL(12,2) NULL,
  caregiver_included TINYINT(1) NULL,
  caregiver_notes TEXT NULL,
  senior_care_service VARCHAR(160) NULL,
  service_duration VARCHAR(80) NULL,
  service_deposit DECIMAL(14,2) NULL,
  monthly_service_fee DECIMAL(14,2) NULL,
  services_included JSON NULL,
  senior_property_features JSON NULL,
  community_amenities JSON NULL,
  CONSTRAINT fk_senior_details_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE listing_nearby_locations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id BIGINT UNSIGNED NOT NULL,
  location_type VARCHAR(60) NOT NULL,
  name VARCHAR(180) NOT NULL,
  distance_label VARCHAR(80) NOT NULL,
  distance_meters DECIMAL(12,2) NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_nearby_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  INDEX idx_nearby_listing_sort (listing_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE seller_applications
  ADD COLUMN province VARCHAR(120) NULL AFTER location,
  ADD COLUMN district VARCHAR(120) NULL AFTER province,
  ADD COLUMN timeline VARCHAR(120) NULL AFTER district,
  ADD COLUMN property_details JSON NULL AFTER timeline;
