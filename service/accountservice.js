import { prisma } from "../lib/prisma.js";
import logger from "../utils/logger.js";

const determineMemberShipID = (userClub) => {
  if (userClub == "l'ordre des champions") return 1;
  if (userClub == "la société privée") return 2;
  if (userClub == "le cercle d'or") return 3;
  return null;
};

const createAccount = async (
  name,
  surname,
  email,
  zipCode,
  phoneNumber,
  userClub,
  next,
) => {
  try {
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
        name: name,
        surname: surname,
        email: email,
        zipCode: zipCode,
        phoneNumber: phoneNumber,
        currentMembershipId: membershipId,
        membershipStatus: "active",
        membershipStartDate: membershipStartDate,
        membershipEndDate: membershipEndDate,
        nextBillingDate: nextBillingDate,
      },
      include: {
        currentMembership: true,
      },
    });

    logger.info(`User created successfully: ${email}`);
    return user;
  } catch (error) {
    logger.error("Failure to add the user to the database ", error);
    next(error);
  }
};

export default createAccount;
