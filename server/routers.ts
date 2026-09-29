import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createPendingOrder,
  createProduct,
  getActiveProducts,
  getAdminOrders,
  getAdminProducts,
  getProductBySlug,
} from "./db";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  catalog: router({
    list: publicProcedure
      .input(z.object({ search: z.string().optional(), category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const all = await getActiveProducts();
        const search = input?.search?.toLowerCase().trim();
        return all.filter((product) => {
          const matchesSearch = !search || `${product.name} ${product.shortDescription ?? ""}`.toLowerCase().includes(search);
          return matchesSearch;
        });
      }),
    bySlug: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(({ input }) => getProductBySlug(input.slug)),
  }),

  orders: router({
    createPending: publicProcedure
      .input(z.object({
        orderNumber: z.string().min(4).max(32),
        customerEmail: z.string().email(),
        customerName: z.string().min(1).max(180),
        customerPhone: z.string().max(40).optional(),
        shippingAddress: z.string().min(1),
        subtotalMinor: z.number().int().nonnegative(),
        shippingMinor: z.number().int().nonnegative(),
        taxMinor: z.number().int().nonnegative(),
        totalMinor: z.number().int().nonnegative(),
        currency: z.string().length(3).default("USD"),
      }))
      .mutation(({ input }) => createPendingOrder({ ...input, paymentStatus: "pending", fulfillmentStatus: "processing" })),
  }),

  admin: router({
    products: adminProcedure.query(() => getAdminProducts()),
    orders: adminProcedure.query(() => getAdminOrders()),
    createProduct: adminProcedure
      .input(z.object({
        slug: z.string().min(2),
        name: z.string().min(2),
        sku: z.string().min(2),
        priceMinor: z.number().int().nonnegative(),
        stockQuantity: z.number().int().nonnegative(),
        categoryId: z.number().int().positive().optional(),
        shortDescription: z.string().max(240).optional(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => createProduct({ ...input, status: "draft", currency: "USD" })),
  }),
});

export type AppRouter = typeof appRouter;
