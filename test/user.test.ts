import { AuthTest } from "./test.util";
import supertest from "supertest";
import { app } from "../src/app";

describe("GET /api/user", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
  });

  afterEach(async () => {
    await AuthTest.delete();
  });

  it("should get current user", async () => {
    const user = await supertest(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(user.body.data.name).toBe("test");
    expect(user.body.data.email).toBe("test");
    expect(user.body.data.username).toBe("test");
  });
});

describe("PATCH /api/user", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
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

    expect(response.body.errors.email).toBe("Invalid email");
  });

  it("should success update email", async () => {
    const response = await supertest(app)
      .patch("/api/user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        email: "testing@mail.com",
      });

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

    expect(response.statusCode).toBe(200);
  });
});

describe("DElETE /api/user", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
  });

  afterEach(async () => {
    await AuthTest.delete();
  });

  it("should reject delete user when access token is invalid", async () => {
    const response = await supertest(app).delete("/api/user").set("Authorization", `invalid`);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Missing or invalid authorization token");
  });

  it("should success deleted user", async () => {
    const response = await supertest(app)
      .delete("/api/user")
      .set("Authorization", `Bearer ${accessToken}`);

    const user = await AuthTest.get();
    const refreshTokens = await AuthTest.getRefreshToken();

    expect(response.statusCode).toBe(200);
    expect(user.deletedAt).not.toBeNull();
    expect(refreshTokens.length).toBe(0);
  });
});
