import { PrismaClient } from "@prisma/client";

import type {
  Prisma,
  ProductComplement as PrismaProductComplement,
} from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export interface ProductComplement {
  id: number;
  name: string;
  increment: boolean;
  isDisabled: boolean;
  price: number;
}

export class ProductComplementRepository {
  private productComplementTypeId: number;
  private model: Prisma.ProductComplementDelegate<DefaultArgs>;

  constructor(productComplementTypeId: number) {
    this.productComplementTypeId = productComplementTypeId;
    this.model = new PrismaClient().productComplement;
  }

  public static transform({
    id,
    increment,
    is_disabled,
    name,
    price,
  }: PrismaProductComplement): ProductComplement {
    return {
      id,
      increment,
      isDisabled: is_disabled,
      name,
      price,
    };
  }

  public async index(): Promise<ProductComplement[]> {
    const productProductComplements = await this.model.findMany({
      where: {
        product_complement_type_id: this.productComplementTypeId,
      },
    });

    return productProductComplements.map(ProductComplementRepository.transform);
  }

  public async create({
    name,
    isDisabled,
    price,
  }: {
    isDisabled: boolean;
    name: string;
    price: number;
  }): Promise<ProductComplement> {
    const productComplement = await this.model.create({
      data: {
        increment: price > 0,
        is_disabled: isDisabled,
        name,
        price,
        product_complement_type_id: this.productComplementTypeId,
      },
    });

    return ProductComplementRepository.transform(productComplement);
  }

  public async fetch(id: number): Promise<ProductComplement> {
    const productComplement = await this.model.findFirstOrThrow({
      where: {
        id,
      },
    });

    return ProductComplementRepository.transform(productComplement);
  }

  public async update(
    id: number,
    {
      name,
      isDisabled,
      price,
    }: {
      name?: string;
      isDisabled?: boolean;
      price?: number;
    }
  ): Promise<ProductComplement> {
    const productComplement = await this.model.update({
      where: {
        id,
      },
      data: {
        increment: price ? price > 0 : undefined,
        price,
        is_disabled: isDisabled,
        name,
      },
    });

    return ProductComplementRepository.transform(productComplement);
  }
}
