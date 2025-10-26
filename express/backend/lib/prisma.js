const { PrismaClient } = require("@prisma/client");

// Ensure only one PrismaClient instance exists across the application
// This prevents prepared statement conflicts in PostgreSQL
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // In development, reuse the Prisma Client to avoid instantiating too many instances
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;
