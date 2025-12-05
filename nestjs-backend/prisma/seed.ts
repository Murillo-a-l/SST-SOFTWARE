import { PrismaClient, UserRole, AppointmentContext, AppointmentStatus, DocumentType, DocumentStatus, AsoConclusion } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedMapping } from './seeds/mapping.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Limpar dados existentes (opcional - cuidado em produção!)
  console.log('🗑️  Limpando dados existentes...');
  await prisma.file.deleteMany();
  await prisma.document.deleteMany();
  await prisma.appointmentProcedure.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.employment.deleteMany();
  await prisma.job.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.company.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.room.deleteMany();
  await prisma.clinicUnit.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // 1. CRIAR USUÁRIOS
  console.log('👥 Criando usuários...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const receptionistPassword = await bcrypt.hash('recepcao123', 10);
  const technicianPassword = await bcrypt.hash('tecnico123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@ocupalli.com.br',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      active: true,
    },
  });

  const doctor = await prisma.user.create({
    data: {
      name: 'Dr. João Silva',
      email: 'joao.silva@ocupalli.com.br',
      passwordHash: doctorPassword,
      role: UserRole.DOCTOR,
      active: true,
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      name: 'Maria Recepcionista',
      email: 'maria.recepcao@ocupalli.com.br',
      passwordHash: receptionistPassword,
      role: UserRole.RECEPTIONIST,
      active: true,
    },
  });

  const technician = await prisma.user.create({
    data: {
      name: 'Carlos Técnico',
      email: 'carlos.tecnico@ocupalli.com.br',
      passwordHash: technicianPassword,
      role: UserRole.TECHNICIAN,
      active: true,
    },
  });

  console.log('✅ 4 usuários criados');

  // 2. CRIAR UNIDADES CLÍNICAS E SALAS
  console.log('\n🏥 Criando unidades clínicas e salas...');
  const unitCentral = await prisma.clinicUnit.create({
    data: {
      name: 'Unidade Central - São Paulo',
      address: 'Av. Paulista, 1000 - Bela Vista - São Paulo/SP - CEP 01310-100',
      phone: '+5511999999999',
      active: true,
    },
  });

  const unitZonaSul = await prisma.clinicUnit.create({
    data: {
      name: 'Unidade Zona Sul - São Paulo',
      address: 'Av. Santo Amaro, 5000 - Brooklin - São Paulo/SP - CEP 04702-000',
      phone: '+5511988888888',
      active: true,
    },
  });

  const room101 = await prisma.room.create({
    data: {
      name: 'Sala 101 - Audiometria',
      description: 'Sala equipada para exames audiométricos',
      clinicUnitId: unitCentral.id,
      active: true,
    },
  });

  const room102 = await prisma.room.create({
    data: {
      name: 'Sala 102 - Consulta Médica',
      description: 'Sala de consulta médica ocupacional',
      clinicUnitId: unitCentral.id,
      active: true,
    },
  });

  const room201 = await prisma.room.create({
    data: {
      name: 'Sala 201 - Espirometria',
      description: 'Sala para exames de espirometria',
      clinicUnitId: unitZonaSul.id,
      active: true,
    },
  });

  console.log('✅ 2 unidades e 3 salas criadas');

  // 3. CRIAR PROCEDIMENTOS
  console.log('\n💉 Criando procedimentos...');
  const procAudiometry = await prisma.procedure.create({
    data: {
      name: 'Audiometria Tonal',
      code: '40201015',
      description: 'Exame auditivo para avaliação de limiares tonais',
      defaultPrice: 15000, // R$ 150,00
      durationMinutes: 30,
    },
  });

  const procSpirometry = await prisma.procedure.create({
    data: {
      name: 'Espirometria',
      code: '40301010',
      description: 'Exame de função pulmonar',
      defaultPrice: 20000, // R$ 200,00
      durationMinutes: 20,
    },
  });

  const procECG = await prisma.procedure.create({
    data: {
      name: 'Eletrocardiograma (ECG)',
      code: '40801012',
      description: 'Exame de eletrocardiograma de repouso',
      defaultPrice: 12000, // R$ 120,00
      durationMinutes: 15,
    },
  });

  const procClinicalExam = await prisma.procedure.create({
    data: {
      name: 'Consulta Médica Ocupacional',
      code: '10101012',
      description: 'Consulta médica para ASO',
      defaultPrice: 8000, // R$ 80,00
      durationMinutes: 30,
    },
  });

  const procAcuity = await prisma.procedure.create({
    data: {
      name: 'Acuidade Visual',
      code: '40101010',
      description: 'Exame de acuidade visual',
      defaultPrice: 5000, // R$ 50,00
      durationMinutes: 10,
    },
  });

  console.log('✅ 5 procedimentos criados');

  // 4. CRIAR EMPRESAS
  console.log('\n🏢 Criando empresas...');
  const companyTech = await prisma.company.create({
    data: {
      corporateName: 'Tech Solutions Ltda',
      tradeName: 'TechSolutions',
      cnpj: '12345678000190',
      email: 'contato@techsolutions.com.br',
      phone: '+5511977777777',
      address: 'Rua Augusta, 123 - Consolação - São Paulo/SP - CEP 01305-000',
      isDelinquent: false,
      active: true,
    },
  });

  const companyConstruction = await prisma.company.create({
    data: {
      corporateName: 'Construção & Engenharia S.A.',
      tradeName: 'ConstrutechBR',
      cnpj: '98765432000111',
      email: 'rh@construtechbr.com.br',
      phone: '+5511966666666',
      address: 'Av. Faria Lima, 456 - Itaim Bibi - São Paulo/SP - CEP 04538-000',
      isDelinquent: true, // EMPRESA INADIMPLENTE PARA TESTE
      active: true,
    },
  });

  const companyIndustry = await prisma.company.create({
    data: {
      corporateName: 'Indústria Metal Forte Ltda',
      tradeName: 'MetalForte',
      cnpj: '11223344000155',
      email: 'contato@metalforte.com.br',
      phone: '+5511955555555',
      address: 'Rua Industrial, 789 - Ipiranga - São Paulo/SP - CEP 04206-000',
      isDelinquent: false,
      active: true,
    },
  });

  console.log('✅ 3 empresas criadas (1 inadimplente para teste)');

  // 5. CRIAR CARGOS
  console.log('\n💼 Criando cargos...');
  const jobDev = await prisma.job.create({
    data: {
      title: 'Desenvolvedor de Software',
      cbo: '2124-05',
      description: 'Desenvolver e manter sistemas de informação',
      companyId: companyTech.id,
      active: true,
    },
  });

  const jobEngineer = await prisma.job.create({
    data: {
      title: 'Engenheiro Civil',
      cbo: '2142-05',
      description: 'Projetar e supervisionar obras civis',
      companyId: companyConstruction.id,
      active: true,
    },
  });

  const jobWelder = await prisma.job.create({
    data: {
      title: 'Soldador',
      cbo: '7244-15',
      description: 'Realizar soldagem de peças metálicas',
      companyId: companyIndustry.id,
      active: true,
    },
  });

  const jobAnalyst = await prisma.job.create({
    data: {
      title: 'Analista de Sistemas',
      cbo: '2124-10',
      description: 'Analisar e modelar sistemas de informação',
      companyId: companyTech.id,
      active: true,
    },
  });

  console.log('✅ 4 cargos criados');

  // 6. CRIAR TRABALHADORES
  console.log('\n👷 Criando trabalhadores...');
  const workerPedro = await prisma.worker.create({
    data: {
      name: 'Pedro Henrique Santos',
      cpf: '12345678901',
      email: 'pedro.santos@email.com',
      phone: '+5511944444444',
      birthDate: new Date('1990-05-15'),
      address: 'Rua das Flores, 123 - Centro - São Paulo/SP',
      companyId: companyTech.id,
      active: true,
    },
  });

  const workerAna = await prisma.worker.create({
    data: {
      name: 'Ana Paula Oliveira',
      cpf: '98765432109',
      email: 'ana.oliveira@email.com',
      phone: '+5511933333333',
      birthDate: new Date('1988-08-20'),
      address: 'Av. Brasil, 456 - Vila Mariana - São Paulo/SP',
      companyId: companyConstruction.id,
      active: true,
    },
  });

  const workerCarlos = await prisma.worker.create({
    data: {
      name: 'Carlos Eduardo Silva',
      cpf: '11122233344',
      email: 'carlos.silva@email.com',
      phone: '+5511922222222',
      birthDate: new Date('1985-03-10'),
      address: 'Rua Industrial, 789 - Mooca - São Paulo/SP',
      companyId: companyIndustry.id,
      active: true,
    },
  });

  const workerJuliana = await prisma.worker.create({
    data: {
      name: 'Juliana Ferreira Costa',
      cpf: '55566677788',
      email: 'juliana.costa@email.com',
      phone: '+5511911111111',
      birthDate: new Date('1992-11-25'),
      address: 'Rua Augusta, 200 - Consolação - São Paulo/SP',
      companyId: companyTech.id,
      active: true,
    },
  });

  console.log('✅ 4 trabalhadores criados');

  // 7. CRIAR VÍNCULOS EMPREGATÍCIOS
  console.log('\n📝 Criando vínculos empregatícios...');
  const employmentPedro = await prisma.employment.create({
    data: {
      workerId: workerPedro.id,
      companyId: companyTech.id,
      jobId: jobDev.id,
      employmentStartDate: new Date('2023-01-15'),
    },
  });

  const employmentAna = await prisma.employment.create({
    data: {
      workerId: workerAna.id,
      companyId: companyConstruction.id,
      jobId: jobEngineer.id,
      employmentStartDate: new Date('2022-06-01'),
    },
  });

  const employmentCarlos = await prisma.employment.create({
    data: {
      workerId: workerCarlos.id,
      companyId: companyIndustry.id,
      jobId: jobWelder.id,
      employmentStartDate: new Date('2021-03-10'),
      // ATIVO - será usado para testar ASO demissional
    },
  });

  const employmentJuliana = await prisma.employment.create({
    data: {
      workerId: workerJuliana.id,
      companyId: companyTech.id,
      jobId: jobAnalyst.id,
      employmentStartDate: new Date('2024-01-02'),
    },
  });

  console.log('✅ 4 vínculos empregatícios criados');

  // 8. CRIAR AGENDAMENTOS
  console.log('\n📅 Criando agendamentos...');
  const appointmentWaiting = await prisma.appointment.create({
    data: {
      workerId: workerPedro.id,
      companyId: companyTech.id,
      appointmentDate: new Date(),
      context: AppointmentContext.PERIODICO,
      status: AppointmentStatus.WAITING, // NA SALA DE ESPERA
      roomId: room102.id,
      notes: 'Paciente aguardando na sala de espera',
    },
  });

  const appointmentInService = await prisma.appointment.create({
    data: {
      workerId: workerAna.id,
      companyId: companyConstruction.id,
      appointmentDate: new Date(),
      context: AppointmentContext.MUDANCA_DE_FUNCAO,
      status: AppointmentStatus.IN_SERVICE, // EM ATENDIMENTO
      roomId: room101.id,
    },
  });

  const appointmentToCome = await prisma.appointment.create({
    data: {
      workerId: workerJuliana.id,
      companyId: companyTech.id,
      appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
      context: AppointmentContext.ADMISSIONAL,
      status: AppointmentStatus.TO_COME,
      roomId: room102.id,
    },
  });

  // Vincular procedimentos aos agendamentos
  await prisma.appointmentProcedure.createMany({
    data: [
      { appointmentId: appointmentWaiting.id, procedureId: procClinicalExam.id },
      { appointmentId: appointmentWaiting.id, procedureId: procAcuity.id },
      { appointmentId: appointmentInService.id, procedureId: procAudiometry.id },
      { appointmentId: appointmentInService.id, procedureId: procClinicalExam.id },
    ],
  });

  console.log('✅ 3 agendamentos criados (1 WAITING, 1 IN_SERVICE, 1 TO_COME)');

  // 9. CRIAR DOCUMENTOS
  console.log('\n📄 Criando documentos...');
  const docASOPedro = await prisma.document.create({
    data: {
      type: DocumentType.ASO,
      workerId: workerPedro.id,
      employmentId: employmentPedro.id,
      issueDate: new Date('2023-01-15'),
      expirationDate: new Date('2024-01-15'),
      status: DocumentStatus.FINALIZED,
      asoConclusion: AsoConclusion.APTO,
      dismissEmployee: false,
      notes: 'ASO Admissional - Funcionário apto',
    },
  });

  const docASORascunho = await prisma.document.create({
    data: {
      type: DocumentType.ASO,
      workerId: workerCarlos.id,
      employmentId: employmentCarlos.id,
      issueDate: new Date(),
      status: DocumentStatus.DRAFT, // RASCUNHO - pode editar e finalizar
      asoConclusion: null,
      dismissEmployee: false,
      notes: 'ASO Periódico em elaboração',
    },
  });

  const docFichaClinicalAna = await prisma.document.create({
    data: {
      type: DocumentType.FICHA_CLINICA,
      workerId: workerAna.id,
      employmentId: employmentAna.id,
      issueDate: new Date('2022-06-01'),
      status: DocumentStatus.FINALIZED,
      notes: 'Ficha clínica inicial',
    },
  });

  console.log('✅ 3 documentos criados (1 FINALIZED, 1 DRAFT)');

  // 10. SEED MAPPING MODULE
  console.log('\n🗺️  Executando seed do módulo de mapeamento...');
  await seedMapping();

  // 11. RESUMO
  console.log('\n✅ SEED COMPLETO!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESUMO DOS DADOS CRIADOS:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n👥 USUÁRIOS PARA LOGIN:');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ ADMIN:                                                  │');
  console.log('│   Email: admin@ocupalli.com.br                          │');
  console.log('│   Senha: admin123                                       │');
  console.log('│   Role: ADMIN                                           │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ MÉDICO:                                                 │');
  console.log('│   Email: joao.silva@ocupalli.com.br                     │');
  console.log('│   Senha: doctor123                                      │');
  console.log('│   Role: DOCTOR                                          │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ RECEPCIONISTA:                                          │');
  console.log('│   Email: maria.recepcao@ocupalli.com.br                 │');
  console.log('│   Senha: recepcao123                                    │');
  console.log('│   Role: RECEPTIONIST                                    │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ TÉCNICO:                                                │');
  console.log('│   Email: carlos.tecnico@ocupalli.com.br                 │');
  console.log('│   Senha: tecnico123                                     │');
  console.log('│   Role: TECHNICIAN                                      │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log('\n🏢 EMPRESAS:');
  console.log(`  • ${companyTech.corporateName} (${companyTech.cnpj}) - Ativa`);
  console.log(`  • ${companyConstruction.corporateName} (${companyConstruction.cnpj}) - ⚠️ INADIMPLENTE`);
  console.log(`  • ${companyIndustry.corporateName} (${companyIndustry.cnpj}) - Ativa`);
  console.log('\n👷 TRABALHADORES:');
  console.log(`  • Pedro Henrique Santos (CPF: ${workerPedro.cpf}) - TechSolutions`);
  console.log(`  • Ana Paula Oliveira (CPF: ${workerAna.cpf}) - ConstrutechBR`);
  console.log(`  • Carlos Eduardo Silva (CPF: ${workerCarlos.cpf}) - MetalForte (TESTE ASO DEMISSIONAL)`);
  console.log(`  • Juliana Ferreira Costa (CPF: ${workerJuliana.cpf}) - TechSolutions`);
  console.log('\n📅 AGENDAMENTOS:');
  console.log(`  • Pedro - WAITING (na sala de espera)`);
  console.log(`  • Ana - IN_SERVICE (em atendimento)`);
  console.log(`  • Juliana - TO_COME (agendado para amanhã)`);
  console.log('\n📄 DOCUMENTOS:');
  console.log(`  • ASO finalizado - Pedro (APTO)`);
  console.log(`  • ASO rascunho - Carlos (para testar finalização)`);
  console.log(`  • Ficha Clínica - Ana`);
  console.log('\n💉 PROCEDIMENTOS: 5 cadastrados');
  console.log('🏥 UNIDADES CLÍNICAS: 2 (com 3 salas)');
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🎯 CENÁRIOS DE TESTE PRONTOS:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('1️⃣  Login com diferentes roles');
  console.log('2️⃣  Empresa inadimplente (ConstrutechBR)');
  console.log('3️⃣  Sala de espera com paciente aguardando');
  console.log('4️⃣  ASO demissional (usar Carlos Eduardo)');
  console.log('5️⃣  Finalização de documento ASO rascunho');
  console.log('6️⃣  Transições de status de agendamento');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
