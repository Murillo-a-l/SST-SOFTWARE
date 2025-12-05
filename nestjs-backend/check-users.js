const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      active: true,
    }
  });

  console.log('\n📋 Usuários no banco de dados:\n');
  users.forEach(u => {
    console.log(`✉️  Email: ${u.email}`);
    console.log(`👤 Nome: ${u.name}`);
    console.log(`🔑 Role: ${u.role}`);
    console.log(`✅ Ativo: ${u.active}`);
    console.log('---');
  });

  await prisma.$disconnect();
}

checkUsers();
