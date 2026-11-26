import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import {
  Affiliation,
  ChronicleCategory,
  ContractStatus,
  ContractType,
  PrismaClient,
  Sea,
} from '../dist/generated/prisma/client.js';

const SEED_IDS = {
  users: {
    robin: '11111111-1111-4111-8111-111111111101',
    luffy: '11111111-1111-4111-8111-111111111102',
    zoro: '11111111-1111-4111-8111-111111111103',
    smoker: '11111111-1111-4111-8111-111111111104',
    sabo: '11111111-1111-4111-8111-111111111105',
    law: '11111111-1111-4111-8111-111111111106',
  },
  chronicles: {
    waterSevenPoneglyph: '22222222-2222-4222-8222-222222222201',
    knockUpStream: '22222222-2222-4222-8222-222222222202',
    opeOpeAwakening: '22222222-2222-4222-8222-222222222203',
    raijinIslandReport: '22222222-2222-4222-8222-222222222204',
    redPortSupplyRoutes: '22222222-2222-4222-8222-222222222205',
    drumsOfLiberation: '22222222-2222-4222-8222-222222222206',
  },
  comments: {
    c1: '33333333-3333-4333-8333-333333333301',
    c2: '33333333-3333-4333-8333-333333333302',
    c3: '33333333-3333-4333-8333-333333333303',
    c4: '33333333-3333-4333-8333-333333333304',
    c5: '33333333-3333-4333-8333-333333333305',
    c6: '33333333-3333-4333-8333-333333333306',
  },
  contracts: {
    florianMusician: '44444444-4444-4444-8444-444444444401',
    kriegFleetBounty: '44444444-4444-4444-8444-444444444402',
    dressrosaSmugglers: '44444444-4444-4444-8444-444444444403',
    newWorldNavigator: '44444444-4444-4444-8444-444444444404',
    buggyBounty: '44444444-4444-4444-8444-444444444405',
    adamWoodWright: '44444444-4444-4444-8444-444444444406',
  },
} as const;

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não definida no ambiente para executar o seed.');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const defaultPasswordHash = await bcrypt.hash('GrandLine@2026', 10);

    const usersData = [
      {
        id: SEED_IDS.users.robin,
        name: 'Nico Robin',
        email: 'nico.robin@ohara.gl',
        affiliation: Affiliation.PIRATE,
        bounty: 930_000_000n,
      },
      {
        id: SEED_IDS.users.luffy,
        name: 'Monkey D. Luffy',
        email: 'luffy@thousand-sunny.gl',
        affiliation: Affiliation.PIRATE,
        bounty: 3_000_000_000n,
      },
      {
        id: SEED_IDS.users.zoro,
        name: 'Roronoa Zoro',
        email: 'zoro@thousand-sunny.gl',
        affiliation: Affiliation.BOUNTY_HUNTER,
        bounty: 1_111_000_000n,
      },
      {
        id: SEED_IDS.users.smoker,
        name: 'Vice-Almirante Smoker',
        email: 'smoker@g5-marine.gl',
        affiliation: Affiliation.MARINE,
        bounty: 0n,
      },
      {
        id: SEED_IDS.users.sabo,
        name: 'Sabo',
        email: 'sabo@baltigo.gl',
        affiliation: Affiliation.REVOLUTIONARY,
        bounty: 602_000_000n,
      },
      {
        id: SEED_IDS.users.law,
        name: 'Trafalgar D. Water Law',
        email: 'law@polar-tang.gl',
        affiliation: Affiliation.PIRATE,
        bounty: 3_000_000_000n,
      },
    ];

    const userIdByEmail = new Map<string, string>();
    for (const u of usersData) {
      const saved = await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          affiliation: u.affiliation,
          bounty: u.bounty,
          passwordHash: defaultPasswordHash,
        },
        create: {
          id: u.id,
          name: u.name,
          email: u.email,
          affiliation: u.affiliation,
          bounty: u.bounty,
          passwordHash: defaultPasswordHash,
        },
      });
      userIdByEmail.set(u.email, saved.id);
    }

    const robinId = userIdByEmail.get('nico.robin@ohara.gl')!;
    const luffyId = userIdByEmail.get('luffy@thousand-sunny.gl')!;
    const zoroId = userIdByEmail.get('zoro@thousand-sunny.gl')!;
    const smokerId = userIdByEmail.get('smoker@g5-marine.gl')!;
    const saboId = userIdByEmail.get('sabo@baltigo.gl')!;
    const lawId = userIdByEmail.get('law@polar-tang.gl')!;

    const chroniclesData = [
      {
        id: SEED_IDS.chronicles.waterSevenPoneglyph,
        title: 'Inscrições em Poneglyphs Submersos sob as Fundações de Water 7',
        content:
          'Durante o recuo anual da Aqua Laguna, galerias de pedra ancestral revelaram glifos idênticos aos encontrados em Alabasta e Skypiea. Os registros apontam para rotas navais do Século Perdido que ligavam ilhas hoje separadas pela Red Line, reforçando a teoria de que o nível oceânico subiu drasticamente há oitocentos anos.',
        category: ChronicleCategory.VOID_CENTURY,
        coverUrl: null,
        authorId: robinId,
        createdAt: new Date('2026-11-20T10:30:00.000Z'),
      },
      {
        id: SEED_IDS.chronicles.knockUpStream,
        title: 'Anomalias Magnéticas entre Jaya e a Corrente Knock Up',
        content:
          'O Log Pose apontou diretamente para o céu! Navegadores que cruzarem a costa sul de Mock Town devem reforçar o casco antes do meio-dia: um gêiser oceânico colossal dispara embarcações inteiras até o Mar Branco de Skypiea a mais de sete mil metros de altitude.',
        category: ChronicleCategory.ISLAND_DISCOVERY,
        coverUrl: 'http://localhost:5173/banner-login.jpg',
        authorId: luffyId,
        createdAt: new Date('2026-11-21T14:15:00.000Z'),
      },
      {
        id: SEED_IDS.chronicles.opeOpeAwakening,
        title: 'Propriedades Espaciais e Consumo de Vigor no Despertar da Ope Ope no Mi',
        content:
          'Diferente das Paramecias convencionais que alteram apenas o ambiente imediato, a aplicação de KROOM permite revestir objetos específicos com uma sala cirúrgica móvel, propagando ondas de choque internas sem dano superficial visível. O custo energético, contudo, exige disciplina extrema em combates prolongados no Novo Mundo.',
        category: ChronicleCategory.AKUMA_NO_MI,
        coverUrl: null,
        authorId: lawId,
        createdAt: new Date('2026-11-22T09:00:00.000Z'),
      },
      {
        id: SEED_IDS.chronicles.raijinIslandReport,
        title: 'Relatório Tático G-5: Chuva Contínua de Relâmpagos em Raijin Island',
        content:
          'Embarcações revestidas com metais condutores não devem se aproximar da agulha magnética mais instável ao sair da Ilha dos Homens-Peixe. A tempestade elétrica de Raijin Island neutraliza bússolas secundárias e exige mastros isolados com borracha ou madeira tratada.',
        category: ChronicleCategory.VOYAGE_LOG,
        coverUrl: null,
        authorId: smokerId,
        createdAt: new Date('2026-11-23T16:45:00.000Z'),
      },
      {
        id: SEED_IDS.chronicles.redPortSupplyRoutes,
        title: 'Movimentação de Comboios e Rotas Alternativas Próximas ao Red Port',
        content:
          'Observadores do Exército Revolucionário mapearam desvios seguros para navios mercantes que desejam evitar o bloqueio tarifário imposto pelos Dragões Celestiais. As correntes noturnas a oeste de Sabaody permitem travessia silenciosa sem detecção por Den Den Mushi de vigilância.',
        category: ChronicleCategory.VOYAGE_LOG,
        coverUrl: 'http://localhost:5173/banner-register.jpg',
        authorId: saboId,
        createdAt: new Date('2026-11-24T19:20:00.000Z'),
      },
      {
        id: SEED_IDS.chronicles.drumsOfLiberation,
        title: 'Os Tambores da Libertação e o Juramento Registrado em Laugh Tale',
        content:
          'Comparando o pedido de desculpas gravado por Joy Boy na Ilha dos Homens-Peixe com relatos orais de Elbaph e Wano, emerge um padrão claro: o despertar mítico associado ao Deus do Sol Nika não é apenas uma transformação de Akuma no Mi, mas o gatilho histórico aguardado pelos guardiões dos Road Poneglyphs.',
        category: ChronicleCategory.VOID_CENTURY,
        coverUrl: null,
        authorId: robinId,
        createdAt: new Date('2026-11-25T08:10:00.000Z'),
      },
    ];

    for (const c of chroniclesData) {
      await prisma.chronicle.upsert({
        where: { id: c.id },
        update: {
          title: c.title,
          content: c.content,
          category: c.category,
          coverUrl: c.coverUrl,
          authorId: c.authorId,
        },
        create: c,
      });
    }

    const commentsData = [
      {
        id: SEED_IDS.comments.c1,
        chronicleId: SEED_IDS.chronicles.waterSevenPoneglyph,
        authorId: saboId,
        content:
          'Nossos batedores em Baltigo encontraram ruínas costeiras submersas com a mesma arquitetura. Excelente registro, Robin!',
        createdAt: new Date('2026-11-20T12:00:00.000Z'),
      },
      {
        id: SEED_IDS.comments.c2,
        chronicleId: SEED_IDS.chronicles.knockUpStream,
        authorId: zoroId,
        content:
          'Esqueceu de avisar que quase viramos comida de Rei dos Mares antes de subir nessa corrente.',
        createdAt: new Date('2026-11-21T15:05:00.000Z'),
      },
      {
        id: SEED_IDS.comments.c3,
        chronicleId: SEED_IDS.chronicles.knockUpStream,
        authorId: lawId,
        content:
          'Subir uma corrente vertical sem rota de fuga calculada continua sendo pura insanidade, Mugiwara-ya.',
        createdAt: new Date('2026-11-21T16:10:00.000Z'),
      },
      {
        id: SEED_IDS.comments.c4,
        chronicleId: SEED_IDS.chronicles.opeOpeAwakening,
        authorId: robinId,
        content:
          'A interação entre o despertar de Paramecias e o Haki do Armamento do oponente merece um tratado próprio.',
        createdAt: new Date('2026-11-22T11:30:00.000Z'),
      },
      {
        id: SEED_IDS.comments.c5,
        chronicleId: SEED_IDS.chronicles.raijinIslandReport,
        authorId: luffyId,
        content:
          'Raios não fazem nem cócegas em mim! Shishishi!',
        createdAt: new Date('2026-11-23T18:00:00.000Z'),
      },
      {
        id: SEED_IDS.comments.c6,
        chronicleId: SEED_IDS.chronicles.drumsOfLiberation,
        authorId: saboId,
        content:
          'Quando essa verdade vier à tona em todos os mares, nenhum trono em Mary Geoise ficará inabalado.',
        createdAt: new Date('2026-11-25T09:40:00.000Z'),
      },
    ];

    for (const comment of commentsData) {
      await prisma.comment.upsert({
        where: { id: comment.id },
        update: {
          content: comment.content,
          chronicleId: comment.chronicleId,
          authorId: comment.authorId,
        },
        create: comment,
      });
    }

    const likesPairs: Array<{ chronicleId: string; userId: string }> = [
      { chronicleId: SEED_IDS.chronicles.waterSevenPoneglyph, userId: luffyId },
      { chronicleId: SEED_IDS.chronicles.waterSevenPoneglyph, userId: saboId },
      { chronicleId: SEED_IDS.chronicles.waterSevenPoneglyph, userId: lawId },
      { chronicleId: SEED_IDS.chronicles.knockUpStream, userId: robinId },
      { chronicleId: SEED_IDS.chronicles.knockUpStream, userId: zoroId },
      { chronicleId: SEED_IDS.chronicles.opeOpeAwakening, userId: robinId },
      { chronicleId: SEED_IDS.chronicles.opeOpeAwakening, userId: zoroId },
      { chronicleId: SEED_IDS.chronicles.raijinIslandReport, userId: saboId },
      { chronicleId: SEED_IDS.chronicles.redPortSupplyRoutes, userId: robinId },
      { chronicleId: SEED_IDS.chronicles.drumsOfLiberation, userId: luffyId },
      { chronicleId: SEED_IDS.chronicles.drumsOfLiberation, userId: saboId },
      { chronicleId: SEED_IDS.chronicles.drumsOfLiberation, userId: zoroId },
      { chronicleId: SEED_IDS.chronicles.drumsOfLiberation, userId: lawId },
    ];

    for (const pair of likesPairs) {
      await prisma.chronicleLike.upsert({
        where: {
          chronicleId_userId: {
            chronicleId: pair.chronicleId,
            userId: pair.userId,
          },
        },
        update: {},
        create: pair,
      });
    }

    const contractsData = [
      {
        id: SEED_IDS.contracts.florianMusician,
        title: 'Procura-se Músico Destemido para Cruzar o Florian Triangle',
        description:
          'Vaga imediata em navio movido a Cola! Requisitos essenciais: saber tocar canções de taverna como Binks no Sake durante banquetes, não ter medo de navios fantasmas e topar aventuras rumo ao Novo Mundo.',
        type: ContractType.CREW_RECRUITMENT,
        reward: 0n,
        sea: Sea.GRAND_LINE,
        status: ContractStatus.OPEN,
        authorId: luffyId,
        createdAt: new Date('2026-11-25T07:00:00.000Z'),
      },
      {
        id: SEED_IDS.contracts.newWorldNavigator,
        title: 'Especialista em Log Pose Triplo para Expedição Submarina',
        description:
          'O Polar Tang busca navegador auxiliar com experiência comprovada em correntes térmicas profundas do Novo Mundo e leitura de cartas náuticas codificadas.',
        type: ContractType.CREW_RECRUITMENT,
        reward: 120_000_000n,
        sea: Sea.NEW_WORLD,
        status: ContractStatus.OPEN,
        authorId: lawId,
        createdAt: new Date('2026-11-24T15:30:00.000Z'),
      },
      {
        id: SEED_IDS.contracts.dressrosaSmugglers,
        title: 'Neutralização de Contrabandistas de Armas no Porto Subterrâneo',
        description:
          'Contrato de interceptação contra remessas ilegais de armamento pesado saindo das docas subterrâneas no Novo Mundo. Provas documentais e manifesto de carga garantem pagamento integral.',
        type: ContractType.BOUNTY_HUNTER,
        reward: 450_000_000n,
        sea: Sea.NEW_WORLD,
        status: ContractStatus.IN_PROGRESS,
        authorId: saboId,
        createdAt: new Date('2026-11-23T13:20:00.000Z'),
      },
      {
        id: SEED_IDS.contracts.adamWoodWright,
        title: 'Carpinteiro Naval com Domínio de Madeira da Árvore Adam',
        description:
          'Convocação para reforço estrutural de escuna rápida na primeira metade da Grand Line. Ferramentas de precisão de Water 7 e estaleiro reservado já disponíveis.',
        type: ContractType.CREW_RECRUITMENT,
        reward: 85_000_000n,
        sea: Sea.GRAND_LINE,
        status: ContractStatus.IN_PROGRESS,
        authorId: saboId,
        createdAt: new Date('2026-11-22T18:00:00.000Z'),
      },
      {
        id: SEED_IDS.contracts.buggyBounty,
        title: 'Caçada à Frota de Saqueadores de Orange Town',
        description:
          'Recompensa oferecida pela captura dos comandantes que bombardearam o porto comercial no East Blue com balas especiais de canhão.',
        type: ContractType.BOUNTY_HUNTER,
        reward: 15_000_000n,
        sea: Sea.EAST_BLUE,
        status: ContractStatus.OPEN,
        authorId: zoroId,
        createdAt: new Date('2026-11-21T11:45:00.000Z'),
      },
      {
        id: SEED_IDS.contracts.kriegFleetBounty,
        title: 'Desmantelamento da Armada Pirata Krieg Próxima ao Baratie',
        description:
          'Mandado cumprido nas águas do East Blue após tentativa de tomada do restaurante marítimo Baratie. Recompensa liquidada junto à jurisdição naval.',
        type: ContractType.BOUNTY_HUNTER,
        reward: 17_000_000n,
        sea: Sea.EAST_BLUE,
        status: ContractStatus.COMPLETED,
        authorId: smokerId,
        createdAt: new Date('2026-11-19T09:15:00.000Z'),
      },
    ];

    for (const contract of contractsData) {
      await prisma.contract.upsert({
        where: { id: contract.id },
        update: {
          title: contract.title,
          description: contract.description,
          type: contract.type,
          reward: contract.reward,
          sea: contract.sea,
          status: contract.status,
          authorId: contract.authorId,
        },
        create: contract,
      });
    }

    console.log(
      'Seed concluído: 6 tripulantes, 6 crônicas, 6 comentários, 13 curtidas e 6 contratos prontos na Grand Line!',
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('Erro ao executar seed do Grand Line Hub:', error);
  process.exit(1);
});
