import { AuthTest } from "./test.util";
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
