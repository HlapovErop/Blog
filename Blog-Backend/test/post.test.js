import request from "supertest";
import { expect } from "chai";
import dotenv from "dotenv";
import app from "../index.js";
import User from "../models/User.js";

dotenv.config();

const newPost = {
    title: 'this is a new post title',
    text: 'this is a new post content',
}

const updatePost = {
    title: 'this is a new post title UPDATE',
    text: 'this is a new post content UPDATE',
}

const userForTestingPosts = {
    email: 'test1posts@gmail.com',
    fullName: 'privet ya test for posts',
    password: 'password',
};


before(function (done) {
    this.timeout(3000);
    setTimeout(done, 2000);
});

describe("Posts", () => {
    before(async () => {
        await User.deleteMany({ fullName: userForTestingPosts.fullName });
    });

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


    it("getOne failed - not found post", (done) => {
        request(app)
            .get("/posts/650e20a026237bc06031cb23")
            .expect(404)
            .then((res) => {
                expect(res.body.error).to.be.eql("Статья не найдена");
                done();
            })
            .catch((err) => done(err));
    });

    before(() => {
        request(app)
            .post("/auth/register")
            .send(userForTestingPosts)
            .then((res) => {
                console.log(res)
            })
    });

    it("create post success", (done) => {
        request(app)
            .post("/auth/register")
            .send(userForTestingPosts)
            .then((res) => {
                done()
                const userId = res._body?._id
                request(app)
                    .post("/posts")
                    .send({...newPost, userId})
                    .expect(201)
                    .then((res) => {
                        done();
                    })
            })
            .catch((err) => done(err));
    });

    it("create post failure - non exist userId", (done) => {
        const nonExistUserId = 24235423532
        request(app)
            .post("/posts")
            .send({...newPost, userId: nonExistUserId})
            .expect(403)
            .then((res) => {
                expect(res.body.error).to.be.eql("Нет доступа");
                done();
            })
            .catch((err) => done(err));
    });

    it("delete post success", (done) => {
        request(app)
            .post("/auth/register")
            .send(userForTestingPosts)
            .then((res) => {
                const userId = res._body?._id

                request(app)
                    .post("/posts")
                    .send({...newPost, userId})
                    .then((res) => {
                        const postId = res._body?._id
                        done();
                        request(app)
                            .delete(`/posts/${postId}`)
                            .then((res) => {
                                expect(res.body.success).to.be.eql(true);
                                done();
                            })
                    })
            })
            .catch((err) => done(err));
    });


    it("delete post failure - non exist postId", (done) => {
        const nonExistPostId = 324324532453245
        request(app)
            .post("/auth/register")
            .send(userForTestingPosts)
            .then((res) => {
                done()
                const userId = res._body?._id
                request(app)
                    .delete(`/posts/${nonExistPostId}`)
                    .send({userId})
                    .expect(404)
                    .then((res) => {
                        expect(res.body.error).to.be.eql('Статья не найдена');
                        done();
                    })
            })
            .catch((err) => done(err));
    });

    it("update post success", (done) => {
        request(app)
            .post("/auth/register")
            .send(userForTestingPosts)
            .then((res) => {
                const userId = res._body?._id

                request(app)
                    .post("/posts")
                    .send({...newPost, userId})
                    .then((res) => {
                        const postId = res._body?._id

                        done();
                        request(app)
                            .update(`/posts/${postId}`)
                            .send({
                                title: updatePost.title,
                                text: updatePost.text,
                            })
                            .then((res) => {
                                expect(res.body.success).to.be.eql(true);
                                done();
                            })
                    })
            })
            .catch((err) => done(err));
    });

    it("update post failure - not auth", (done) => {
        request(app)
            .post("/auth/register")
            .send(userForTestingPosts)
            .then((res) => {
                const userId = res._body?._id

                request(app)
                    .post("/posts")
                    .send({...newPost, userId})
                    .then((res) => {
                        const postId = res._body?._id

                        done();
                        request(app)
                            .update(`/posts/${postId}`)
                            .send({
                                title: updatePost.title,
                                text: updatePost.text,
                            })
                            .expect(403)
                            .then((res) => {
                                expect(res.body.error).to.be.eql("Нет доступа");
                                done();
                            })
                    })
            })
            .catch((err) => done(err));
    });
});