const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, "db.json");
const PORT = process.env.PORT || 8080;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "RIFA1234";

// --- Banco simples em arquivo ---
function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    const nums = [];
    for (let i = 1; i <= 100; i++) {
      nums.push({ numero: i, status: "disponivel" });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify({ numeros: nums }, null, 2));
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// --- Endpoints ---
app.get("/numeros", (req, res) => {
  const db = loadDB();
  res.json(db.numeros);
});

app.post("/admin/marcar-vendidos", (req, res) => {
  const token = req.headers["authorization"] || "";
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "não autorizado" });
  }
  const { vendidos = [] } = req.body;
  const db = loadDB();
  db.numeros = db.numeros.map(n =>
    vendidos.includes(n.numero) ? { ...n, status: "vendido" } : n
  );
  saveDB(db);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✅ Backend rodando na porta ${PORT}`);
});
