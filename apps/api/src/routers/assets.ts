import { z } from "zod";
import { authed, getDb, schema } from "../procedures";
import { eq, desc, and, inArray } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

export const assetsRouter = {
    list: authed
        .route({
            method: "GET",
            path: "/assets",
            summary: "List assets",
            tags: ["Assets"],
        })
        .input(z.object({
            search: z.string().optional(),
            tag: z.string().optional(),
        }).optional())
        .handler(async ({ context, input }) => {
            const db = getDb(context);
            let query = db.select().from(schema.assets)
                .where(eq(schema.assets.userId, context.user.id));

            // Note: In a real app with many assets, we'd use complex SQL operators here
            // or a more sophisticated filter builder. For now we fetch and sort.
            const assets = await query.orderBy(desc(schema.assets.createdAt));

            if (input?.search) {
                const search = input.search.toLowerCase();
                return assets.filter(a =>
                    a.name.toLowerCase().includes(search) ||
                    a.tags.some(t => t.toLowerCase().includes(search))
                );
            }

            if (input?.tag) {
                return assets.filter(a => a.tags.includes(input.tag!));
            }

            return assets;
        }),

    create: authed
        .route({
            method: "POST",
            path: "/assets",
            summary: "Create asset",
            tags: ["Assets"],
        })
        .input(z.object({
            name: z.string(),
            url: z.string().url(),
            tags: z.array(z.string()).default([]),
        }))
        .handler(async ({ context, input }) => {
            const db = getDb(context);
            const [newAsset] = await db.insert(schema.assets).values({
                name: input.name,
                url: input.url,
                tags: input.tags,
                userId: context.user.id,
            }).returning();
            return newAsset;
        }),

    update: authed
        .route({
            method: "PATCH",
            path: "/assets/:id",
            summary: "Update asset",
            tags: ["Assets"],
        })
        .input(z.object({
            id: z.string().uuid(),
            tags: z.array(z.string()).optional(),
        }))
        .handler(async ({ context, input }) => {
            const db = getDb(context);

            const [existing] = await db.select().from(schema.assets)
                .where(and(eq(schema.assets.id, input.id), eq(schema.assets.userId, context.user.id)));

            if (!existing) {
                throw new ORPCError("NOT_FOUND", { message: "Asset not found" });
            }

            const [updated] = await db.update(schema.assets)
                .set({
                    tags: input.tags ?? existing.tags,
                    updatedAt: new Date(),
                })
                .where(eq(schema.assets.id, input.id))
                .returning();

            return updated;
        }),

    delete: authed
        .route({
            method: "DELETE",
            path: "/assets/:id",
            summary: "Delete asset",
            tags: ["Assets"],
        })
        .input(z.object({
            id: z.string().uuid(),
        }))
        .handler(async ({ context, input }) => {
            const db = getDb(context);

            const [deleted] = await db.delete(schema.assets)
                .where(and(eq(schema.assets.id, input.id), eq(schema.assets.userId, context.user.id)))
                .returning();

            if (!deleted) {
                throw new ORPCError("NOT_FOUND", { message: "Asset not found" });
            }

            return { success: true };
        }),

    deleteMany: authed
        .route({
            method: "POST",
            path: "/assets/batch-delete",
            summary: "Delete multiple assets",
            tags: ["Assets"],
        })
        .input(z.object({
            ids: z.array(z.string().uuid()),
        }))
        .handler(async ({ context, input }) => {
            const db = getDb(context);

            // Ensure security by checking userId for all deleted items
            const deleted = await db.delete(schema.assets)
                .where(and(
                    inArray(schema.assets.id, input.ids),
                    eq(schema.assets.userId, context.user.id)
                ))
                .returning();

            return { count: deleted.length };
        }),

    analyze: authed
        .route({
            method: "POST",
            path: "/assets/:id/analyze",
            summary: "Analyze asset with AI",
            tags: ["Assets"],
        })
        .input(z.object({
            id: z.string().uuid(),
        }))
        .handler(async ({ context, input }) => {
            const db = getDb(context);

            // 1. Get the asset
            const [asset] = await db.select().from(schema.assets)
                .where(and(eq(schema.assets.id, input.id), eq(schema.assets.userId, context.user.id)));

            if (!asset) {
                throw new ORPCError("NOT_FOUND", { message: "Asset not found" });
            }

            // 2. Run AI Analysis
            if (!context.env.AI) {
                // Return some mock tags if AI is missing
                const mockTags = ["Simulated", "Tag", "No-AI-Binding"];
                return { tags: mockTags };
            }

            try {
                // Vision models require binary input
                const response = await fetch(asset.url);
                const arrayBuffer = await response.arrayBuffer();

                // Run classification model
                const aiResponse = await context.env.AI.run("@cf/microsoft/resnet-50", {
                    image: [...new Uint8Array(arrayBuffer)],
                });

                const tags = (aiResponse as any[])
                    ?.filter((r: any) => r.label && r.score > 0.5)
                    ?.map((r: any) => r.label) || [];

                // 3. Update DB
                const combinedTags = Array.from(new Set([...asset.tags, ...tags]));
                const [updated] = await db.update(schema.assets)
                    .set({ tags: combinedTags, updatedAt: new Date() })
                    .where(eq(schema.assets.id, asset.id))
                    .returning();

                return updated;
            } catch (error) {
                console.error("AI Analysis failed:", error);
                throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "AI Analysis failed" });
            }
        }),
};
