import express from "express";

import authenticate from "@/middlewares/authenticate.middleware";
import { ProductRepository } from "@/repositories/product.repository";

import {
  createProductComplementTypeSchema,
  createProductSchema,
  updateProductComplementTypeSchema,
  updateProductSchema,
} from "./schemas";

import type { Request, Response } from "express";
import { ProductComplementTypeRepository } from "@/repositories/product-complement-type.repository";
import { parseError } from "@/utils/error.utils";

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
 * [PATCH]  /api/v1/products/{ID}/complement-types/{ID} ✅
 *
 * [POST]  /api/v1/products/{ID}/categories
 * [DELETE]  /api/v1/products/{ID}/categories
 */

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { workspaceId = -1 } = req;
  const productId = Number(req.params.id);

  const productRepository = new ProductRepository(workspaceId, productId);

  try {
    const products = await productRepository.index();

    res.status(200).json({ data: products });
  } catch (e) {
    const error = e as Error;
    res.status(404).json({ error: error.message });
  }
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { workspaceId = -1 } = req;
  const productId = Number(req.params.id);

  const productRepository = new ProductRepository(workspaceId, productId);

  try {
    const product = await productRepository.fetch();

    res.status(200).json({ data: product });
  } catch (e) {
    const error = e as Error;
    res.status(404).json({ error: error.message });
  }
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { workspaceId = -1 } = req;

  const productRepository = new ProductRepository(workspaceId);

  try {
    const params = createProductSchema.parse(req.body);
    const product = await productRepository.create(params);

    res.status(200).json({ data: product });
  } catch (e) {
    const { message } = parseError(e as Error);
    res.status(404).json({ error: message });
  }
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const { workspaceId = -1 } = req;
  const productId = Number(req.params.id);
  const productRepository = new ProductRepository(workspaceId, productId);

  try {
    const params = updateProductSchema.parse({ ...req.params, ...req.body });
    const product = await productRepository.update(params);

    res.status(200).json({ data: product });
  } catch (e) {
    const { message } = parseError(e as Error);
    res.status(404).json({ error: message });
  }
});

router.post(
  "/:id/complement-types",
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId = -1 } = req;
    const productId = Number(req.params.id);

    try {
      const params = createProductComplementTypeSchema.parse({
        ...req.params,
        ...req.body,
      });
      const productRepository = new ProductRepository(workspaceId, productId);

      const product = await productRepository.addComplementType(params);

      res.status(200).json({ data: product });
    } catch (e) {
      const { message } = parseError(e as Error);
      res.status(404).json({ error: message });
    }
  }
);

router.patch(
  "/:id/complement-types/:complementTypeId",
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId = -1 } = req;
    const productId = Number(req.params.id);
    const complementTypeId = Number(req.params.complementTypeId);

    const productComplementTypeRepository = new ProductComplementTypeRepository(
      workspaceId,
      complementTypeId
    );

    try {
      const params = updateProductComplementTypeSchema.parse(req.body);

      await productComplementTypeRepository.update(params);

      const product = await new ProductRepository(
        workspaceId,
        productId
      ).fetch();

      res.status(200).json({ data: product });
    } catch (e) {
      const error = e as Error;
      res.status(404).json({ error: error.message });
    }
  }
);

export default router;
