import express from "express";

import authenticate from "@/middlewares/authenticate.middleware";
import { ProductRepository } from "@/repositories/product.repository";

import {
  createProductComplementSchema,
  createProductComplementTypeSchema,
  createProductSchema,
  updateProductComplementSchema,
  updateProductComplementTypeSchema,
  updateProductSchema,
} from "./schemas";

import type { Request, Response } from "express";
import { ProductComplementTypeRepository } from "@/repositories/product-complement-type.repository";
import { parseError } from "@/utils/error.utils";
import { ProductComplementRepository } from "@/repositories/product-complement.repository";

const router = express.Router();

router.use(authenticate);

/**
 * [GET]  /api/v1/products ✅✅
 * [GET]  /api/v1/products/{ID} ✅✅
 * [POST]  /api/v1/products/{ID} ✅
 * [PATCH]  /api/v1/products/{ID} ✅✅
 * [DELETE]  /api/v1/products/{ID}
 *
 * [POST]  /api/v1/products/{ID}/complement-types ✅✅
 * [PATCH]  /api/v1/products/{ID}/complement-types/{ID} ✅✅
 * [DELETE]  /api/v1/products/{ID}/complement-types/{ID}
 *
 * [POST]  /api/v1/products/{ID}/complement-types/{ID}/complements ✅✅
 * [PATCH]  /api/v1/products/{ID}/complement-types/{ID}/complement/{ID} ✅✅
 * [DELETE]  /api/v1/products/{ID}/complement-types/{ID}/complement/{ID}
 *
 * [POST]  /api/v1/products/{ID}/categories
 * [DELETE]  /api/v1/products/{ID}/categories
 */

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { workspaceId = -1 } = req;

  try {
    const products = await new ProductRepository(workspaceId).index();

    res.status(200).json({ data: products });
  } catch (e) {
    const { message, status } = parseError(e as Error);
    res.status(status).json({ error: message });
  }
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { workspaceId = -1 } = req;
  const productId = Number(req.params.id);

  try {
    const product = await new ProductRepository(workspaceId).fetch(productId);

    res.status(200).json({ data: product });
  } catch (e) {
    const { message, status } = parseError(e as Error);
    res.status(status).json({ error: message });
  }
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { workspaceId = -1 } = req;

  try {
    const params = createProductSchema.parse(req.body);
    const product = await new ProductRepository(workspaceId).create(params);

    res.status(200).json({ data: product });
  } catch (e) {
    const { message, status } = parseError(e as Error);
    res.status(status).json({ error: message });
  }
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { workspaceId = -1 } = req;
  const productId = Number(req.params.id);

  try {
    const params = updateProductSchema.parse(req.body);
    const product = await new ProductRepository(workspaceId).update(
      productId,
      params
    );

    res.status(200).json({ data: product });
  } catch (e) {
    const { message, status } = parseError(e as Error);
    res.status(status).json({ error: message });
  }
});

router.post(
  "/:id/complement-types",
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId = -1 } = req;
    const productId = Number(req.params.id);

    try {
      const params = createProductComplementTypeSchema.parse(req.body);

      await new ProductComplementTypeRepository(workspaceId, productId).create(
        params
      );

      const product = await new ProductRepository(workspaceId).fetch(productId);

      res.status(200).json({ data: product });
    } catch (e) {
      const { message, status } = parseError(e as Error);
      res.status(status).json({ error: message });
    }
  }
);

router.patch(
  "/:id/complement-types/:complementTypeId",
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId = -1 } = req;
    const productId = Number(req.params.id);
    const complementTypeId = Number(req.params.complementTypeId);

    try {
      const params = updateProductComplementTypeSchema.parse(req.body);

      await new ProductComplementTypeRepository(workspaceId, productId).update(
        complementTypeId,
        params
      );

      const product = await new ProductRepository(workspaceId).fetch(productId);

      res.status(200).json({ data: product });
    } catch (e) {
      const { message, status } = parseError(e as Error);
      res.status(status).json({ error: message });
    }
  }
);

router.post(
  "/:id/complement-types/:complementTypeId/complements",
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId = -1 } = req;
    const productId = Number(req.params.id);
    const complementTypeId = Number(req.params.complementTypeId);

    try {
      const params = createProductComplementSchema.parse(req.body);

      await new ProductComplementRepository(complementTypeId).create(params);

      const product = await new ProductRepository(workspaceId).fetch(productId);

      res.status(200).json({ data: product });
    } catch (e) {
      const { message, status } = parseError(e as Error);
      res.status(status).json({ error: message });
    }
  }
);

router.patch(
  "/:id/complement-types/:complementTypeId/complements/:complementId",
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId = -1 } = req;
    const productId = Number(req.params.id);
    const complementTypeId = Number(req.params.complementTypeId);
    const complementId = Number(req.params.complementId);

    try {
      const params = updateProductComplementSchema.parse(req.body);

      await new ProductComplementRepository(complementTypeId).update(
        complementId,
        params
      );

      const product = await new ProductRepository(workspaceId).fetch(productId);

      res.status(200).json({ data: product });
    } catch (e) {
      const { message, status } = parseError(e as Error);
      res.status(status).json({ error: message });
    }
  }
);

export default router;
