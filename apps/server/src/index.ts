import express from "express";

const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Sanity Check");
});

app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});
