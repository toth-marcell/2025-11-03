import express from "express";
import JWT from "jsonwebtoken";
import { ComparePassword, HashPassword } from "./auth.js";
import { Item, User } from "./models.js";

const app = express();
export default app;

app.use(express.json());

app.use(async (req, res, next) => {
  try {
    const jwt = req.headers.authorization;
    const id = JWT.verify(jwt, process.env.SECRET).id;
    const user = await User.findByPk(id);
    res.locals.user = user;
  } catch {
    res.locals.user = null;
  }
  next();
});

function LoggedInOnly(req, res, next) {
  if (res.locals.user) next();
  else res.status(401).json({ msg: "You must be logged in to do that!" });
}

app.post("/register", async (req, res) => {
  const { name, password, address } = req.body;
  if (!(name && password && address))
    return res.status(400).json({ msg: "You must fill out all fields!" });
  if (await User.findOne({ where: { name } }))
    return res.status(400).json("That name is already taken!");
  await User.create({ name, password: HashPassword(password), address });
  res.json({ msg: "Success! You can now log in." });
});

app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  if (!(name && password))
    return res
      .status(400)
      .json("You must fill out the name and password fields!");
  const user = await User.findOne({ where: { name } });
  if (user) {
    if (ComparePassword(password, user.password)) {
      res.json({
        msg: "Success!",
        token: JWT.sign({ id: user.id }, process.env.SECRET, {
          expiresIn: "1y",
        }),
      });
    } else res.status(400).json({ msg: "Wrong password!" });
  } else res.status(404).json({ msg: "No user exists with that name!" });
});

app.get("/item", LoggedInOnly, async (req, res) => {
  res.json(await Item.findAll());
});

app.post("/item", LoggedInOnly, async (req, res) => {
  const { name, count } = req.body;
  if (!(name && count))
    return res.status(400).json("You must fill out all fields!");
  await Item.create({
    name,
    count,
    UserId: res.locals.user.id,
  });
  res.json({ msg: "Success!" });
});

app.delete("/item/:id", LoggedInOnly, async (req, res) => {
  const item = await Item.findByPk(req.params.id);
  if (!item) return res.status(404).json({ msg: "No such item!" });
  await item.destroy();
  res.json({ msg: "Success!" });
});

app.put("/item", LoggedInOnly, async (req, res) => {
  const { id, name, count } = req.body;
  const item = await Item.findByPk(id);
  if (!item) return res.status(404).json({ msg: "No such item!" });
  if (!(name || count)) return res.status(400).json("Not changing anything.");
  if (name) await item.update({ name });
  if (count) await item.update({ count });
  res.json({ msg: "Success!" });
});
