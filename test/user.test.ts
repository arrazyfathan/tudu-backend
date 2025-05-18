import { AuthTest } from "./test.util";
import supertest from "supertest";
import { app } from "../src/app";
import logger from "../src/utils/logger";

describe("GET /api/user", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    await AuthTest.create();

    const login = await supertest(app).post("/api/auth/login").send({
      username: "test",
      password: "secret",
    });

    accessToken = login.body.data.token.access_token;
  });

  afterEach(async () => {
    await AuthTest.delete();
  });

  it("should get current user", async () => {
    const user = await supertest(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${accessToken}`);

    logger.info(user.body);
    expect(user.body.data.name).toBe("test");
    expect(user.body.data.email).toBe("test");
    expect(user.body.data.username).toBe("test");
  });
});

describe("PATCH /api/user", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    await AuthTest.create();

    const login = await supertest(app).post("/api/auth/login").send({
      username: "test",
      password: "secret",
    });

    accessToken = login.body.data.token.access_token;
  });

  afterEach(async () => {
    await AuthTest.delete();
  });

  it("should reject update email when email already taken", async () => {
    const response = await supertest(app)
      .patch("/api/user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        email: "razy@mail.com",
      });

    logger.info(response.body);
    expect(response.body.message).toBe("Email is already taken");
    expect(response.statusCode).toBe(409);
  });

  it("should reject update email when email invalid", async () => {
    const response = await supertest(app)
      .patch("/api/user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        email: "razy",
      });

    logger.info(response.body);
    expect(response.body.errors.email).toBe("Invalid email");
  });

  it("should success update email", async () => {
    const response = await supertest(app)
      .patch("/api/user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        email: "testing@mail.com",
      });

    logger.info(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.email).toBe("testing@mail.com");
  });

  it("should success update name", async () => {
    const response = await supertest(app)
      .patch("/api/user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "testing",
      });

    logger.info(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.name).toBe("testing");
  });

  it("should success update password", async () => {
    const response = await supertest(app)
      .patch("/api/user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        password: "testing",
      });

    logger.info(response.body);
    expect(response.statusCode).toBe(200);
  });
});
