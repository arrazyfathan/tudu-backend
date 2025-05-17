import {AuthTest} from "./test.util";
import supertest from "supertest";
import {app} from "../src/app";
import logger from "../src/utils/logger";

describe("GET /api/user", () => {

    let accessToken: string | null = null;

    beforeEach(async () => {
        await AuthTest.create();

        const login = await supertest(app)
            .post("/api/auth/login")
            .send({
                username: "test",
                password: "secret",
            });

        accessToken = login.body.data.token.access_token;
    });

    afterEach(async () => {
        await AuthTest.delete()
    })

    it('should get current user', async () => {
        const user = await supertest(app)
            .get("/api/user")
            .set("Authorization", `Bearer ${accessToken}`);

        logger.info(user.body);
        expect(user.body.data.name).toBe("test");
        expect(user.body.data.email).toBe("test");
        expect(user.body.data.username).toBe("test");
    });
})