import { AuthTest, CategoryTest } from "./test.util";
import supertest from "supertest";
import { app } from "../src/app";

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

    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should reject when token is invalid", async () => {
    const response = await supertest(app)
      .get("/api/categories")
      .set("Authorization", `Bearer invalid}`);

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
  });

  it("should reject create category when no token provided", async () => {
    const response = await supertest(app).post("/api/categories").send({
      name: "Unauthorized category",
    });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Missing or invalid authorization token");
  });

  it("should reject add category when category is exist", async () => {
    const response = await supertest(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "test",
      });

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

    expect(response.statusCode).toBe(400);
    expect(response.body.errors.name).toBe("String must contain at least 1 character(s)");
  });

  it("should reject add category when name null", async () => {
    const response = await supertest(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.errors.name).toBe("Required");
  });
});

describe("PATCH /api/categories/:categoryId", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
    await CategoryTest.create();
  });

  afterEach(async () => {
    await CategoryTest.delete();
    await AuthTest.delete();
  });

  it("should be able to update the category name", async () => {
    const currentCategory = await CategoryTest.get();

    const response = await supertest(app)
      .patch(`/api/categories/${currentCategory.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "updated category",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.name).toBe("Updated category");
  });

  it("should reject update when id not valid", async () => {
    const response = await supertest(app)
      .patch(`/api/categories/invalid`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "updated category",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Category not found");
  });

  it("should reject update when name is not valid", async () => {
    const currentCategory = await CategoryTest.get();

    const response = await supertest(app)
      .patch(`/api/categories/${currentCategory.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.errors.name).toBe("String must contain at least 1 character(s)");
  });

  it("should reject update when trying to modify global category", async () => {
    const globalCategory = await CategoryTest.getGlobalsCategory();
    const response = await supertest(app)
      .patch(`/api/categories/${globalCategory.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "new name",
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("You are not allowed to update this category.");
  });
});

describe("DELETE /api/categories/:categoryId", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
    await CategoryTest.create();
  });

  afterEach(async () => {
    await CategoryTest.delete();
    await AuthTest.delete();
  });

  it("should be able to delete category", async () => {
    const currentCategory = await CategoryTest.get();

    const response = await supertest(app)
      .delete(`/api/categories/${currentCategory.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
  });

  it("should reject delete when categoryId is invalid", async () => {
    const response = await supertest(app)
      .delete(`/api/categories/invalid`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Category not found");
  });

  it("should reject delete when category is globals", async () => {
    const currentCategory = await CategoryTest.getGlobalsCategory();
    const response = await supertest(app)
      .delete(`/api/categories/${currentCategory.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("You are not allowed to delete this category.");
  });
});
