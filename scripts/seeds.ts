import { generatePassword } from "@/utils/auth.utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userPassword = await generatePassword("112233");

  const user = await prisma.user.create({
    data: {
      email: "admin@correo.com",
      first_name: "Admin",
      last_name: "",
      password: userPassword,
      user_workspaces: {
        create: {
          workspace: {
            create: {
              name: "Plaza Victoria",
              address: "Lorem ipsun dolor sit ammet.",
            },
          },
        },
      },
    },
    select: {
      id: true,
      user_workspaces: true,
    },
  });

  const workspaceId = user.user_workspaces[0].workspace_id;

  // Complement begins
  const vegetableComplementType = await prisma.productComplementType.create({
    data: {
      name: "Vegetales",
      required: true,
      max_selectable: 3,
      product_complements: {
        createMany: {
          data: [
            {
              name: "Lechuga",
              increment: false,
              price: 0,
              is_disabled: false,
            },
            {
              name: "Tomate",
              increment: false,
              price: 0,
              is_disabled: false,
            },
            {
              name: "Pepinillos",
              increment: false,
              price: 0,
              is_disabled: false,
            },
            {
              name: "Maíz",
              increment: true,
              price: 400,
              is_disabled: false,
            },
          ],
        },
      },
    },
  });

  const proteinComplementType = await prisma.productComplementType.create({
    data: {
      name: "Carnes",
      required: true,
      max_selectable: 1,
      product_complements: {
        createMany: {
          data: [
            {
              name: "Carne 120gr",
              increment: false,
              price: 0,
              is_disabled: false,
            },
            {
              name: "Carne 250gr",
              increment: true,
              price: 700,
              is_disabled: false,
            },
            {
              name: "Pollo apanado",
              increment: false,
              price: 0,
              is_disabled: false,
            },
          ],
        },
      },
    },
  });

  const sausageComplementType = await prisma.productComplementType.create({
    data: {
      name: "Embutidos",
      required: false,
      max_selectable: -1,
      product_complements: {
        createMany: {
          data: [
            {
              name: "Jamón",
              increment: true,
              price: 300,
              is_disabled: false,
            },
            {
              name: "Queso",
              increment: true,
              price: 300,
              is_disabled: false,
            },
            {
              name: "Tocino",
              increment: true,
              price: 400,
              is_disabled: false,
            },
          ],
        },
      },
    },
  });

  const sauceComplementType = await prisma.productComplementType.create({
    data: {
      name: "Salsas",
      required: false,
      max_selectable: 3,
      product_complements: {
        createMany: {
          data: [
            {
              name: "Ketchup",
              increment: false,
              price: 0,
              is_disabled: false,
            },
            {
              name: "Mostaza",
              increment: false,
              price: 0,
              is_disabled: false,
            },
            {
              name: "Mayonesa",
              increment: false,
              price: 0,
              is_disabled: false,
            },
          ],
        },
      },
    },
  });
  // Complement ends

  const comboProduct = await prisma.product.create({
    data: {
      workspace_id: workspaceId,
      name: "Combo Big Mac",
      description: "Delicioso Combo Big Mac",
      price: 0,
      type: "COMBO",
      image_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTcYXJvS8crGMMiJkDvXAEGX0ySVeuVQuo_bD_rGeVE_3PLyQUa&usqp=CAU",
      content: null,
    },
  });

  const comboProductComplemented = await prisma.product.create({
    data: {
      parent_product_id: comboProduct.id,
      workspace_id: workspaceId,
      name: "Hamburguesa Big Mac",
      description: "Homburguesa con ... ingredientes",
      price: 1399,
      type: "COMPLEMENTED",
      image_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTcYXJvS8crGMMiJkDvXAEGX0ySVeuVQuo_bD_rGeVE_3PLyQUa&usqp=CAU",
      content: "120 gr",
      product_product_complement_types: {
        createMany: {
          data: [
            {
              product_complement_type_id: vegetableComplementType.id,
            },
            {
              product_complement_type_id: proteinComplementType.id,
            },
            {
              product_complement_type_id: sausageComplementType.id,
            },
            {
              product_complement_type_id: sauceComplementType.id,
            },
          ],
        },
      },
    },
  });

  const comboProductRegular = await prisma.product.create({
    data: {
      workspace_id: workspaceId,
      parent_product_id: comboProduct.id,
      name: "Caja de nuggets",
      description: "Nuggets de mcdonald's",
      price: 2499,
      image_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTcYXJvS8crGMMiJkDvXAEGX0ySVeuVQuo_bD_rGeVE_3PLyQUa&usqp=CAU",
      content: "8 unidades",
    },
  });

  const comboProductRegular2 = await prisma.product.create({
    data: {
      workspace_id: workspaceId,
      parent_product_id: comboProduct.id,
      name: "Papas regulares",
      description: "Papas fritas tamaño regular",
      price: 1499,
      image_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTcYXJvS8crGMMiJkDvXAEGX0ySVeuVQuo_bD_rGeVE_3PLyQUa&usqp=CAU",
      content: "100gr",
    },
  });

  const complementedProduct = await prisma.product.create({
    data: {
      workspace_id: workspaceId,
      name: "Arma tu Hamburguesa",
      description: "Arma tu hamburguesa como prefieras",
      content: null,
      price: 11990,
      image_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTcYXJvS8crGMMiJkDvXAEGX0ySVeuVQuo_bD_rGeVE_3PLyQUa&usqp=CAU",
      type: "COMPLEMENTED",
      product_product_complement_types: {
        createMany: {
          data: [
            {
              product_complement_type_id: vegetableComplementType.id,
            },
            {
              product_complement_type_id: proteinComplementType.id,
            },
            {
              product_complement_type_id: sausageComplementType.id,
            },
            {
              product_complement_type_id: sauceComplementType.id,
            },
          ],
        },
      },
    },
  });

  const regularProduct = await prisma.product.create({
    data: {
      workspace_id: workspaceId,
      name: "Empanadas",
      description: "Deliciosas empanas de queso",
      price: 11990,
      content: "8 unidades",
      image_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTcYXJvS8crGMMiJkDvXAEGX0ySVeuVQuo_bD_rGeVE_3PLyQUa&usqp=CAU",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
