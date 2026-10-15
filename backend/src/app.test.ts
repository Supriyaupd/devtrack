import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "./app.js";

describe("GET /api/health", () => {
  it("returns healthy status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.text).toBe("DevTrack API is healthy");
  });
});

describe("POST /api/auth/register", () => {
  it("registers a new user", async () => {
    const email = `test${Date.now()}@example.com`;

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email,
        password: "Test123",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toBe(email);
  });
});

describe("POST /api/auth/register validation", () => {
  it("returns 400 when required fields are missing", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "Test123",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Name, email and password are required"
    );
  });
});

describe("POST /api/auth/register duplicate email", () => {
  it("returns 400 when email already exists", async () => {
    const email = `duplicate${Date.now()}@example.com`;

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email,
        password: "Test123",
      });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email,
        password: "Test123",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email already exists");
  });
});


describe("POST /api/auth/login", () => {
  it("logs in a registered user", async () => {
    const email = `login${Date.now()}@example.com`;
    const password = "Test123";

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login Test User",
        email,
        password,
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password,
      });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(email);
    expect(response.body).toHaveProperty("token");
  });
});

describe("POST /api/auth/login validation", () => {
  it("returns 400 when required fields are missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Email and password are required"
    );
  });
});

describe("POST /api/auth/login invalid credentials", () => {
  it("returns 401 when password is incorrect", async () => {
    const email = `invalid${Date.now()}@example.com`;

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email,
        password: "Correct123",
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "Wrong123",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Invalid email or password"
    );
  });
});

describe("POST /api/auth/login unknown email", () => {
  it("returns 401 when email does not exist", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: `unknown${Date.now()}@example.com`,
        password: "Test123",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Invalid email or password"
    );
  });
});

describe("GET /api/applications authentication", () => {
  it("returns 401 when token is missing", async () => {
    const response = await request(app).get("/api/applications");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });
});

describe("GET /api/applications invalid token", () => {
  it("returns 401 when token is invalid", async () => {
    const response = await request(app)
      .get("/api/applications")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid or expired token");
  });
});


describe("GET /api/applications with valid token", () => {
  it("returns 200 when token is valid", async () => {
    const email = `valid${Date.now()}@example.com`;
    const password = "Test123";

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Valid Token User",
        email,
        password,
      });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    const response = await request(app)
      .get("/api/applications")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });
});


describe("POST /api/applications with valid token", () => {
  it("creates an application for the authenticated user", async () => {
    const email = `application${Date.now()}@example.com`;
    const password = "Test123";

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Application Test User",
        email,
        password,
      });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    const response = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({
        company: "Google",
        position: "Software Engineer",
        status: "applied",
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.company).toBe("Google");
  });
});


describe("POST /api/applications authentication", () => {
  it("returns 401 when token is missing", async () => {
    const response = await request(app)
      .post("/api/applications")
      .send({
        company: "Google",
        position: "Software Engineer",
        status: "applied",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });
});


describe("POST /api/applications authentication", () => {
  it("returns 401 when token is missing", async () => {
    const response = await request(app)
      .post("/api/applications")
      .send({
        company: "Google",
        position: "Software Engineer",
        status: "applied",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });
});


describe("Application user isolation", () => {
  it("does not return another user's applications", async () => {
    const userA = {
      name: "User A",
      email: `usera${Date.now()}@example.com`,
      password: "Test123",
    };

    const userB = {
      name: "User B",
      email: `userb${Date.now()}@example.com`,
      password: "Test123",
    };

    await request(app).post("/api/auth/register").send(userA);
    await request(app).post("/api/auth/register").send(userB);

    const loginA = await request(app)
      .post("/api/auth/login")
      .send({ email: userA.email, password: userA.password });

    const loginB = await request(app)
      .post("/api/auth/login")
      .send({ email: userB.email, password: userB.password });

    await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${loginA.body.token}`)
      .send({
        company: "Google",
        position: "Software Engineer",
        status: "applied",
      });

    const response = await request(app)
      .get("/api/applications")
      .set("Authorization", `Bearer ${loginB.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });
});

