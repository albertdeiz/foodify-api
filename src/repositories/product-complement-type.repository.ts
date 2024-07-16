import { PrismaClient } from "@prisma/client";
import { ProductComplementRepository } from "./product-complement.repository";

import type {
  Prisma,
  ProductComplementType as PrismaProductComplementType,
} from "@prisma/client";
import type { ProductComplement } from "./product-complement.repository";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export interface ProductComplementType {
  id: number;
  maxSelectable: number;
  name: string;
  required: boolean;
  createdAt: string;
  updatedAt: string;
  productComplements: ProductComplement[];
}

export class ProductComplementTypeRepository {
  private productComplementTypeId?: number;
  private workspaceId: number;
  private model: Prisma.ProductComplementTypeDelegate<DefaultArgs>;
  private productComplementRepository: ProductComplementRepository;

  constructor(workspaceId: number, id?: number) {
    this.workspaceId = workspaceId;
    this.productComplementTypeId = id;
    this.productComplementRepository = new ProductComplementRepository(
      id ?? -1
    );

    const prisma = new PrismaClient();
    this.model = prisma.productComplementType;
  }

  public static transform({
    id,
    max_selectable,
    name,
    required,
    created_at,
    updated_at,
  }: PrismaProductComplementType): Omit<
    ProductComplementType,
    "productComplements"
  > {
    return {
      id,
      name,
      maxSelectable: max_selectable,
      required,
      createdAt: created_at.toISOString(),
      updatedAt: updated_at.toISOString(),
    };
  }

  public async index(productId: number): Promise<ProductComplementType[]> {
    const productComplementTypes = await this.model.findMany({
      where: {
        product_product_complement_types: {
          every: {
            product_id: {
              equals: productId,
            },
          },
        },
      },
    });

    return Promise.all(productComplementTypes.map(this.allData.bind(this)));
  }

  public async fetchComplements(): Promise<ProductComplement[]> {
    return this.productComplementRepository.index();
  }

  public async allData(
    productComplementType: PrismaProductComplementType
  ): Promise<ProductComplementType> {
    const productComplements = await this.fetchComplements.bind(this)();

    return {
      ...ProductComplementTypeRepository.transform(productComplementType),
      productComplements,
    };
  }

  public async fetch(): Promise<ProductComplementType> {
    const productComplementType = await this.model.findFirstOrThrow({
      where: {
        id: this.productComplementTypeId,
      },
      include: {
        product_complements: true,
      },
    });

    return this.allData(productComplementType);
  }

  public async create({
    name,
    required,
    maxSelectable,
  }: {
    name: string;
    required: boolean;
    maxSelectable: number;
  }): Promise<ProductComplementType> {
    const productComplementType = await this.model.create({
      data: {
        name,
        max_selectable: maxSelectable,
        required,
      },
      include: {
        product_complements: true,
      },
    });

    return this.allData(productComplementType);
  }

  public async update({
    maxSelectable,
    name,
    required,
  }: {
    name?: string;
    required?: boolean;
    maxSelectable?: number;
  }): Promise<ProductComplementType> {
    const productComplementType = await this.model.update({
      where: {
        id: this.productComplementTypeId,
      },
      data: {
        max_selectable: maxSelectable,
        name,
        required,
      },
      include: {
        product_complements: true,
      },
    });

    return this.allData(productComplementType);
  }
}
