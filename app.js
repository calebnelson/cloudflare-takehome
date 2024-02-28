import express from "express";
import bcrypt from "bcrypt";
import { Sequelize } from "sequelize";

import Customer from "./models/Customer.js";
import Certificate from "./models/Certificate.js";
import Surl from "./models/Surl.js";
import Accession from "./models/Accession.js";
import externalNotifier from "./externalNotifier.js";
import {
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_HOST,
} from "./config.js";

const app = express();

app.use(express.json());

const sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  {
    host: DATABASE_HOST,
    dialect: "postgres",
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .then(() => {
    sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/customer/create", async (req, res) => {
  try {
    let { name, email, password } = req.body;
    password = await bcrypt.hash(password, 10);
    const [newCustomer, created] = await Customer.findOrCreate({
      where: { email },
      defaults: { name, email, password },
    });
    if (!created) {
      res.status(409).json({ error: "Customer already exists for this email" });
      return;
    }
    res.json(newCustomer);
  } catch (error) {
    console.error("Error creating customer: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/customer/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);
    if (customer === null) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      res.json(customer);
    }
  } catch (error) {
    console.error("Error getting customer: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/customer/:id/certificates", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id, {
      include: Certificate,
    });
    if (customer === null) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      res.json(customer.Certificates);
    }
  } catch (error) {
    console.error("Error getting customer certificates: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/customer/:id/delete", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id, {
      include: Certificate,
    });
    if (customer === null) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    // Delete all certificates associated with the customer
    for (const certificate of customer.Certificates) {
      await certificate.destroy();
    }
    await customer.destroy();
    res.json({ message: "Customer deleted" });
  } catch (error) {
    console.error("Error deleting customer: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/certificate/create", async (req, res) => {
  try {
    const { customerId, isActive, privateKey, certBody } = req.body;
    const customer = await Customer.findByPk(customerId);
    if (customer === null) {
      res.status(404).json({ error: "Customer not found" });
      return;
    } else {
      const [newCertificate, created] = await Certificate.findOrCreate({
        where: { privateKey },
        defaults: {
          isActive: isActive ? true : false,
          privateKey,
          certBody,
          CustomerId: customer.id,
        },
      });
      if (!created) {
        res
          .status(409)
          .json({ error: "Certificate already exists for this private key" });
        return;
      }
      res.json(newCertificate);
    }
  } catch (error) {
    console.error("Error creating certificate: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/certificate/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findByPk(id);
    if (certificate === null) {
      res.status(404).json({ error: "Certificate not found" });
    } else {
      res.json(certificate);
    }
  } catch (error) {
    console.error("Error getting certificate: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/certificate/:id/activate", async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findByPk(id);
    if (certificate === null) {
      res.status(404).json({ error: "Certificate not found" });
      return;
    }
    certificate.isActive = true;
    await certificate.save();
    await externalNotifier.notify(certificate.dataValues.id, true);
    res.json({ message: "Certificate activated" });
  } catch (error) {
    console.error("Error activating certificate: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/certificate/:id/deactivate", async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findByPk(id);
    if (certificate === null) {
      res.status(404).json({ error: "Certificate not found" });
      return;
    }
    certificate.isActive = false;
    await certificate.save();
    await externalNotifier.notify(certificate.dataValues.id, false);
    res.json({ message: "Certificate deactivated" });
  } catch (error) {
    console.error("Error deactivating certificate: ", error);
    res.status(500).json({ error: error.message });
  }
});

// Surl Endpoints

app.post("/surls", async (req, res) => {
  try {
    const { longUrl } = req.body;
    // TODO: Validate longUrl
    let created = false;
    let newSurl;
    while (!created) {
      const shortUrl = await bcrypt.hash(longUrl, 10);
      [newSurl, created] = await Surl.findOrCreate({
        where: { shortUrl },
        defaults: { shortUrl, longUrl },
      });
    }
    res.json(newSurl);
  } catch (error) {
    console.error("Error creating surl: ", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/surls/getURL", async (req, res) => {
  try {
    const { shortUrl } = req.body;
    const surl = await Surl.findOne({ where: { shortUrl } });
    if (surl === null) {
      res.status(404).json({ error: "Surl not found" });
    } else {
      createAccession(surl.id);
      res.status(302).redirect(surl.longUrl);
    }
  } catch (error) {
    console.error("Error getting surl: ", error);
    res.status(500).json({ error: error.message });
  }
});

const createAccession = async (surlId) => {
  Accession.create({ SurlId: surlId });
}

app.get("/surls/:id/accessions", async (req, res) => {
  try {
    const surl = await Surl.findByPk(req.params.id);
    const accessions = await Accession.findAll({ where: { SurlId: surl.id } });
    const allTime = accessions.length;
    const week = accessions.filter(accession => {
      return new Date(accession.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }).length;
    const day = accessions.filter(accession => {
      return new Date(accession.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    }).length;
    res.json({
      allTime,
      week,
      day
    });
  } catch (error) {
    console.error("Error getting accessions: ", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
