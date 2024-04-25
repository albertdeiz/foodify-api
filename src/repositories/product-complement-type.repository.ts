import {
  PrismaClient,
  ProductComplement as PrismaProductComplement,
  ProductComplementType as PrismaProductComplementType,
} from "@prisma/client";

const prisma = new PrismaClient();

interface ProductComplement {
  id: number;
  name: string;
  increment: boolean;
  isDisabled: boolean;
  price: number;
}

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
  productComplementTypeId: number;
  workspaceId: number;

  constructor(workspaceId: number, id = -1) {
    this.workspaceId = workspaceId;
    this.productComplementTypeId = id;
  }

  public static transform({
    id,
    max_selectable,
    name,
    required,
    created_at,
    updated_at,
    product_complements,
  }: PrismaProductComplementType & {
    product_complements?: PrismaProductComplement[];
  }): ProductComplementType {
    return {
      id,
      name,
      maxSelectable: max_selectable,
      required,
      createdAt: created_at.toISOString(),
      updatedAt: updated_at.toISOString(),
      productComplements: (product_complements ?? []).map(
        ({ id, increment, is_disabled, name, price }) => ({
          id,
          increment,
          isDisabled: is_disabled,
          name,
          price,
        })
      ),
    };
  }

  public async addToProduct(productId: number) {
    await prisma.productProductComplementType.create({
      data: {
        product_id: productId,
        product_complement_type_id: this.productComplementTypeId,
      },
    });

    return this.fetch();
  }

  public async index(productId: number): Promise<ProductComplementType[]> {
    const productProductComplementTypes =
      await prisma.productProductComplementType.findMany({
        where: {
          product_id: {
            equals: productId,
          },
        },
        include: {
          product_complement_type: {
            include: {
              product_complements: true,
            },
          },
        },
      });

    return productProductComplementTypes.map(({ product_complement_type }) =>
      ProductComplementTypeRepository.transform(product_complement_type)
    );
  }

  public async fetch(): Promise<ProductComplementType> {
    const productComplementType =
      await prisma.productComplementType.findFirstOrThrow({
        where: {
          id: this.productComplementTypeId,
        },
        include: {
          product_complements: true,
        },
      });

    return ProductComplementTypeRepository.transform(productComplementType);
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
    const productComplementType = await prisma.productComplementType.create({
      data: {
        name,
        max_selectable: maxSelectable,
        required,
      },
      include: {
        product_complements: true,
      },
    });

    return ProductComplementTypeRepository.transform(productComplementType);
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
    const productComplementType = await prisma.productComplementType.update({
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

    return ProductComplementTypeRepository.transform(productComplementType);
  }
}
