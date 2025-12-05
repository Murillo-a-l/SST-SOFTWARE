import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedMapping() {
  console.log('🗺️  Seeding mapping module...');

  // Create Risk Categories
  const categories = await Promise.all([
    prisma.riskCategory.upsert({
      where: { name: 'Riscos Físicos' },
      update: {},
      create: {
        name: 'Riscos Físicos',
        description: 'Agentes físicos presentes no ambiente de trabalho',
        color: '#FF5722',
        icon: 'zap',
      },
    }),
    prisma.riskCategory.upsert({
      where: { name: 'Riscos Químicos' },
      update: {},
      create: {
        name: 'Riscos Químicos',
        description: 'Substâncias químicas em diversas formas',
        color: '#4CAF50',
        icon: 'flask',
      },
    }),
    prisma.riskCategory.upsert({
      where: { name: 'Riscos Biológicos' },
      update: {},
      create: {
        name: 'Riscos Biológicos',
        description: 'Microrganismos patogênicos',
        color: '#2196F3',
        icon: 'bacteria',
      },
    }),
    prisma.riskCategory.upsert({
      where: { name: 'Riscos Ergonômicos' },
      update: {},
      create: {
        name: 'Riscos Ergonômicos',
        description: 'Fatores relacionados à adaptação do trabalho ao homem',
        color: '#FFC107',
        icon: 'user',
      },
    }),
    prisma.riskCategory.upsert({
      where: { name: 'Riscos de Acidentes' },
      update: {},
      create: {
        name: 'Riscos de Acidentes',
        description: 'Situações de perigo que podem causar acidentes',
        color: '#F44336',
        icon: 'alert-triangle',
      },
    }),
  ]);

  console.log(`✅ ${categories.length} categorias criadas`);

  // Create sample Risks
  const risks = await Promise.all([
    prisma.risk.upsert({
      where: { name: 'Ruído contínuo ou intermitente' },
      update: {},
      create: {
        categoryId: categories[0].id,
        type: 'PHYSICAL',
        code: '01.01.001',
        name: 'Ruído contínuo ou intermitente',
        description: 'Exposição a níveis de pressão sonora superiores aos limites de tolerância',
        sourceGenerator: 'Máquinas, equipamentos, veículos',
        healthEffects: 'Perda auditiva induzida por ruído (PAIR)',
        controlMeasures: 'EPI: Protetor auricular; EPC: Enclausuramento de máquinas',
        allowsIntensity: true,
        isGlobal: true,
      },
    }),
    prisma.risk.upsert({
      where: { name: 'Poeiras minerais' },
      update: {},
      create: {
        categoryId: categories[1].id,
        type: 'CHEMICAL',
        code: '01.02.003',
        name: 'Poeiras minerais',
        description: 'Exposição a poeiras de sílica, asbesto, etc',
        sourceGenerator: 'Mineração, construção civil',
        healthEffects: 'Silicose, asbestose, pneumoconioses',
        controlMeasures: 'Umidificação, ventilação, máscara PFF2/PFF3',
        allowsIntensity: true,
        isGlobal: true,
      },
    }),
    prisma.risk.upsert({
      where: { name: 'Vírus, bactérias, fungos' },
      update: {},
      create: {
        categoryId: categories[2].id,
        type: 'BIOLOGICAL',
        code: '01.03.001',
        name: 'Vírus, bactérias, fungos',
        description: 'Exposição a microrganismos patogênicos',
        sourceGenerator: 'Hospitais, laboratórios, lixo',
        healthEffects: 'Infecções, doenças transmissíveis',
        controlMeasures: 'Vacinação, EPIs, higienização',
        allowsIntensity: false,
        isGlobal: true,
      },
    }),
    prisma.risk.upsert({
      where: { name: 'Levantamento e transporte manual de peso' },
      update: {},
      create: {
        categoryId: categories[3].id,
        type: 'ERGONOMIC',
        code: '01.04.005',
        name: 'Levantamento e transporte manual de peso',
        description: 'Manipulação de cargas pesadas',
        sourceGenerator: 'Atividades de carga e descarga',
        healthEffects: 'Lesões musculoesqueléticas, hérnias',
        controlMeasures: 'Treinamento, equipamentos auxiliares, pausas',
        allowsIntensity: true,
        isGlobal: true,
      },
    }),
    prisma.risk.upsert({
      where: { name: 'Trabalho em altura' },
      update: {},
      create: {
        categoryId: categories[4].id,
        type: 'ACCIDENT',
        code: '01.05.002',
        name: 'Trabalho em altura',
        description: 'Atividades acima de 2 metros do nível inferior',
        sourceGenerator: 'Construção civil, manutenção',
        healthEffects: 'Quedas, traumatismos, óbito',
        controlMeasures: 'Cinto de segurança, trava-quedas, treinamento NR-35',
        allowsIntensity: false,
        isGlobal: true,
      },
    }),
    prisma.risk.upsert({
      where: { name: 'Eletricidade' },
      update: {},
      create: {
        categoryId: categories[4].id,
        type: 'ACCIDENT',
        code: '01.05.001',
        name: 'Eletricidade',
        description: 'Trabalho com circuitos elétricos energizados',
        sourceGenerator: 'Instalações elétricas, manutenção',
        healthEffects: 'Choque elétrico, queimaduras, óbito',
        controlMeasures: 'Desenergização, bloqueio, luvas isolantes, treinamento NR-10',
        allowsIntensity: false,
        isGlobal: true,
      },
    }),
  ]);

  console.log(`✅ ${risks.length} riscos criados`);

  // Get first company for demo environments
  const firstCompany = await prisma.company.findFirst();

  if (firstCompany) {
    // Create sample Environments
    const environments = await Promise.all([
      prisma.environment.upsert({
        where: {
          companyId_name: {
            companyId: firstCompany.id,
            name: 'Escritório Administrativo',
          },
        },
        update: {},
        create: {
          companyId: firstCompany.id,
          name: 'Escritório Administrativo',
          locationType: 'EMPLOYER_ESTABLISHMENT',
          description: 'Ambiente climatizado com computadores e móveis de escritório',
          color: '#3F51B5',
          icon: 'briefcase',
          registeredInESocial: false,
        },
      }),
      prisma.environment.upsert({
        where: {
          companyId_name: {
            companyId: firstCompany.id,
            name: 'Produção Industrial',
          },
        },
        update: {},
        create: {
          companyId: firstCompany.id,
          name: 'Produção Industrial',
          locationType: 'EMPLOYER_ESTABLISHMENT',
          description: 'Galpão industrial com máquinas e equipamentos',
          color: '#FF9800',
          icon: 'factory',
          registeredInESocial: false,
        },
      }),
    ]);

    console.log(`✅ ${environments.length} ambientes criados para ${firstCompany.tradeName || firstCompany.corporateName}`);

    // Add risks to environments
    await Promise.all([
      // Ruído no ambiente de produção
      prisma.environmentRisk.upsert({
        where: {
          environmentId_riskId: {
            environmentId: environments[1].id,
            riskId: risks[0].id,
          },
        },
        update: {},
        create: {
          environmentId: environments[1].id,
          riskId: risks[0].id,
          intensity: 'HIGH',
          notes: 'Máquinas em operação contínua',
        },
      }),
      // Levantamento de peso no ambiente de produção
      prisma.environmentRisk.upsert({
        where: {
          environmentId_riskId: {
            environmentId: environments[1].id,
            riskId: risks[3].id,
          },
        },
        update: {},
        create: {
          environmentId: environments[1].id,
          riskId: risks[3].id,
          intensity: 'MEDIUM',
          notes: 'Movimentação de cargas',
        },
      }),
    ]);

    console.log('✅ Riscos vinculados aos ambientes');
  }

  console.log('✅ Mapping module seeded successfully!');
}

// Run if executed directly
if (require.main === module) {
  seedMapping()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
