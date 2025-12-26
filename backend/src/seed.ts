import { prisma } from './lib/prisma.js';
import { env } from './lib/env.js';

async function main() {
  // admin
  const admin = await prisma.user.findUnique({ where: { email: env.ADMIN_EMAIL } });
  if (!admin) {
    await prisma.user.create({
      data: { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD, role: 'admin' }
    });
    console.log('Seeded admin user');
  }

  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({
      data: [
        { sku: 'NUOC-01', name: 'Nước suối 500ml', category: 'Drink', price: 5000, cost: 3000, stock: 120, reorderPoint: 30 },
        { sku: 'BANH-01', name: 'Bánh snack', category: 'Snack', price: 12000, cost: 8000, stock: 60, reorderPoint: 20 },
        { sku: 'KEO-01', name: 'Kẹo trái cây', category: 'Candy', price: 8000, cost: 5000, stock: 80, reorderPoint: 25 },
        { sku: 'CAFE-01', name: 'Cà phê lon', category: 'Drink', price: 15000, cost: 11000, stock: 40, reorderPoint: 15 }
      ]
    });
    console.log('Seeded sample products');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
