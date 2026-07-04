import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OWNER_USER_ID = "00000000-0000-0000-0000-000000000001";

interface SeedEstablishment {
  name: string;
  description: string;
  category: string;
  phone: string | null;
  whatsapp: string | null;
  latitude: number;
  longitude: number;
  beach: string;
  coverImage: string | null;
  gallery: string[];
  tags: string[];
  businessHours: Record<string, { open: string; close: string }>;
}

const establishments: SeedEstablishment[] = [
  // ── Gaibu ──────────────────────────────────────────────────────────
  {
    name: "Barraca do Seu João",
    description:
      "Tradicional barraca de praia com petiscos, bebidas geladas e a melhor vista da praia de Gaibu. Experimente a porção de camarão e a água de coco.",
    category: "barraqueiro",
    phone: "(81) 99999-0001",
    whatsapp: "(81) 99999-0001",
    latitude: -8.2503,
    longitude: -34.9982,
    beach: "Gaibu",
    coverImage: "https://picsum.photos/seed/barraca-joao/400/300",
    gallery: [
      "https://picsum.photos/seed/barraca-joao-1/400/300",
      "https://picsum.photos/seed/barraca-joao-2/400/300",
    ],
    tags: ["petiscos", "camarão", "água de coco", "família"],
    businessHours: {
      sab: { open: "08:00", close: "17:00" },
      dom: { open: "08:00", close: "17:00" },
    },
  },
  {
    name: "Buggy Aventura PE",
    description:
      "Passeio de buggy pelas falésias e praias da região. Roteiros personalizados com guia local. Conheça Gaibu, Calhetas e Paraíso.",
    category: "bugueiro",
    phone: "(81) 99999-0002",
    whatsapp: "(81) 99999-0002",
    latitude: -8.2521,
    longitude: -35.0025,
    beach: "Gaibu",
    coverImage: "https://picsum.photos/seed/buggy-aventura/400/300",
    gallery: [],
    tags: ["buggy", "passeio", "falésias", "aventura", "guia local"],
    businessHours: {
      seg: { open: "06:00", close: "18:00" },
      ter: { open: "06:00", close: "18:00" },
      qua: { open: "06:00", close: "18:00" },
      qui: { open: "06:00", close: "18:00" },
      sex: { open: "06:00", close: "18:00" },
      sab: { open: "06:00", close: "18:00" },
      dom: { open: "06:00", close: "18:00" },
    },
  },

  // ── Porto de Galinhas ──────────────────────────────────────────────
  {
    name: "Passeios Marítimos VP",
    description:
      "Passeios de jangada e catamarã pelas piscinas naturais de Porto de Galinhas. Mergulho com snorkel incluso. Crianças a partir de 5 anos.",
    category: "operador de passeios",
    phone: "(81) 99999-0003",
    whatsapp: null,
    latitude: -8.5055,
    longitude: -35.0088,
    beach: "Porto de Galinhas",
    coverImage: null,
    gallery: [],
    tags: ["jangada", "piscinas naturais", "snorkel", "mergulho"],
    businessHours: {
      seg: { open: "07:00", close: "16:00" },
      ter: { open: "07:00", close: "16:00" },
      qua: { open: "07:00", close: "16:00" },
      qui: { open: "07:00", close: "16:00" },
      sex: { open: "07:00", close: "16:00" },
      sab: { open: "07:00", close: "16:00" },
      dom: { open: "07:00", close: "16:00" },
    },
  },
  {
    name: "Artesanato Mestre Zé",
    description:
      "Artesanato local em madeira, cerâmica e fibra de coco. Peças únicas feitas por artesãos da região de Porto de Galinhas. Leve uma lembrança de verdade.",
    category: "artesão",
    phone: null,
    whatsapp: "(81) 99999-0004",
    latitude: -8.5082,
    longitude: -35.0055,
    beach: "Porto de Galinhas",
    coverImage: "https://picsum.photos/seed/mestre-ze/400/300",
    gallery: [
      "https://picsum.photos/seed/mestre-ze-1/400/300",
      "https://picsum.photos/seed/mestre-ze-2/400/300",
    ],
    tags: ["artesanato", "madeira", "cerâmica", "coco", "presentes"],
    businessHours: {
      seg: { open: "09:00", close: "19:00" },
      ter: { open: "09:00", close: "19:00" },
      qua: { open: "09:00", close: "19:00" },
      qui: { open: "09:00", close: "19:00" },
      sex: { open: "09:00", close: "19:00" },
      sab: { open: "09:00", close: "20:00" },
      dom: { open: "09:00", close: "13:00" },
    },
  },
  {
    name: "Restaurante Maré Alta",
    description:
      "Comida típica pernambucana com frutos do mar frescos. Destaque para a moqueca de peixe, a caldeirada e a famosa caipirinha de caju.",
    category: "bar e restaurante",
    phone: "(81) 99999-0005",
    whatsapp: "(81) 99999-0005",
    latitude: -8.5101,
    longitude: -35.0102,
    beach: "Porto de Galinhas",
    coverImage: "https://picsum.photos/seed/mare-alta/400/300",
    gallery: [
      "https://picsum.photos/seed/mare-alta-1/400/300",
      "https://picsum.photos/seed/mare-alta-2/400/300",
      "https://picsum.photos/seed/mare-alta-3/400/300",
    ],
    tags: ["frutos do mar", "moqueca", "comida típica", "caipirinha"],
    businessHours: {
      ter: { open: "11:00", close: "23:00" },
      qua: { open: "11:00", close: "23:00" },
      qui: { open: "11:00", close: "23:00" },
      sex: { open: "11:00", close: "23:59" },
      sab: { open: "10:00", close: "23:59" },
      dom: { open: "10:00", close: "22:00" },
    },
  },

  // ── Praia dos Carneiros ────────────────────────────────────────────
  {
    name: "Quiosque Recanto do Sol",
    description:
      "Quiosque à beira-mar com bebidas, petiscos e cadeiras de sol. Ambiente tranquilo ideal para curtir o pôr do sol dos Carneiros.",
    category: "quiosque",
    phone: "(81) 99999-0006",
    whatsapp: null,
    latitude: -8.6958,
    longitude: -35.0983,
    beach: "Praia dos Carneiros",
    coverImage: null,
    gallery: [],
    tags: ["petiscos", "bebidas", "pôr do sol", "tranquilo"],
    businessHours: {
      sex: { open: "08:00", close: "17:00" },
      sab: { open: "07:00", close: "18:00" },
      dom: { open: "07:00", close: "18:00" },
    },
  },
  {
    name: "Barraca da Dona Rosa",
    description:
      "A mais querida barraca de Praia dos Carneiros. Tapioca recheada, caldo de cana e lanches naturais. Atendimento com sorriso genuíno.",
    category: "barraqueiro",
    phone: null,
    whatsapp: "(81) 99999-0007",
    latitude: -8.6983,
    longitude: -35.0957,
    beach: "Praia dos Carneiros",
    coverImage: "https://picsum.photos/seed/dona-rosa/400/300",
    gallery: [],
    tags: ["tapioca", "caldo de cana", "lanche natural", "família"],
    businessHours: {
      sab: { open: "06:00", close: "16:00" },
      dom: { open: "06:00", close: "16:00" },
    },
  },

  // ── Boa Viagem ─────────────────────────────────────────────────────
  {
    name: "Loja do Turista",
    description:
      "Loja de conveniência e souvenires na orla de Boa Viagem. Bebidas, lanches, protetor solar, chinelos e artigos de praia. Aberto todos os dias.",
    category: "loja",
    phone: "(81) 99999-0008",
    whatsapp: "(81) 99999-0008",
    latitude: -8.1207,
    longitude: -34.8989,
    beach: "Boa Viagem",
    coverImage: "https://picsum.photos/seed/loja-turista/400/300",
    gallery: [
      "https://picsum.photos/seed/loja-turista-1/400/300",
    ],
    tags: ["souvenires", "conveniência", "protetor solar", "artigos de praia"],
    businessHours: {
      seg: { open: "07:00", close: "21:00" },
      ter: { open: "07:00", close: "21:00" },
      qua: { open: "07:00", close: "21:00" },
      qui: { open: "07:00", close: "21:00" },
      sex: { open: "07:00", close: "22:00" },
      sab: { open: "07:00", close: "22:00" },
      dom: { open: "08:00", close: "20:00" },
    },
  },
  {
    name: "Ambulante do Chico",
    description:
      "Vendedor ambulante de óculos de sol, chapéus, cangas e bijuterias. Preços justos e variedade para todos os gostos na orla de Boa Viagem.",
    category: "ambulante",
    phone: null,
    whatsapp: null,
    latitude: -8.1245,
    longitude: -34.8953,
    beach: "Boa Viagem",
    coverImage: null,
    gallery: [],
    tags: ["óculos", "chapéus", "cangas", "bijuterias"],
    businessHours: {
      sab: { open: "08:00", close: "17:00" },
      dom: { open: "08:00", close: "17:00" },
    },
  },
  {
    name: "Bar Beira Mar",
    description:
      "Bar na orla de Boa Viagem com música ao vivo nos finais de semana. Porções generosas, chope gelado e vista privilegiada do mar.",
    category: "bar e restaurante",
    phone: "(81) 99999-0009",
    whatsapp: "(81) 99999-0009",
    latitude: -8.1183,
    longitude: -34.9012,
    beach: "Boa Viagem",
    coverImage: "https://picsum.photos/seed/beira-mar/400/300",
    gallery: [
      "https://picsum.photos/seed/beira-mar-1/400/300",
      "https://picsum.photos/seed/beira-mar-2/400/300",
    ],
    tags: ["música ao vivo", "porções", "chope", "orla"],
    businessHours: {
      seg: { open: "16:00", close: "23:59" },
      ter: { open: "16:00", close: "23:59" },
      qua: { open: "16:00", close: "23:59" },
      qui: { open: "16:00", close: "23:59" },
      sex: { open: "16:00", close: "02:00" },
      sab: { open: "11:00", close: "02:00" },
      dom: { open: "11:00", close: "22:00" },
    },
  },
];

async function main(): Promise<void> {
  console.log("🌱 Seeding catalog database...");

  // Upsert each establishment so the seed is idempotent
  for (const est of establishments) {
    const existing = await prisma.workerProfile.findFirst({
      where: { name: est.name, beach: est.beach },
    });

    if (existing) {
      console.log(`  ⏭  Skipping "${est.name}" (already exists)`);
      continue;
    }

    await prisma.workerProfile.create({
      data: {
        ownerUserId: OWNER_USER_ID,
        name: est.name,
        description: est.description,
        category: est.category,
        phone: est.phone,
        whatsapp: est.whatsapp,
        latitude: est.latitude,
        longitude: est.longitude,
        beach: est.beach,
        status: "APPROVED",
        coverImage: est.coverImage,
        gallery: est.gallery,
        tags: est.tags,
        businessHours: est.businessHours,
      },
    });

    console.log(`  ✅ Created "${est.name}" (${est.category} @ ${est.beach})`);
  }

  const total = await prisma.workerProfile.count();
  console.log(`\n📊 Total worker profiles in database: ${total}`);
  console.log("🌱 Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
