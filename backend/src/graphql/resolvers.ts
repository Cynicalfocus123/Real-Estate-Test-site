import type { IResolvers } from "mercurius";
import type { GraphQLContext } from "../types/context";
import { AppError } from "../utils/errors";
import {
  changePassword,
  getCurrentUser,
  loginUser,
  registerUser,
  requestResetPassword,
} from "../services/authService";
import {
  changeEmailBackendReady,
  updateAccountSettings,
  verifyEmailBackendReady,
} from "../services/accountSettingsService";
import {
  getFeaturedProperties,
  getPropertyByIdOrSlug,
  getSimilarProperties,
  listProperties,
} from "../services/propertyService";
import {
  getMyFavorites,
  savePropertyToFavorites,
  togglePropertyFavorite,
  unsavePropertyFromFavorites,
} from "../services/favoritesService";
import {
  archiveProperty,
  createProperty,
  deletePropertySafely,
  updateProperty,
  updatePropertyAmenities,
  updatePropertyFaqs,
  updatePropertyFeatures,
} from "../services/adminPropertyService";
import {
  removePropertyImage,
  reorderPropertyImages,
  setCoverImage,
  uploadPropertyImages,
} from "../services/imageService";

function requireAuth(ctx: GraphQLContext) {
  if (!ctx.authUser) {
    throw new AppError("Authentication required.", "UNAUTHORIZED", 401);
  }
  return ctx.authUser;
}

function requireAdmin(ctx: GraphQLContext) {
  const user = requireAuth(ctx);
  if (user.role !== "ADMIN") {
    throw new AppError("Admin role required.", "FORBIDDEN", 403);
  }
  return user;
}

export const resolvers: IResolvers<unknown, GraphQLContext> = {
  Query: {
    properties: async (_, args, ctx) =>
      listProperties(ctx.prisma, {
        filtersInput: args.filters,
        sort: args.sort,
        paginationInput: args.pagination,
        publicOnly: true,
      }),
    property: async (_, args, ctx) =>
      getPropertyByIdOrSlug(ctx.prisma, {
        id: args.id,
        slug: args.slug,
        publicOnly: true,
      }),
    featuredProperties: async (_, args, ctx) =>
      getFeaturedProperties(ctx.prisma, {
        listingType: args.listingType,
        limit: args.limit,
        publicOnly: true,
      }),
    similarProperties: async (_, args, ctx) =>
      getSimilarProperties(ctx.prisma, {
        propertyId: args.propertyId,
        limit: args.limit,
        publicOnly: true,
      }),
    currentUser: async (_, _args, ctx) => {
      const auth = requireAuth(ctx);
      return getCurrentUser(ctx.prisma, auth.id);
    },
    myFavorites: async (_, _args, ctx) => {
      const auth = requireAuth(ctx);
      return getMyFavorites(ctx.prisma, auth.id);
    },
  },

  Mutation: {
    register: async (_, args, ctx) => registerUser(ctx.prisma, args.input),
    login: async (_, args, ctx) => loginUser(ctx.prisma, args.input),
    updateAccountSettings: async (_, args, ctx) => {
      const auth = requireAuth(ctx);
      return updateAccountSettings(ctx.prisma, auth.id, args.input);
    },
    changeEmail: async (_, args, ctx) => {
      const auth = requireAuth(ctx);
      return changeEmailBackendReady(ctx.prisma, auth.id, args.newEmail);
    },
    verifyEmail: async (_, _args, ctx) => {
      const auth = requireAuth(ctx);
      return verifyEmailBackendReady(ctx.prisma, auth.id);
    },
    changePassword: async (_, args, ctx) => {
      const auth = requireAuth(ctx);
      return changePassword(ctx.prisma, auth.id, args.input);
    },
    resetPassword: async (_, args, ctx) => requestResetPassword(ctx.prisma, args.email),

    saveProperty: async (_, args, ctx) => {
      const auth = requireAuth(ctx);
      return savePropertyToFavorites(ctx.prisma, auth.id, args.propertyId);
    },
    unsaveProperty: async (_, args, ctx) => {
      const auth = requireAuth(ctx);
      return unsavePropertyFromFavorites(ctx.prisma, auth.id, args.propertyId);
    },
    toggleFavorite: async (_, args, ctx) => {
      const auth = requireAuth(ctx);
      return togglePropertyFavorite(ctx.prisma, auth.id, args.propertyId);
    },

    createProperty: async (_, args, ctx) => {
      requireAdmin(ctx);
      return createProperty(ctx.prisma, args.input);
    },
    updateProperty: async (_, args, ctx) => {
      requireAdmin(ctx);
      return updateProperty(ctx.prisma, args.propertyId, args.input);
    },
    archiveProperty: async (_, args, ctx) => {
      requireAdmin(ctx);
      return archiveProperty(ctx.prisma, args.propertyId);
    },
    deleteProperty: async (_, args, ctx) => {
      requireAdmin(ctx);
      return deletePropertySafely(ctx.prisma, args.propertyId);
    },
    uploadPropertyImages: async (_, args, ctx) => {
      requireAdmin(ctx);
      return uploadPropertyImages(ctx.prisma, { propertyId: args.propertyId, files: args.files });
    },
    removePropertyImage: async (_, args, ctx) => {
      requireAdmin(ctx);
      return removePropertyImage(ctx.prisma, args);
    },
    reorderPropertyImages: async (_, args, ctx) => {
      requireAdmin(ctx);
      return reorderPropertyImages(ctx.prisma, args);
    },
    setCoverImage: async (_, args, ctx) => {
      requireAdmin(ctx);
      return setCoverImage(ctx.prisma, args);
    },
    updatePropertyFeatures: async (_, args, ctx) => {
      requireAdmin(ctx);
      return updatePropertyFeatures(ctx.prisma, args.propertyId, args.features);
    },
    updatePropertyAmenities: async (_, args, ctx) => {
      requireAdmin(ctx);
      return updatePropertyAmenities(ctx.prisma, args.propertyId, args.amenities);
    },
    updatePropertyFAQs: async (_, args, ctx) => {
      requireAdmin(ctx);
      return updatePropertyFaqs(ctx.prisma, args.propertyId, args.faqs);
    },
  },
};

