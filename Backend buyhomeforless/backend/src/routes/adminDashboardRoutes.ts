import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { queryRows } from "../db/pool";
import { requireAuth, requireOneOfRoles } from "../middleware/auth";

export const adminDashboardRoutes = Router();
adminDashboardRoutes.use(requireAuth, requireOneOfRoles(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]));

adminDashboardRoutes.get("/dashboard/overview", async (_request, response, next) => {
  try {
    const listingCounts = await queryRows<
      (RowDataPacket & {
        total_listings: number;
        published_listings: number;
        draft_listings: number;
        archived_listings: number;
        deleted_listings: number;
      })[]
    >(
      `SELECT
         COUNT(*) AS total_listings,
         SUM(CASE WHEN status = 'PUBLISHED' THEN 1 ELSE 0 END) AS published_listings,
         SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) AS draft_listings,
         SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) AS archived_listings,
         SUM(CASE WHEN status = 'DELETED' THEN 1 ELSE 0 END) AS deleted_listings
       FROM listings`,
    );

    const userCounts = await queryRows<
      (RowDataPacket & {
        total_registered_users: number;
        total_employee_accounts: number;
      })[]
    >(
      `SELECT
         COUNT(*) AS total_registered_users,
         SUM(CASE WHEN role IN ('HEAD_ADMIN', 'ADMIN', 'EMPLOYEE') THEN 1 ELSE 0 END) AS total_employee_accounts
       FROM users`,
    );

    const sellerCounts = await queryRows<(RowDataPacket & { total_seller_applications: number })[]>(
      "SELECT COUNT(*) AS total_seller_applications FROM seller_applications",
    );

    const recentListings = await queryRows<
      (RowDataPacket & {
        id: number;
        title: string;
        status: string;
        section: string;
        category: string;
        created_at: string;
      })[]
    >(
      `SELECT id, title, status, section, category, created_at
       FROM listings
       ORDER BY created_at DESC
       LIMIT 8`,
    );

    const recentSellerApplications = await queryRows<
      (RowDataPacket & {
        id: number;
        full_name: string;
        property_type: string | null;
        location: string;
        status: string;
        created_at: string;
      })[]
    >(
      `SELECT id, full_name, property_type, location, status, created_at
       FROM seller_applications
       ORDER BY created_at DESC
       LIMIT 8`,
    );

    response.json({
      totalListings: listingCounts[0]?.total_listings ?? 0,
      publishedListings: listingCounts[0]?.published_listings ?? 0,
      draftListings: listingCounts[0]?.draft_listings ?? 0,
      archivedListings: listingCounts[0]?.archived_listings ?? 0,
      deletedListings: listingCounts[0]?.deleted_listings ?? 0,
      totalRegisteredUsers: userCounts[0]?.total_registered_users ?? 0,
      totalSellerApplications: sellerCounts[0]?.total_seller_applications ?? 0,
      totalEmployeeAccounts: userCounts[0]?.total_employee_accounts ?? 0,
      recentListings,
      recentSellerApplications,
    });
  } catch (error) {
    next(error);
  }
});
