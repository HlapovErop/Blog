import request from "supertest";
import { expect } from "chai";
import dotenv from "dotenv";
import app from "../index.js";
import User from "../models/User.js";

dotenv.config();

const newUser = {
    email: '1a@gmail.com',
    fullName: 'privet ya test',
    password: 'password',
};

const UserAlreadyExists = {
    email: '1a@gmail.com',
    fullName: 'privet ya test',
    password: 'password',
};

const nonExistUser = {
    email: '100000a@gmail.com',
    fullName: 'privet ya test',
    password: 'password',
};

const wrongUser = {
    email: '1a@gmail.com',
    fullName: 'privet ya test',
    password: 'wrongPassword',
};

before(function (done) {
    this.timeout(3000);
    setTimeout(done, 2000);
});

describe("Login/Register", () => {
    before(async () => {
        await User.deleteMany({ fullName: newUser.fullName });
    });

    it("should register new user with valid credentials", (done) => {
        request(app)
            .post("/auth/register")
            .send(newUser)
            .expect(201)
            .then((res) => {
                expect(res.body.fullName).to.be.eql(newUser.fullName);
                done();
            })
            .catch((err) => done(err));
    });

    it("it should not be created, since there is such a user", (done) => {
        request(app)
            .post("/auth/register")
            .send(UserAlreadyExists)
            .expect(409)
            .then((res) => {
                expect(res.body.error).to.be.eql("Пользователь уже существует");
                done();
            })
            .catch((err) => done(err));
    });

    it("should not log in because user is non exist", (done) => {
        request(app)
            .post("/auth/login")
            .send(nonExistUser)
            .expect(404)
            .then((res) => {
                expect(res.body.error).to.be.eql("Пользователь не найден");
                done();
            })
            .catch((err) => done(err));
    });

    before(() => {
        request(app)
            .post("/auth/register")
            .send(newUser)
    });

    it("should not log in because the credentials is incorrect", (done) => {
        request(app)
            .post("/auth/login")
            .send(wrongUser)
            .expect(400)
            .then((res) => {
                expect(res.body.error).to.be.eql("Неверный логин или пароль");
                done();
            })
            .catch((err) => done(err));
    });

    it("should log in", (done) => {
        request(app)
            .post("/auth/login")
            .send(newUser)
            .expect(200)
            .then((res) => {
                done();
            })
            .catch((err) => done(err));
    });

    it("getMe failure - not auth", (done) => {
        request(app)
            .get("/auth/me")
            .expect(403)
            .then((res) => {
                expect(res.body.error).to.be.eql("Нет доступа");
                done();
            })
    });

    it("getMe failure - not found user", (done) => {
        request(app)
            .post("/auth/register")
            .send(newUser)
            .then((res) => {
                done()
                const userId = res._body?._id
                request(app)
                    .get("/auth/me")
                    .send({userId})
                    .expect(404)
                    .then((res) => {
                        expect(res.body.error).to.be.eql("Пользователь не найден");
                        done();
                    })
            })
    });

    it("getMe success", (done) => {
        request(app)
            .post("/auth/register")
            .send(newUser)
            .then((res) => {
                done()
                const userId = res._body?._id
                request(app)
                    .get("/auth/me")
                    .send({userId})
                    .expect(200)
                    .then((res) => {
                        done();
                    })
            })
    });

    it("delete user failure - not auth", (done) => {
        request(app)
            .post("/auth/register")
            .send(newUser)
            .then((res) => {
                request(app)
                    .delete("/user")
                    .expect(403)
                    .then((res) => {
                        expect(res.body.error).to.be.eql("Нет доступа");
                        done();
                    })
            })
    });

    it("delete user success", (done) => {
        request(app)
            .post("/auth/register")
            .send(newUser)
            .then((res) => {
                done()
                const userId = res._body?._id
                request(app)
                    .delete("/user")
                    .send({userId})
                    .expect(200)
                    .then((res) => {
                        done();
                    })
            })
    });

    it("delete user failure - non exist user", (done) => {
        request(app)
            .post("/auth/register")
            .send(newUser)
            .then((res) => {
                done()
                const userId = res._body?._id
                request(app)
                    .delete("/user")
                    .send({userId, email: 'non exist email'})
                    .expect(404)
                    .then((res) => {
                        expect(res.body.error).to.be.eql("Пользователь уже существует");
                        done();
                    })
            })
    });

    it("delete user failure - non valid password users", (done) => {
        request(app)
            .post("/auth/register")
            .send(newUser)
            .then((res) => {
                done()
                const userId = res._body?._id
                request(app)
                    .delete("/user")
                    .send({userId, email: newUser.email, password: 'non valid password'})
                    .expect(400)
                    .then((res) => {
                        expect(res.body.error).to.be.eql("Неверный пароль");
                        done();
                    })
            })
    });
});