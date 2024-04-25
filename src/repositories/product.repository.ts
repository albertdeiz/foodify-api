import { PrismaClient } from "@prisma/client";
import { ProductComplementTypeRepository } from "./product-complement-type.repository";

import type { Prisma, Product as PrismaProduct } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import type { ProductComplementType } from "./product-complement-type.repository";

type ProductType = "REGULAR" | "COMPLEMENTED" | "COMBO";

export interface Product {
  workspaceId: number;
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  type?: ProductType;
  content?: string;
  createdAt: string;
  updatedAt: string;
  parentProductId?: number;
  products: Product[];
  productComplementTypes: ProductComplementType[];
}
/**
 * @todo product_categories
 */
export class ProductRepository {
  private productId?: number;
  private workspaceId: number;
  private productComplementTypeRepository: ProductComplementTypeRepository;
  private model: Prisma.ProductDelegate<DefaultArgs>;

  constructor(workspaceId: number, id?: number) {
    this.workspaceId = workspaceId;
    this.productId = id;
    this.productComplementTypeRepository = new ProductComplementTypeRepository(
      this.workspaceId
    );
    this.model = new PrismaClient().product;
  }

  private static sanitizeProductType(type = ""): ProductType {
    return ["REGULAR", "COMPLEMENTED", "COMBO"].includes(type)
      ? (type as ProductType)
      : "REGULAR";
  }

  static transform({
    content,
    created_at,
    description,
    id,
    image_url,
    name,
    parent_product_id,
    price,
    type,
    updated_at,
    workspace_id,
  }: PrismaProduct): Omit<Product, "productComplementTypes" | "products"> {
    return {
      id,
      name,
      description,
      price,
      workspaceId: workspace_id,
      createdAt: created_at.toISOString(),
      updatedAt: updated_at.toISOString(),
      content: content ?? undefined,
      imageUrl: image_url ?? undefined,
      parentProductId: parent_product_id ?? undefined,
      type: ProductRepository.sanitizeProductType(type),
    };
  }

  public async fetchComplementTypes(): Promise<ProductComplementType[]> {
    if (!this.productId) {
      throw new Error("{productId} not defined");
    }

    const productComplementTypes =
      await this.productComplementTypeRepository.index(this.productId);

    return productComplementTypes;
  }

  public async fetchChildren(): Promise<Product[]> {
    if (!this.productId) {
      throw new Error("{productId} not defined");
    }

    const rawProducts = await this.model.findMany({
      where: {
        workspace_id: this.workspaceId,
        parent_product_id: this.productId,
      },
      include: {
        _count: true,
      },
    });

    const products: Product[] = [];

    for (let i = 0; i < rawProducts.length; i++) {
      const {
        product_product_complement_types: productComplementTypesCount,
        products: productsCount,
      } = rawProducts[i]._count;

      const iProduct = {
        ...ProductRepository.transform(rawProducts[i]),
        products: [] as Product[],
        productComplementTypes: [] as ProductComplementType[],
      };

      const context = {
        ...this,
        productId: iProduct.id,
      };

      if (productsCount > 0) {
        iProduct.products = await this.fetchChildren.bind(context)();
      }

      if (productComplementTypesCount > 0) {
        iProduct.productComplementTypes = await this.fetchComplementTypes.bind(
          context
        )();
      }

      products.push(iProduct);
    }

    return products;
  }

  public async index(): Promise<Product[]> {
    const products = await this.model.findMany({
      where: {
        workspace_id: this.workspaceId,
        parent_product_id: null,
      },
    });

    return products.map((product) => ({
      ...ProductRepository.transform(product),
      products: [],
      productComplementTypes: [],
    }));
  }

  public async fetch(): Promise<Product> {
    if (!this.productId) {
      throw new Error("{productId} not defined");
    }

    const product = await this.model.findFirstOrThrow({
      where: {
        parent_product_id: null,
        workspace_id: this.workspaceId,
        id: this.productId,
      },
      include: {
        products: true,
      },
    });

    return this.allData(product);
  }

  private async allData(product: PrismaProduct): Promise<Product> {
    const productComplementTypes = await this.fetchComplementTypes.bind(this)();
    const products = await this.fetchChildren.bind(this)();

    return {
      ...ProductRepository.transform(product),
      productComplementTypes,
      products,
    };
  }

  public async create({
    description,
    name,
    price,
    content,
    imageUrl,
    parentProductId,
    type,
  }: {
    name: string;
    description: string;
    price: number;
    content?: string;
    imageUrl?: string;
    parentProductId?: number;
    type?: string;
  }): Promise<Product> {
    const product = await this.model.create({
      data: {
        name,
        description,
        price,
        content,
        image_url: imageUrl,
        parent_product_id: parentProductId,
        type: ProductRepository.sanitizeProductType(type),
        workspace_id: this.workspaceId,
      },
    });

    return this.allData(product);
  }

  public async update({
    content,
    description,
    imageUrl,
    name,
    parentProductId,
    price,
    type,
  }: {
    name?: string;
    description?: string;
    price?: number;
    content?: string;
    imageUrl?: string;
    parentProductId?: number;
    type?: string;
  }): Promise<Product> {
    if (!this.productId) {
      throw new Error("{productId} not defined");
    }

    const product = await this.model.update({
      where: {
        workspace_id: this.workspaceId,
        id: this.productId,
      },
      data: {
        content,
        description,
        image_url: imageUrl,
        name,
        parent_product_id: parentProductId,
        price,
        type: ProductRepository.sanitizeProductType(type),
      },
    });

    return this.allData(product);
  }

  public async addComplementType(params: {
    name: string;
    required: boolean;
    maxSelectable: number;
  }): Promise<Product> {
    if (!this.productId) {
      throw new Error("{productId} not defined");
    }

    const productComplementType =
      await this.productComplementTypeRepository.create(params);

    const product = await this.model.update({
      where: {
        id: this.productId,
      },
      data: {
        product_product_complement_types: {
          create: {
            product_complement_type_id: productComplementType.id,
          },
        },
      },
    });

    return this.allData(product);
  }
}
