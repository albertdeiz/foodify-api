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
  private workspaceId: number;
  private productId: number;
  private model: Prisma.ProductComplementTypeDelegate<DefaultArgs>;
  private productComplementRepository: typeof ProductComplementRepository;

  constructor(workspaceId: number, productId: number) {
    this.workspaceId = workspaceId;
    this.productId = productId;
    this.model = new PrismaClient().productComplementType;
    this.productComplementRepository = ProductComplementRepository;
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

  public async index(): Promise<ProductComplementType[]> {
    const productComplementTypes = await this.model.findMany({
      where: {
        product_product_complement_types: {
          every: {
            product_id: {
              equals: this.productId,
            },
          },
        },
      },
    });

    return Promise.all(productComplementTypes.map(this.allData.bind(this)));
  }

  public async fetchComplements(
    complementTypeId: number
  ): Promise<ProductComplement[]> {
    return new this.productComplementRepository(complementTypeId).index();
  }

  public async allData(
    productComplementType: PrismaProductComplementType
  ): Promise<ProductComplementType> {
    const productComplements = await this.fetchComplements.bind(this)(
      productComplementType.id
    );

    return {
      ...ProductComplementTypeRepository.transform(productComplementType),
      productComplements,
    };
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
        workspace_id: this.workspaceId,
      },
      include: {
        product_complements: true,
      },
    });

    return this.allData(productComplementType);
  }

  public async fetch(id: number): Promise<ProductComplementType> {
    const productComplementType = await this.model.findFirstOrThrow({
      where: {
        id,
        workspace_id: this.workspaceId,
      },
      include: {
        product_complements: true,
      },
    });

    return this.allData(productComplementType);
  }

  public async update(
    id: number,
    {
      maxSelectable,
      name,
      required,
    }: {
      name?: string;
      required?: boolean;
      maxSelectable?: number;
    }
  ): Promise<ProductComplementType> {
    const productComplementType = await this.model.update({
      where: {
        id,
        workspace_id: this.workspaceId,
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
