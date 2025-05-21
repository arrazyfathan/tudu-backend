import { AuthTest, CategoryTest } from "./test.util";
import supertest from "supertest";
import { app } from "../src/app";
import logger from "../src/utils/logger";

describe("GET api/categories", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
  });

  afterEach(async () => {
    await AuthTest.delete();
  });

  it("should show all categories", async () => {
    const response = await supertest(app)
      .get("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`);

    logger.info(response.body);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should reject when token is invalid", async () => {
    const response = await supertest(app)
      .get("/api/categories")
      .set("Authorization", `Bearer invalid}`);

    logger.info(response.body);

    expect(response.statusCode).toBe(401);
  });
});

describe("POST api/categories", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
    await CategoryTest.create();
  });

  afterEach(async () => {
    await CategoryTest.delete();
    await AuthTest.delete();
  });

  it("should create a new category", async () => {
    const response = await supertest(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "test category",
      });

    logger.info(response.body);
  });

  it("should reject add category when category is exist", async () => {
    const response = await supertest(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "test",
      });

    logger.info(response.body);

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe("Category already exists");
  });

  it("should reject add category when name blank", async () => {
    const response = await supertest(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "",
      });

    logger.info(response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body.errors.name).toBe("String must contain at least 1 character(s)");
  });

  it("should reject add category when name null", async () => {
    const response = await supertest(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    logger.info(response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body.errors.name).toBe("Required");
  });
});
