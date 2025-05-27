import { AuthTest, JournalTest } from "./test.util";
import supertest from "supertest";
import { app } from "../src/app";

describe("POST /api/journals/", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
  });

  afterEach(async () => {
    await AuthTest.delete();
  });

  it("should be able to add new journey", async () => {
    const response = await supertest(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Title Journal",
        content: "Content Journal",
        date: "2025-05-24T08:00:00.000Z",
        categoryId: "2a6c6c4e-3afc-43b0-b7f9-eb7fa405de58",
        tagIds: ["ab49ac8c-385e-4579-b675-0245d7a9a151", "37d2d127-6366-431f-9a17-2ef5890a761a"],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.title).toBe("Title Journal");
    expect(response.body.data.content).toBe("Content Journal");
    expect(response.body.data.date).toBe("2025-05-24T08:00:00.000Z");
    expect(response.body.data.category.id).toBe("2a6c6c4e-3afc-43b0-b7f9-eb7fa405de58");
    expect(response.body.data.tags).toHaveLength(2);
  });

  it("should reject add new journey when user not authorized", async () => {
    const response = await supertest(app)
      .post("/api/journals")
      .set("Authorization", `Bearer invalid`)
      .send({
        title: "Title Journal",
        content: "Content Journal",
        date: "2025-05-24T08:00:00.000Z",
        categoryId: "2a6c6c4e-3afc-43b0-b7f9-eb7fa405de58",
        tagIds: ["ab49ac8c-385e-4579-b675-0245d7a9a151", "37d2d127-6366-431f-9a17-2ef5890a761a"],
      });

    expect(response.statusCode).toBe(401);
  });

  it("should reject add new journey when date invalid", async () => {
    const response = await supertest(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Title Journal",
        content: "Content Journal",
        date: "invalid date",
        categoryId: "2a6c6c4e-3afc-43b0-b7f9-eb7fa405de58",
        tagIds: ["ab49ac8c-385e-4579-b675-0245d7a9a151", "37d2d127-6366-431f-9a17-2ef5890a761a"],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid date format.");
  });

  it("should reject add new journey when tag not found", async () => {
    const response = await supertest(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Title Journal",
        content: "Content Journal",
        date: "2025-05-24T08:00:00.000Z",
        categoryId: "2a6c6c4e-3afc-43b0-b7f9-eb7fa405de58",
        tagIds: ["ab49ac8c-385e-4579-b675-0245d7a9a151", "not-found-tags"],
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Tag not found");
  });

  it("should reject add new journey when category not found", async () => {
    const response = await supertest(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Title Journal",
        content: "Content Journal",
        date: "2025-05-24T08:00:00.000Z",
        categoryId: "not-found-category",
        tagIds: ["ab49ac8c-385e-4579-b675-0245d7a9a151"],
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Category not found");
  });
});

describe("GET /api/journals/", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
    await JournalTest.createMultipleJournal();
  });

  afterEach(async () => {
    await AuthTest.delete();
  });

  it("should be able to get all journals", async () => {
    const response = await supertest(app)
      .get("/api/journals")
      .query({
        page: 1,
        size: 10,
      })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.paging.current_page).toBe(1);
    expect(response.body.paging.total_page).toBe(1);
    expect(response.body.paging.total_items).toBe(5);
    expect(response.body.paging.size).toBe(10);
  });

  it("should be able to search journals", async () => {
    const response = await supertest(app)
      .get("/api/journals")
      .query({
        search: "(#1)",
        page: 1,
        size: 10,
      })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.paging.current_page).toBe(1);
    expect(response.body.paging.total_page).toBe(1);
    expect(response.body.paging.total_items).toBe(1);
    expect(response.body.paging.size).toBe(10);
  });

  it("should be able to show empty journals when search not found", async () => {
    const response = await supertest(app)
      .get("/api/journals")
      .query({
        search: "not found journals",
        page: 1,
        size: 10,
      })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(0);
    expect(response.body.paging.current_page).toBe(1);
    expect(response.body.paging.total_page).toBe(0);
    expect(response.body.paging.total_items).toBe(0);
    expect(response.body.paging.size).toBe(10);
  });
});
