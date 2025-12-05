import { PrismaClient, ExamCategory } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed de Exames Ocupacionais Brasileiros
 * Baseado na NR-7 e Tabela 27 do eSocial
 */

const BRAZILIAN_EXAMS = [
  // EXAMES CLÍNICOS
  {
    name: 'Exame Clínico Ocupacional',
    description: 'Avaliação clínica geral do trabalhador, obrigatória em todos os tipos de ASO',
    category: ExamCategory.CLINICAL,
    table27Codes: ['01.01.01.001'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'Exame Físico Cardiovascular',
    description: 'Avaliação do sistema cardiovascular',
    category: ExamCategory.CLINICAL,
    table27Codes: ['01.01.01.002'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'Exame Físico Respiratório',
    description: 'Avaliação do sistema respiratório',
    category: ExamCategory.CLINICAL,
    table27Codes: ['01.01.01.003'],
    insertIntoASO: true,
    requiresJustification: false,
  },

  // EXAMES LABORATORIAIS
  {
    name: 'Hemograma Completo',
    description: 'Análise completa das células sanguíneas',
    category: ExamCategory.LABORATORY,
    table27Codes: ['02.01.01.001'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'Glicemia de Jejum',
    description: 'Dosagem de glicose no sangue em jejum',
    category: ExamCategory.LABORATORY,
    table27Codes: ['02.01.01.002'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'Colesterol Total e Frações',
    description: 'Dosagem de colesterol total, HDL, LDL e triglicerídeos',
    category: ExamCategory.LABORATORY,
    table27Codes: ['02.01.01.003'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'Ureia e Creatinina',
    description: 'Avaliação da função renal',
    category: ExamCategory.LABORATORY,
    table27Codes: ['02.01.01.004'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'TGO e TGP (Transaminases)',
    description: 'Avaliação da função hepática',
    category: ExamCategory.LABORATORY,
    table27Codes: ['02.01.01.005'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'EAS (Urina Tipo 1)',
    description: 'Exame de urina de rotina',
    category: ExamCategory.LABORATORY,
    table27Codes: ['02.01.01.006'],
    insertIntoASO: true,
    requiresJustification: false,
  },

  // EXAMES DE IMAGEM
  {
    name: 'Raio-X de Tórax (PA e Perfil)',
    description: 'Radiografia de tórax em duas incidências',
    category: ExamCategory.IMAGING,
    table27Codes: ['03.01.01.001'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'Raio-X de Coluna Lombar',
    description: 'Radiografia da coluna lombar',
    category: ExamCategory.IMAGING,
    table27Codes: ['03.01.01.002'],
    insertIntoASO: true,
    requiresJustification: true,
  },
  {
    name: 'Eletrocardiograma (ECG)',
    description: 'Avaliação da atividade elétrica do coração',
    category: ExamCategory.IMAGING,
    table27Codes: ['03.01.01.003'],
    insertIntoASO: true,
    requiresJustification: false,
  },

  // EXAMES COMPLEMENTARES ESPECÍFICOS
  {
    name: 'Audiometria Tonal',
    description: 'Avaliação da acuidade auditiva - obrigatório para exposição a ruído',
    category: ExamCategory.COMPLEMENTARY,
    table27Codes: ['05.01.01.001'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'Espirometria',
    description: 'Avaliação da função pulmonar - obrigatório para exposição a poeiras/gases',
    category: ExamCategory.COMPLEMENTARY,
    table27Codes: ['05.01.01.002'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'Acuidade Visual',
    description: 'Avaliação da visão - obrigatório para motoristas e trabalho em altura',
    category: ExamCategory.COMPLEMENTARY,
    table27Codes: ['05.01.01.003'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'Avaliação Psicológica',
    description: 'Avaliação psicológica - obrigatório para trabalho em altura, espaço confinado, etc',
    category: ExamCategory.PSYCHOSOCIAL,
    table27Codes: ['06.01.01.001'],
    insertIntoASO: true,
    requiresJustification: false,
  },

  // EXAMES TOXICOLÓGICOS
  {
    name: 'Acetilcolinesterase Eritrocitária',
    description: 'Detecção de exposição a organofosforados e carbamatos',
    category: ExamCategory.LABORATORY,
    table27Codes: ['02.02.01.001'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'Chumbo no Sangue (Plumbemia)',
    description: 'Dosagem de chumbo - obrigatório para exposição a chumbo',
    category: ExamCategory.LABORATORY,
    table27Codes: ['02.02.01.002'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'Mercúrio Urinário',
    description: 'Dosagem de mercúrio na urina - obrigatório para exposição a mercúrio',
    category: ExamCategory.LABORATORY,
    table27Codes: ['02.02.01.003'],
    insertIntoASO: true,
    requiresJustification: false,
  },
  {
    name: 'Benzeno (Ácido trans-trans-Mucônico)',
    description: 'Detecção de exposição a benzeno',
    category: ExamCategory.LABORATORY,
    table27Codes: ['02.02.01.004'],
    insertIntoASO: true,
    requiresJustification: false,
  },

  // TESTES FUNCIONAIS
  {
    name: 'Teste Ergométrico',
    description: 'Avaliação cardiovascular sob esforço',
    category: ExamCategory.FUNCTIONAL,
    table27Codes: ['07.01.01.001'],
    insertIntoASO: true,
    requiresJustification: true,
  },
  {
    name: 'Teste de Esforço Físico',
    description: 'Avaliação da capacidade física para trabalhos pesados',
    category: ExamCategory.FUNCTIONAL,
    table27Codes: ['07.01.01.002'],
    insertIntoASO: true,
    requiresJustification: true,
  },
];

async function seedExams() {
  console.log('🌱 Iniciando seed de exames ocupacionais...');

  for (const exam of BRAZILIAN_EXAMS) {
    try {
      const existing = await prisma.examination.findUnique({
        where: { name: exam.name },
      });

      if (existing) {
        console.log(`  ⏭️  Exame já existe: ${exam.name}`);
        continue;
      }

      await prisma.examination.create({
        data: exam,
      });

      console.log(`  ✅ Criado: ${exam.name}`);
    } catch (error) {
      console.error(`  ❌ Erro ao criar ${exam.name}:`, error);
    }
  }

  console.log(`\n🎉 Seed de exames concluído! ${BRAZILIAN_EXAMS.length} exames processados.`);
}

// Executar seed se chamado diretamente
if (require.main === module) {
  seedExams()
    .catch((error) => {
      console.error('Erro no seed de exames:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedExams };
