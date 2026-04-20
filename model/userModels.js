import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import logger from "../utils/logger.js";

const determineMemberShipID = (userClub) => {
  const membershipMap = {
    "l'ordre des champions": 1,
    "la société privée": 2,
    "le cercle d'or": 3,
  };
  return membershipMap[userClub] || null;
};

const userModel = {
  createAccount: async (
    name,
    surname,
    email,
    zipCode,
    phoneNumber,
    userClub,
  ) => {
    const membershipStartDate = new Date();
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);
    const membershipEndDate = new Date(nextBillingDate);

    const membershipId = determineMemberShipID(userClub);

    if (!membershipId) {
      throw new Error(`Invalid userClub: ${userClub}`);
    }

    const user = await prisma.user.create({
      data: {
        name,
        surname,
        email,
        zipCode,
        phoneNumber,
        currentMembershipId: membershipId,
        membershipStatus: "active",
        membershipStartDate,
        membershipEndDate,
        nextBillingDate,
      },
      include: {
        currentMembership: true,
      },
    });

    logger.info(`User created successfully: ${email}`);
    return user;
  },

  findByEmail: async (email) => {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  updatePassword: async (email, hashedPassword) => {
    return await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  },

  validatePassword: async (inputPassword, storedPassword) => {
    return await bcrypt.compare(inputPassword, storedPassword);
  },

  hashPassword: async (inputPassword) => {
    return await bcrypt.hash(inputPassword, 10);
  },
};

export default userModel;
