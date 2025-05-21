import { prismaClient } from "../src/config/database";
import logger from "../src/utils/logger";

async function main() {
  const categories = [
    { name: "Work" },
    { name: "Personal" },
    { name: "Finance" },
    { name: "Travel" },
    { name: "Health" },
  ];

  const tags = [
    { name: "urgent" },
    { name: "important" },
    { name: "ideas" },
    { name: "cooking" },
    { name: "shopping" },
    { name: "wishlist" },
  ];

  for (const category of categories) {
    const existingCategory = await prismaClient.category.findFirst({
      where: {
        name: category.name,
        userId: null,
      },
    });

    if (!existingCategory) {
      await prismaClient.category.create({
        data: {
          name: category.name,
          userId: null,
        },
      });
    }
  }

  for (const tag of tags) {
    const existingTag = await prismaClient.tag.findFirst({
      where: {
        name: tag.name,
        userId: null,
      },
    });

    if (!existingTag) {
      await prismaClient.tag.create({
        data: {
          name: tag.name,
          userId: null,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch((e) => {
    logger.error("Seeding failed", e);
    process.exit(1);
  });
