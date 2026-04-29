import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import logger from "../utils/logger.js";
import { changeClubName } from "../controller/clubNameController.js";

const determineMemberShipID = (membershipTitle) => {
  const membershipMap = {
    "l'ordre des champions": 1,
    "la société privée": 2,
    "le cercle d'or": 3,
  };
  return membershipMap[membershipTitle] || null;
};

const userModel = {
  createAccount: async (
    name,
    surname,
    email,
    zipCode,
    phoneNumber,
    clubName,
    membershipTitle,
  ) => {
    const membershipStartDate = new Date();
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);
    const membershipEndDate = new Date(nextBillingDate);

    const membershipId = determineMemberShipID(membershipTitle);

    if (!membershipId) {
      throw new Error(`Invalid membershipTitle: ${membershipTitle}`);
    }

    const user = await prisma.user.create({
      data: {
        name,
        surname,
        email,
        zipCode,
        phoneNumber,
        clubName,
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
  addRefreshToken: async (token, userId, expiresAt) => {
    return await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  },
  addPasswordResetToken: async (token, userId, expiresAt) => {
    return await prisma.passwordResetToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  },
  addSetPasswordToken: async (token, userId) => {
    return await prisma.setPasswordToken.create({
      data: {
        token,
        userId,
      },
    });
  },

  findByEmail: async (email, includeMembership = false) => {
    return await prisma.user.findUnique({
      where: { email },
      ...(includeMembership && { include: { currentMembership: true } }),
    });
  },
  findByToken: async (token) => {
    return await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            currentMembership: true,
          },
        },
      },
    });
  },
  findValidPasswordResetToken: async (token) => {
    return await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });
  },
  findValidSetPasswordToken: async (token) => {
    return await prisma.setPasswordToken.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });
  },
  updateMembershipStatus: async (
    email,
    membershipStatus,
    nextBillingDate,
    cancellationDate,
  ) => {
    return await prisma.user.update({
      where: { email },
      data: {
        membershipStatus,
        nextBillingDate,
        cancellationDate,
      },
      include: { currentMembership: true },
    });
  },
  updatePassword: async (email, hashedPassword) => {
    return await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  },
  changeMembership: async (email, nextBillingDate, membershipTitle) => {
    const membershipId = determineMemberShipID(membershipTitle);
    return await prisma.user.update({
      where: { email },
      data: {
        membershipStatus: "Active",
        cancellationDate: null,
        nextBillingDate,
        currentMembershipId: membershipId,
      },
      include: {
        currentMembership: true,
      },
    });
  },
  changeClubName: async (email, clubName) => {
    return await prisma.user.update({
      where: { email },
      data: {
        clubName,
      },
    });
  },

  deleteRefreshToken: async (token) => {
    return await prisma.refreshToken.delete({
      where: { token },
    });
  },
  deletePasswordResetToken: async (token) => {
    return await prisma.passwordResetToken.delete({
      where: { token },
    });
  },
  deleteSetPasswordToken: async (token) => {
    return await prisma.setPasswordToken.delete({
      where: { token },
    });
  },
  deleteAllPasswordResetToken: async (token) => {
    return await prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
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
