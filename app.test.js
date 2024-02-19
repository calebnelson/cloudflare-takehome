import request from "supertest";
import app from "./app";
import externalNotifier from "./externalNotifier";
import Customer from "./models/Customer";
import Certificate from "./models/Certificate";

spy = jest.spyOn(externalNotifier, "notify");

describe("API endpoints", () => {
  beforeAll(async () => {
    await Customer.sync({ force: true });
    await Certificate.sync({ force: true });
    await Customer.destroy({ where: {} });
    await Certificate.destroy({ where: {} });
  });

  it("should return 200 OK for the root endpoint", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });

  it("should be able to create a new customer", async () => {
    const response = await request(app).post("/customer/create").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "password",
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });
    
  it("should get a customer by ID", async () => {
    const customer = await Customer.create({
      name: "Joe Doe",
      email: "joedoe@example.com",
      password: "password",
    });

    const response = await request(app).get(`/customer/${customer.dataValues.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", customer.dataValues.id);
  });

  it("should be able to delete a customer", async () => {
    const customer = await Customer.create({
      name: "Jane Doe",
      email: "janedoe@example.com",
      password: "password",
    });

    const response = await request(app).post(`/customer/${customer.dataValues.id}/delete`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Customer deleted"
    );

    const getResponse = await request(app).get(`/customer/${customer.dataValues.id}`);
    expect(getResponse.status).toBe(404);
    expect(getResponse.body).toHaveProperty("error", "Customer not found");
  });

  it("should be able to create a certificate for a customer", async () => {
    const customer = await Customer.create({
      name: "Jake Doe",
      email: "jakedoe@example.com",
      password: "password",
    });

    const response = await request(app).post("/certificate/create").send({
      customerId: customer.dataValues.id,
      isActive: true,
      privateKey: "privateKeyJake",
      certBody: "certBody",
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to create a certificate for a non-existent customer", async () => {
    const response = await request(app).post("/certificate/create").send({
      customerId: 0,
      isActive: true,
      privateKey: "privateKey",
      certBody: "certBody",
    });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Customer not found");
  });

  it("should be able to get a certificate by ID", async () => {
    const customer = await Customer.create({
      name: "Jacob Doe",
      email: "jacobdoe@example.com",
      password: "password",
    });

    const certificate = await customer.createCertificate({
      customerId: customer.dataValues.id,
      isActive: true,
      privateKey: "privateKeyJacob",
      certBody: "certBody",
    });

    const response = await request(app).get(`/certificate/${certificate.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", certificate.id);
  });

  it("should be able to get certificates for a customer", async () => {
    const customer = await Customer.create({
      name: "Jen Doe",
      email: "jendoe@example.com",
      password: "password",
    });

    const certificate = await customer.createCertificate({
      customerId: customer.dataValues.id,
      isActive: true,
      privateKey: "privateKeyJen",
      certBody: "certBody",
    });

    let resJson = certificate.toJSON();
    resJson.createdAt = resJson.createdAt.toISOString();
    resJson.updatedAt = resJson.updatedAt.toISOString();
    
    const response = await request(app).get(`/customer/${customer.dataValues.id}/certificates`);
    expect(response.status).toBe(200);
    expect(response).toHaveProperty("body", [resJson]);
  });

  it("should be able to activate a certificate", async () => {
    const customer = await Customer.create({
      name: "Jason Doe",
      email: "jasondoe@example.com",
      password: "password",
    });

    const certificate = await customer.createCertificate({
      customerId: customer.dataValues.id,
      isActive: false,
      privateKey: "privateKeyJason",
      certBody: "certBody",
    });

    const response = await request(app).post(`/certificate/${certificate.id}/activate`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Certificate activated"
    );
    expect(spy).toHaveBeenCalled();
  });

  it("should be able to deactivate a certificate", async () => {
    const customer = await Customer.create({
      name: "Dason Joe",
      email: "dasonjoe@example.com",
      password: "password",
    });

    const certificate = await customer.createCertificate({
      customerId: customer.dataValues.id,
      isActive: true,
      privateKey: "privateKeyDason",
      certBody: "certBody",
    });

    const response = await request(app).post(`/certificate/${certificate.id}/deactivate`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Certificate deactivated"
    );
    expect(spy).toHaveBeenCalled();
  });

  it("should delete all certificates for a customer when a customer is deleted", async () => {
    const customer = await Customer.create({
      name: "Jackson Doe",
      email: "jacksondoe@example.com",
      password: "password",
    });

    const certificate = await customer.createCertificate({
      customerId: customer.dataValues.id,
      isActive: true,
      privateKey: "privateKeyJackson",
      certBody: "certBody",
    });

    const response = await request(app)
      .post(`/customer/${customer.dataValues.id}/delete`)
      .send({ id: customer.dataValues.id });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Customer deleted");

    const certificatesResponse = await request(app).get(
      `/certificate/${certificate.id}`
    );
    expect(certificatesResponse.status).toBe(404);
    expect(certificatesResponse.body).toHaveProperty(
      "error",
      "Certificate not found"
    );
  });
});
