const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const DB_PATH = path.join(__dirname, "db.json");
const PORT = process.env.PORT || 8080;
const PIX_KEY = process.env.PIX_KEY || "06679645596";

// --- Banco ---
function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    const nums = [];
    for (let i = 1; i <= 100; i++) nums.push({ numero: i, status: "disponivel" });
    fs.writeFileSync(DB_PATH, JSON.stringify({ numeros: nums }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// --- Endpoints ---
app.get("/numeros", (req, res) => {
  const db = loadDB();
  res.json(db.numeros);
});

app.post("/create_pix", (req, res) => {
  const { numerosSelecionados, nome, email } = req.body;
  if (!numerosSelecionados || numerosSelecionados.length === 0) return res.status(400).json({ error: "Nenhum número selecionado" });
  const valorTotal = numerosSelecionados.length * 3.5;
  const codigoPix = `00020126360014BR.GOV.BCB.PIX0114${PIX_KEY}0214R$${valorTotal.toFixed(2)}5204000053039865405${valorTotal.toFixed(2)}5802BR5909${nome.substring(0,9)}6009SAO PAULO62070503***6304ABCD`;
  res.json({ valorTotal, codigoPix });
});

app.post("/confirm_payment", (req, res) => {
  const { numerosSelecionados } = req.body;
  if (!numerosSelecionados || numerosSelecionados.length === 0) return res.status(400).json({ error: "Nenhum número enviado" });
  const db = loadDB();
  db.numeros = db.numeros.map(n => numerosSelecionados.includes(n.numero) ? { ...n, status: "vendido" } : n);
  saveDB(db);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`✅ Backend rodando na porta ${PORT}`));
