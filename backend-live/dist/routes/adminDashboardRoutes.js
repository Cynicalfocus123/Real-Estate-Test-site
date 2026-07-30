"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDashboardRoutes = void 0;
const express_1 = require("express");
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
exports.adminDashboardRoutes = (0, express_1.Router)();
exports.adminDashboardRoutes.use(auth_1.requireAuth, (0, auth_1.requireOneOfRoles)(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]));
exports.adminDashboardRoutes.get("/dashboard/overview", async (_request, response, next) => {
    try {
        const listingCounts = await (0, pool_1.queryRows)(`SELECT
         COUNT(*) AS total_listings,
         SUM(CASE WHEN status = 'PUBLISHED' THEN 1 ELSE 0 END) AS published_listings,
         SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) AS draft_listings,
         SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) AS archived_listings,
         SUM(CASE WHEN status = 'DELETED' THEN 1 ELSE 0 END) AS deleted_listings
       FROM listings`);
        const employeeCounts = await (0, pool_1.queryRows)("SELECT COUNT(*) AS total_employee_accounts FROM users WHERE role IN ('HEAD_ADMIN', 'ADMIN', 'EMPLOYEE')");
        const customerCounts = await (0, pool_1.queryRows)("SELECT COUNT(*) AS total_customer_registrations FROM customer_accounts");
        const sellerCounts = await (0, pool_1.queryRows)("SELECT COUNT(*) AS total_seller_applications FROM seller_applications");
        const recentListings = await (0, pool_1.queryRows)(`SELECT id, title, status, section, category, created_at
       FROM listings
       ORDER BY created_at DESC
       LIMIT 8`);
        const recentSellerApplications = await (0, pool_1.queryRows)(`SELECT id, full_name, property_type, location, status, created_at
       FROM seller_applications
       ORDER BY created_at DESC
       LIMIT 8`);
        response.json({
            totalListings: listingCounts[0]?.total_listings ?? 0,
            publishedListings: listingCounts[0]?.published_listings ?? 0,
            draftListings: listingCounts[0]?.draft_listings ?? 0,
            archivedListings: listingCounts[0]?.archived_listings ?? 0,
            deletedListings: listingCounts[0]?.deleted_listings ?? 0,
            totalCustomerRegistrations: customerCounts[0]?.total_customer_registrations ?? 0,
            totalSellerApplications: sellerCounts[0]?.total_seller_applications ?? 0,
            totalEmployeeAccounts: employeeCounts[0]?.total_employee_accounts ?? 0,
            recentListings,
            recentSellerApplications,
        });
    }
    catch (error) {
        next(error);
    }
});
