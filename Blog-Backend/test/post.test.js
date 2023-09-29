import request from "supertest";
import { expect } from "chai";
import dotenv from "dotenv";
import app from "../index.js";

dotenv.config();

before(function (done) {
    this.timeout(3000);
    setTimeout(done, 2000);
});

describe("Posts", () => {
    it("getLastTags success", (done) => {
        request(app)
            .get("/posts/tags")
            .expect(200)
            .then((res) => {
                done();
            })
            .catch((err) => done(err));
    });

    it("getAll success", (done) => {
        request(app)
            .get("/posts")
            .expect(200)
            .then((res) => {
                done();
            })
            .catch((err) => done(err));
    });

    it("getOne success", (done) => {
        request(app)
            .get("/posts/650e20a026237bc06031cb22")
            .expect(200)
            .then((res) => {
                done();
            })
            .catch((err) => done(err));
    });


    it("getOne failed (not found)", (done) => {
        request(app)
            .get("/posts/650e20a026237bc06031cb23")
            .expect(404)
            .then((res) => {
                expect(res.body.message).to.be.eql("Статья не найдена");
                done();
            })
            .catch((err) => done(err));
    });
});