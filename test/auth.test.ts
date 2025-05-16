import {UserTest} from "./test.util";
import {app} from "../src/app";
import supertest from "supertest";
import logger from "../src/utils/logger";

describe("POST /api/register", () => {

    afterEach(async () => {
        await UserTest.delete();
    })

    it("should reject register when user already registered", async () => {
        const response = await supertest(app)
            .post("/api/register")
            .send({
                username: "razy",
                password: "secret",
                name: "Ar Razy Fathan Rabbani",
                email: "razy@mail.com"
            });

        logger.info(response.body);
        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("User already exists");
    })

    it("should reject register when email already registered", async () => {
        const response = await supertest(app)
            .post("/api/register")
            .send({
                username: "fathan",
                password: "secret",
                name: "Ar Razy Fathan Rabbani",
                email: "razy@mail.com"
            });

        logger.info(response.body);
        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("Email is already taken");
    })

    it("should success register ", async () => {
        const response = await supertest(app)
            .post("/api/register")
            .send({
                username: "test",
                password: "secret",
                name: "Test",
                email: "test@mail.com"
            });

        logger.info(response.body);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("User registered successfully");
        expect(response.body.data).toBeDefined();
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe("Test");
        expect(response.body.data.username).toBe("test");
        expect(response.body.data.email).toBe("test@mail.com");
    })
})