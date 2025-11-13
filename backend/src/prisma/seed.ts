import prisma from '../config/database';
import { hashPassword } from '../utils/password';

async function main() {
  console.log('🌱 Seeding database...');

  // Create default users with hashed passwords
  const adminPassword = await hashPassword('admin');
  const userPassword = await hashPassword('123');

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      nome: 'Administrador',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const drJoao = await prisma.user.upsert({
    where: { username: 'joao.medico' },
    update: {},
    create: {
      nome: 'Dr. João Médico',
      username: 'joao.medico',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('✅ Users created:', { admin, drJoao });

  // Create default document types
  const documentTypes = [
    { nome: 'Contrato', validadeMesesPadrao: 12, alertaDias: 30 },
    { nome: 'ASO', validadeMesesPadrao: 12, alertaDias: 30 },
    { nome: 'PCMSO', validadeMesesPadrao: 12, alertaDias: 45 },
    { nome: 'PGR', validadeMesesPadrao: 24, alertaDias: 45 },
    { nome: 'Alvará', validadeMesesPadrao: 12, alertaDias: 30 },
    { nome: 'Outro', validadeMesesPadrao: null, alertaDias: 30 },
  ];

  for (const docType of documentTypes) {
    await prisma.documentoTipo.upsert({
      where: { nome: docType.nome },
      update: {},
      create: docType,
    });
  }

  console.log('✅ Document types created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
