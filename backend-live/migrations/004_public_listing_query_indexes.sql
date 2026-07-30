ALTER TABLE listings
  ADD INDEX idx_listings_public_updated (status, updated_at),
  ADD INDEX idx_listings_public_transaction_updated (status, transaction_mode, updated_at),
  ADD INDEX idx_listings_public_location (status, province, district),
  ADD INDEX idx_listings_public_type (status, normalized_property_type),
  ADD INDEX idx_listings_public_category_view (status, special_category, view_type),
  ADD INDEX idx_listings_public_sale_price (status, transaction_mode, buy_price),
  ADD INDEX idx_listings_public_rent_price (status, transaction_mode, rent_monthly_price);
