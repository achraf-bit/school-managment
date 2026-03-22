import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { CreatePackInput, UpdatePackInput } from "@/validations/pack.schema";

export const packService = {
  async createPack(schoolId: string, data: CreatePackInput) {
    const classes = await prisma.class.findMany({
      where: { id: { in: data.classIds }, schoolId },
    });

    if (classes.length !== data.classIds.length) {
      throw new AppError("Some classes not found", 404, "CLASSES_NOT_FOUND");
    }

    return await prisma.$transaction(async (tx) => {
      const pack = await tx.pack.create({
        data: {
          schoolId,
          name: data.name,
          discountPercentage: data.discountPercentage,
          status: data.status || "active",
        },
      });

      await tx.packClass.createMany({
        data: data.classIds.map((classId) => ({
          schoolId,
          packId: pack.id,
          classId,
        })),
      });

      return pack;
    });
  },

  async updatePack(schoolId: string, packId: string, data: UpdatePackInput) {
    const pack = await prisma.pack.findFirst({
      where: { id: packId, schoolId },
    });

    if (!pack) {
      throw new AppError("Pack not found", 404, "PACK_NOT_FOUND");
    }

    return await prisma.$transaction(async (tx) => {
      const updatedPack = await tx.pack.update({
        where: { id: packId },
        data: {
          name: data.name,
          discountPercentage: data.discountPercentage,
          status: data.status,
        },
      });

      if (data.classIds) {
        await tx.packClass.deleteMany({
          where: { packId },
        });

        await tx.packClass.createMany({
          data: data.classIds.map((classId) => ({
            schoolId,
            packId,
            classId,
          })),
        });
      }

      return updatedPack;
    });
  },

  async getPack(schoolId: string, packId: string) {
    const pack = await prisma.pack.findFirst({
      where: { id: packId, schoolId },
      include: {
        packClasses: {
          include: { class: true },
        },
      },
    });

    if (!pack) {
      throw new AppError("Pack not found", 404, "PACK_NOT_FOUND");
    }

    return pack;
  },

  async listPacks(schoolId: string) {
    return await prisma.pack.findMany({
      where: { schoolId },
      include: {
        packClasses: {
          include: { class: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
