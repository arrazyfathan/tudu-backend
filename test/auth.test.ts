import { AuthTest } from "./test.util";
import { app } from "../src/app";
import supertest from "supertest";
import logger from "../src/utils/logger";

describe("POST /api/auth/register", () => {
  afterEach(async () => {
    await AuthTest.delete();
  });

  it("should reject register when user already registered", async () => {
    const response = await supertest(app).post("/api/auth/register").send({
      username: "razy",
      password: "secret",
      name: "Ar Razy Fathan Rabbani",
      email: "razy@mail.com",
    });

    logger.info(response.body);
    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe("User already exists");
  });

  it("should reject register when email already registered", async () => {
    const response = await supertest(app).post("/api/auth/register").send({
      username: "fathan",
      password: "secret",
      name: "Ar Razy Fathan Rabbani",
      email: "razy@mail.com",
    });

    logger.info(response.body);
    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe("Email is already taken");
  });

  it("should success register ", async () => {
    const response = await supertest(app).post("/api/auth/register").send({
      username: "test",
      password: "secret",
      name: "Test",
      email: "test@mail.com",
    });

    logger.info(response.body);
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User registered successfully");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.name).toBe("Test");
    expect(response.body.data.username).toBe("test");
    expect(response.body.data.email).toBe("test@mail.com");
  });
});

describe("POST /api/auth/login", () => {
  it("should reject login when username or password invalid", async () => {
    const response = await supertest(app).post("/api/auth/login").send({
      username: "",
      password: "",
    });

    logger.info(response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.message).toBe("Validation failed");
  });

  it("should can login and generate token", async () => {
    const response = await supertest(app).post("/api/auth/login").send({
      username: "razy",
      password: "secret",
    });

    logger.info(response.body);
  });
});

describe("POST /api/auth/refresh_token", () => {
  it("should reject generate refresh token if refresh token blank", async () => {
    const response = await supertest(app).post("/api/auth/refresh_token").send({
      refresh_token: null,
    });

    logger.info(response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Refresh token is required!");
  });

  it("should reject generate refresh token if refresh token invalid", async () => {
    const response = await supertest(app).post("/api/auth/refresh_token").send({
      refresh_token: "invalid",
    });

    logger.info(response.body);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });

  it("should success refresh token", async () => {
    const responseLogin = await supertest(app).post("/api/auth/login").send({
      username: "razy",
      password: "rahasia",
    });

    const response = await supertest(app).post("/api/auth/refresh_token").send({
      refresh_token: responseLogin.body.data.token.refresh_token,
    });

    logger.info(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Refresh token successfully");
  });
});

describe("POST /api/auth/logout", () => {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  beforeEach(async () => {
    await AuthTest.create();

    const login = await supertest(app).post("/api/auth/login").send({
      username: "test",
      password: "secret",
    });

    accessToken = login.body.data.token.access_token;
    refreshToken = login.body.data.token.refresh_token;
  });

  afterEach(async () => {
    await AuthTest.delete();
  });

  it("should reject logout when access token invalid", async () => {
    const logout = await supertest(app)
      .post("/api/auth/logout")
      .set("Authorization", `invalid`)
      .send({
        refresh_token: refreshToken,
      });

    logger.info(logout.body);

    expect(logout.body.message).toBe("Missing or invalid authorization token");
    expect(logout.statusCode).toBe(403);
  });

  it("should reject logout when access token is missing", async () => {
    const logout = await supertest(app)
      .post("/api/auth/logout")
      .send({ refresh_token: refreshToken });

    logger.info(logout.body);
    expect(logout.statusCode).toBe(403);
    expect(logout.body.message).toBe("Missing or invalid authorization token");
  });

  it("should reject logout when refresh token is missing", async () => {
    const logout = await supertest(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    logger.info(logout.body);
    expect(logout.statusCode).toBe(400);
    expect(logout.body.message).toBe("Refresh token is required!");
  });

  it("should reject logout when refresh token is invalid", async () => {
    const logout = await supertest(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refresh_token: "invalid" });

    logger.info(logout.body);
    expect(logout.statusCode).toBe(404);
    expect(logout.body.message).toBe("Session not found!");
  });

  it("should logout successfully", async () => {
    const logout = await supertest(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refresh_token: refreshToken });

    logger.info(logout.body);
    expect(logout.statusCode).toBe(200);
    expect(logout.body.message).toBe("Logout successfully");
  });
});
