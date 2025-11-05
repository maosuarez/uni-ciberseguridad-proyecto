import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpieza opcional de tablas
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.product.deleteMany();

  console.log("🧹 Tablas limpiadas.");

  // Crear productos de ejemplo
  const products = [
    {
      name: "Arepa Reina Pepiada",
      description:
        "Deliciosa arepa rellena con pollo desmenuzado, aguacate, mayonesa y cilantro. Un clásico venezolano que no puede faltar.",
      price_in_cents: 850,
      image_url: "/uploads/202510091237-foto.jpg",
      category: "Clásicas",
      available: true,
    },
    {
      name: "Arepa Pabellón",
      description:
        "Arepa rellena con carne mechada, caraotas negras, tajadas de plátano maduro y queso rallado. El sabor de Venezuela en cada bocado.",
      price_in_cents: 950,
      image_url: "/uploads/202510091240-foto.jpg",
      category: "Clásicas",
      available: true,
    },
    {
      name: "Arepa Dominó",
      description:
        "Arepa rellena con caraotas negras y queso blanco rallado. Simple, deliciosa y tradicional.",
      price_in_cents: 650,
      image_url: "/uploads/202510091241-foto.jpg",
      category: "Clásicas",
      available: true,
    },
    {
      name: "Arepa Pelúa",
      description:
        "Arepa con carne mechada y queso amarillo gratinado. Una combinación irresistible.",
      price_in_cents: 850,
      image_url: "/uploads/202510091242-foto.jpg",
      category: "Clásicas",
      available: true,
    },
    {
      name: "Arepa de Pernil",
      description:
        "Arepa rellena con jugoso pernil de cerdo marinado, acompañado de ensalada y salsas.",
      price_in_cents: 900,
      image_url: "/uploads/202510091243-foto.jpg",
      category: "Especiales",
      available: true,
    },
    {
      name: "Arepa Catira",
      description:
        "Arepa con pollo desmenuzado y queso amarillo. Una combinación perfecta de sabores.",
      price_in_cents: 800,
      image_url: "/uploads/202510091244-foto.jpg",
      category: "Clásicas",
      available: true,
    },
    {
      name: "Arepa de Camarones",
      description:
        "Arepa gourmet rellena con camarones salteados en salsa de ajo y hierbas frescas.",
      price_in_cents: 1200,
      image_url: "/uploads/202510091245-foto.jpg",
      category: "Gourmet",
      available: true,
    },
    {
      name: "Arepa Vegetariana",
      description:
        "Arepa rellena con vegetales asados, aguacate, queso y salsa de cilantro.",
      price_in_cents: 750,
      image_url: "/uploads/202510091246-foto.jpg",
      category: "Vegetarianas",
      available: true,
    },
    {
      name: "Arepa de Queso",
      description:
        "Arepa sencilla rellena con abundante queso blanco. Perfecta para los amantes del queso.",
      price_in_cents: 550,
      image_url: "/uploads/202510091247-foto.jpg",
      category: "Clásicas",
      available: true,
    },
    {
      name: "Arepa Llanera",
      description:
        "Arepa con carne asada, tomate, aguacate y queso. Sabor de los llanos venezolanos.",
      price_in_cents: 950,
      image_url: "/uploads/202510091248-foto.jpg",
      category: "Especiales",
      available: true,
    },
    {
      name: "Arepa de Perico",
      description:
        "Arepa rellena con huevos revueltos con tomate y cebolla. Perfecta para el desayuno.",
      price_in_cents: 600,
      image_url: "/uploads/202510091249-foto.jpg",
      category: "Desayuno",
      available: true,
    },
    {
      name: "Arepa Sifrina",
      description:
        "Arepa gourmet con pollo, aguacate, queso, tomate y mayonesa especial.",
      price_in_cents: 1000,
      image_url: "/uploads/202510091250-foto.jpg",
      category: "Gourmet",
      available: true,
    },
  ];

  await prisma.product.createMany({ data: products });
  console.log("✅ Productos de ejemplo creados.");

  // Hashear contraseña del admin
  const hashedAdminPass = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 12);

  // Crear usuario administrador
  const admin = await prisma.profile.create({
    data: {
      full_name: process.env.ADMIN_NAME!,
      email: process.env.ADMIN_EMAIL!,
      password: hashedAdminPass,
      is_admin: true,
      is_approved: true,
      role: "admin",
      status: "approved",
    },
  });

  console.log(`👑 Usuario administrador creado: ${admin.email}`);

  // Obtener producto existente
  const reina = await prisma.product.findFirst({
    where: { name: "Arepa Reina Pepiada" },
  });

  // Crear usuario cliente de prueba
  const clientPass = await bcrypt.hash("Cliente$2025", 12);

  const client = await prisma.profile.create({
    data: {
      full_name: "Cliente de Prueba",
      email: "cliente@arepas.com",
      password: clientPass,
      is_admin: false,
      is_approved: true,
      role: "user",
      status: "approved",
      carts: {
        create: {
          cart_items: {
            create: [
              {
                product: { connect: { id: reina?.id }},
                quantity: 2,
              },
            ],
          },
        },
      },
      orders: {
        create: [
          {
            total_amount_in_cents: 1700,
            status: "completed",
            order_items: {
              create: [
                {
                  product_name: "Arepa Reina Pepiada",
                  product_price_in_cents: 850,
                  quantity: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`🛍️ Usuario cliente de prueba creado: ${client.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Error al ejecutar el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🌾 Seed finalizado correctamente.");
  });

