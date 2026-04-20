import { prisma } from "../lib/prisma.js";

import logger from "../utils/logger.js";

export default async function seedMemberships() {
  try {
    const count = await prisma.membership.count();

    if (count === 0) {
      await prisma.membership.createMany({
        data: [
          {
            title: "Signature Experience",
            clubName: "L'Ordre des Champions",
            price: 79.99,
            currency: "USD",
          },
          {
            title: "Elite Member Benefits",
            clubName: "La Société Privée",
            price: 99.99,
            currency: "USD",
          },
          {
            title: "Premium Club Access",
            clubName: "Le Cercle d'Or",
            price: 129.99,
            currency: "USD",
          },
        ],
      });
      logger.info("Memberships seeded");
    }
  } catch (error) {
    logger.error("Failed to seed memberships:", error);
  }
}
