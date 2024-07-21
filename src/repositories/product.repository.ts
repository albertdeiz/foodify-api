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
  private workspaceId: number;
  private productComplementTypeRepository: typeof ProductComplementTypeRepository;
  private model: Prisma.ProductDelegate<DefaultArgs>;

  constructor(workspaceId: number) {
    this.workspaceId = workspaceId;
    this.productComplementTypeRepository = ProductComplementTypeRepository;
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

  public async fetchComplementTypes(
    productId: number
  ): Promise<ProductComplementType[]> {
    return new this.productComplementTypeRepository(
      this.workspaceId,
      productId
    ).index();
  }

  public async fetchChildren(productId: number): Promise<Product[]> {
    const rawProducts = await this.model.findMany({
      where: {
        workspace_id: this.workspaceId,
        parent_product_id: productId,
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
        iProduct.products = await this.fetchChildren.bind(context)(iProduct.id);
      }

      if (productComplementTypesCount > 0) {
        iProduct.productComplementTypes = await this.fetchComplementTypes.bind(
          context
        )(iProduct.id);
      }

      products.push(iProduct);
    }

    return products;
  }

  private async allData(product: PrismaProduct): Promise<Product> {
    const productComplementTypes = await this.fetchComplementTypes.bind(this)(
      product.id
    );
    const products = await this.fetchChildren.bind(this)(product.id);

    return {
      ...ProductRepository.transform(product),
      productComplementTypes,
      products,
    };
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

  public async fetch(id: number): Promise<Product> {
    const product = await this.model.findFirstOrThrow({
      where: {
        parent_product_id: null,
        workspace_id: this.workspaceId,
        id,
      },
      include: {
        products: true,
      },
    });

    return this.allData(product);
  }

  public async update(
    id: number,
    {
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
    }
  ): Promise<Product> {
    const product = await this.model.update({
      where: {
        workspace_id: this.workspaceId,
        id,
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
}
