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
    await JournalTest.delete();
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

describe("DELETE /api/journal/:journalId", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
  });

  it("should reject update journal when not authorized", async () => {
    const journal = await JournalTest.create();

    const response = await supertest(app)
      .put(`/api/journals/${journal.id}`)
      .set("Authorization", `Bearer invalid-token`)
      .send({
        title: "Unauthorized Update",
        content: "Trying to update without proper token",
        date: "2025-05-28T08:00:00.000Z",
        categoryId: journal.categoryId,
        tagIds: ["ab49ac8c-385e-4579-b675-0245d7a9a151"],
      });

    expect(response.statusCode).toBe(401);
  });

  afterEach(async () => {
    await AuthTest.delete();
    await JournalTest.delete();
  });

  it("should be able to delete journal", async () => {
    const journal = await JournalTest.create();
    const journalId = journal.id;

    const response = await supertest(app)
      .delete(`/api/journals/${journalId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Journal deleted successfully");
  });

  it("should reject delete journal when journalId not found", async () => {
    const response = await supertest(app)
      .delete(`/api/journals/not_found_id`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Journal not found");
  });
});

describe("UPDATE /api/journals:journalId", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
  });

  afterEach(async () => {
    await AuthTest.delete();
    await JournalTest.delete();
  });

  it("should be able to update the journal", async () => {
    const journal = await JournalTest.create();

    const response = await supertest(app)
      .put(`/api/journals/${journal.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "My Journal on 28 May",
        content: "Updated Journal 28 May Hehehe",
        date: "2025-05-28T08:00:00.000Z",
        categoryId: "2a6c6c4e-3afc-43b0-b7f9-eb7fa405de58",
        tagIds: ["ab49ac8c-385e-4579-b675-0245d7a9a151"],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.title).toBe("My Journal on 28 May");
    expect(response.body.data.content).toBe("Updated Journal 28 May Hehehe");
    expect(response.body.data.date).toBe("2025-05-28T08:00:00.000Z");
    expect(response.body.data.category.id).toBe("2a6c6c4e-3afc-43b0-b7f9-eb7fa405de58");
    expect(response.body.data.tags).toHaveLength(1);
  });

  it("should reject update journal when journalId not found", async () => {
    const response = await supertest(app)
      .put(`/api/journals/notfound`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "My Journal on 28 May",
        content: "Updated Journal 28 May Hehehe",
        date: "2025-05-28T08:00:00.000Z",
        category: "2025-05-28T08:00:00.000Z",
        tagIds: ["ab49ac8c-385e-4579-b675-0245d7a9a151"],
      });

    expect(response.statusCode).toBe(404);
  });

  it("should reject update journal when tag is not found", async () => {
    const journal = await JournalTest.create();

    const response = await supertest(app)
      .put(`/api/journals/${journal.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "My Journal with Invalid Tag",
        content: "Trying to update with invalid tag",
        date: "2025-05-28T08:00:00.000Z",
        tagIds: ["non-existent-tag-id"],
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Tag not found");
  });

  it("should reject update journal when category is not found", async () => {
    const journal = await JournalTest.create();

    const response = await supertest(app)
      .put(`/api/journals/${journal.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "My Journal with Invalid Category",
        content: "Trying to update with invalid category",
        date: "2025-05-28T08:00:00.000Z",
        categoryId: "non-existent-category-id",
        tagIds: ["ab49ac8c-385e-4579-b675-0245d7a9a151"],
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Category not found");
  });

  it("should reject update journal when date format is invalid", async () => {
    const journal = await JournalTest.create();

    const response = await supertest(app)
      .put(`/api/journals/${journal.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Journal with Invalid Date",
        content: "Trying to update with invalid date",
        date: "invalid-date",
        categoryId: journal.categoryId,
        tagIds: ["ab49ac8c-385e-4579-b675-0245d7a9a151"],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid date format.");
  });
});

describe("MULTIPLE DELETE /api/journals/", () => {
  let accessToken: string | null = null;

  beforeEach(async () => {
    accessToken = await AuthTest.createAccessToken();
    await JournalTest.createMultipleJournal();
  });

  afterEach(async () => {
    await JournalTest.delete();
    await AuthTest.delete();
  });

  it("should be able to delete multiple journals", async () => {
    const journals = await JournalTest.getJournals();
    const wantToDelete = [journals[0].id, journals[1].id];

    const response = await supertest(app)
      .delete("/api/journals")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        ids: wantToDelete,
      });

    const journalAfterDeleted = await JournalTest.getJournals();

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Journal deleted successfully");
    wantToDelete.forEach((deletedId) => {
      expect(journalAfterDeleted.find((j) => j.id === deletedId)).toBeUndefined();
    });
  });

  it("should be able to delete when some journal IDs are invalid", async () => {
    const journals = await JournalTest.getJournals();
    const wantToDelete = [journals[0].id, "non-existent-id"];

    const response = await supertest(app)
      .delete("/api/journals")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        ids: wantToDelete,
      });

    const journalAfterDeleted = await JournalTest.getJournals();

    expect(response.statusCode).toBe(200);
    wantToDelete.forEach((deletedId) => {
      const journal = journalAfterDeleted.find((j) => j.id === deletedId);
      if (journal) {
        expect(journal.deletedAt).not.toBeNull();
      }
    });
  });

  it("should reject deletion when not authorized", async () => {
    const journals = await JournalTest.getJournals();
    const wantToDelete = [journals[0].id];

    const response = await supertest(app)
      .delete("/api/journals")
      .set("Authorization", `Bearer invalid`)
      .send({
        ids: wantToDelete,
      });

    expect(response.statusCode).toBe(401);
  });

  it("should reject deletion when no IDs are provided", async () => {
    const response = await supertest(app)
      .delete("/api/journals")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response.statusCode).toBe(400);
  });

  it("should reject deletion when body is not an array of ids", async () => {
    const response = await supertest(app)
      .delete("/api/journals")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        ids: "invalid-format",
      });

    expect(response.statusCode).toBe(400);
  });
});
