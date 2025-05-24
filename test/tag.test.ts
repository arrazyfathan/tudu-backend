import { AuthTest, TagTest } from "./test.util";
import supertest from "supertest";
import { app } from "../src/app";

describe("GET /api/tags", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
  });

  afterEach(async () => {
    await AuthTest.delete();
  });

  it("should be able get tags", async () => {
    const response = await supertest(app)
      .get("/api/tags")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.status).toBe("success");
  });

  it("should reject get tags when token not valid", async () => {
    const response = await supertest(app).get("/api/tags").set("Authorization", `Bearer invalid`);

    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("error");
  });
});

describe("POST /api/tags", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
  });

  afterEach(async () => {
    await AuthTest.delete();
  });

  it("should be able create tags", async () => {
    const response = await supertest(app)
      .post("/api/tags")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "test",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.name).toBe("test");
    expect(response.body.status).toBe("success");
  });

  it("should reject add tag when tag is exist", async () => {
    const response = await supertest(app)
      .post("/api/tags")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "ideas",
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe("Tag already exists");
  });

  it("should reject add category when name is not valid", async () => {
    const response = await supertest(app)
      .post("/api/tags")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "test test",
      });

    expect(response.statusCode).toBe(400);
  });

  it("should reject add tag when name null", async () => {
    const response = await supertest(app)
      .post("/api/tags")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.errors.name).toBe("Required");
  });
});

describe("PATCH /api/tags/:tagId", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
    await TagTest.create();
  });

  afterEach(async () => {
    await TagTest.delete();
    await AuthTest.delete();
  });

  it("should be able to update the tag name", async () => {
    const currentTag = await TagTest.get();

    const response = await supertest(app)
      .patch(`/api/tags/${currentTag.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "updated",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.name).toBe("updated");
  });

  it("should reject update when id not valid", async () => {
    const response = await supertest(app)
      .patch(`/api/tags/invalid`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "updated",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Tag not found");
  });

  it("should reject update when name is not valid", async () => {
    const currentTag = await TagTest.get();

    const response = await supertest(app)
      .patch(`/api/tags/${currentTag.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "updated tag",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.errors.name).toBe("Tags cannot contain spaces");
  });
});

describe("DELETE /api/tags/:tagId", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
    await TagTest.create();
  });

  afterEach(async () => {
    await TagTest.delete();
    await AuthTest.delete();
  });

  it("should be able to delete tag", async () => {
    const currentTag = await TagTest.get();

    const response = await supertest(app)
      .delete(`/api/tags/${currentTag.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
  });

  it("should reject delete when tagId is invalid", async () => {
    const response = await supertest(app)
      .delete(`/api/tags/invalid`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Tag not found");
  });

  it("should reject delete when tag is globals", async () => {
    const currentTag = await TagTest.getGlobalsCategory();
    const response = await supertest(app)
      .delete(`/api/tags/${currentTag.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("You are not allowed to delete this tag.");
  });
});
