const { genSaltSync, hashSync, compareSync } = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const prisma = require("../../config/prisma");
const jwt = require("jsonwebtoken");

module.exports = {
  getUsers: async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred while fetching the users",
      });
    }
  },
  getUserById: async (req, res) => {
    const userId = req.params.id;
    try {
      const user = await prisma.user.findFirst({
        where: {
          id: parseInt(userId),
        },
      });
      if (user) {
        res.status(200).send(user);
        return;
      }
      res.status(404).json({
        success: 0,
        message: "User not found",
      });
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occurred while fetching the users",
      });
    }
  },
  validateSession: async (req, res) => {
    try {
      console.log("validateSession");
      const token = req.get("authorization").slice(7);
      const decoded = jwt.decode(token);

      if (decoded) {
        const cart = await prisma.cart.findFirst({
          where: { user_id: decoded.user.id },
        });
        return res.status(200).json({
          userId: decoded.user.id,
          cartId: cart.id,
          email: decoded.user.email,
        });
      } else {
        res.json({
          success: 0,
          message: "Invalid token",
        });
      }
    } catch (error) {
      res.json({
        success: 0,
        message: "Invalid token",
      });
    }
  },
  createUser: async (req, res) => {
    console.log("register");
    const body = req.body;
    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    try {
      const uniqueEmail = await prisma.user.findFirst({
        where: {
          email: body.email,
        },
      });

      if (uniqueEmail) {
        return res.status(400).json({
          success: 0,
          message: `An account with email ${body.email} already exists`,
        });
      }

      const user = await prisma.user.create({
        data: {
          name: body.name,
          password: body.password,
          email: body.email,
          cart: {
            create: {},
          },
        },
      });
      res.status(201).send(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: 0,
        message: "An error occured in the register process",
      });
    }
  },
  authenticateUser: async (req, res) => {
    const body = req.body;
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (user && compareSync(body.password, user.password)) {
      const cart = await prisma.cart.findFirst({
        where: { user_id: user.id },
      });
      user.password = undefined;
      const jwt = sign({ user: user }, "qwe1234", {
        expiresIn: "1h",
      });
      return res.status(200).json({
        userId: user.id,
        cartId: cart.id,
        email: user.email,
        token: jwt,
      });
    }

    return res.status(401).json({
      success: 0,
      message: "Invalid email or password",
    });
  },
};
