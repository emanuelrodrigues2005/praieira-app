const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5432/db_catalog?schema=public' } }
});
p.$connect()
  .then(() => { console.log('OK'); return p.$disconnect(); })
  .catch(e => { console.error(e.message); process.exit(1); });
