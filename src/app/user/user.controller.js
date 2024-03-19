const { genSalt, hash, compareSync } = require("bcryptjs");
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
  getUserByEmail: async (req, res) => {
    try {
      const { email } = req.query;
      // Validate the email parameter
      if (!email) {
        return res.status(400).json({ error: 'Email parameter is required' });
      }

      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });
      if (user) {
        return res.send(user);
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
    try {
      const { name, email, password } = req.body;
      if(!name || !email || !password){
        return res.status(400).json({
          success: 0,
          message: "Invalid request body",
        });
      }
      // hash the password
      const salt = await genSalt(Number(process.env.BCRYPT_SALT));
      const hashedPassword = await hash(password, salt);

      const userFound = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (userFound && userFound.password) {
        return res.status(400).json({
          success: 0,
          message: `An account with email ${email} already exists`,
        });
      }
      // If user exists but has no password, update the password
      if(userFound){
        const user = await prisma.user.update({
          where: { email },
          data: {
            name,
            password: hashedPassword
          }
        });
        return res.status(201).send(user);
      }
      // If user does not exist, create a new user
      else {
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            cart: {
              create: {}
            }
          }
        });
        return res.status(201).send(user);
      }
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occured in the register process",
      });
    }
  },
  authenticateCredentialsUser: async (req, res) => {
    try {
      const body = req.body;
      const user = await prisma.user.findFirst({
        where: {
          email: body.email,
        },
      });

      if (user && compareSync(body.password, user.password)) {
        const cart = await prisma.cart.findFirst({
          where: { userId: user.id },
        });
        user.password = undefined;
        const jwt = sign({ user: user }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });
        return res.status(200).json({
          name: user.name,
          email: user.email,
          userId: user.id,
          cartId: cart.id,
          role:  user.role,
          token: jwt,
        });
      }
  
      return res.status(401).json({
        success: 0,
        message: "Invalid email or password",
      });
    }
    catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occured in the login process",
      });
    }
    
  },
  authenticateGoogleUser: async (req, res) => {
    try {
      const { name, email, googleId } = req.body;
      if(!name || !email || !googleId){
        return res.status(400).json({
          success: 0,
          message: "Invalid request body",
        });
      }

      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          email
        },
        include: {
          cart: true
        }
      });

      // User doenst exist or googleId is different
      if (!user || user.googleId !== googleId) {
          // Update user with googleId and name
          if(user){
            user = await prisma.user.update({
              where: { email },
              data: {
                name,
                googleId
              },
              include: {
                cart: true
              }
            });
          } 
          // Create user
          else {
            user = await prisma.user.create({
              data: {
                name,
                email,
                googleId,
                cart: {
                  create: {}
                }
              },
              include: {
                cart: true
              }
            });
          }
      }

      const jwtUser = {
        name: user.name,
        email: user.email,
        userId: user.id,
        googleId: user.googleId,
        role: user.role,
        cartId: user.cart.id
      }
      const jwt = sign({ jwtUser }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        ...jwtUser,
        token: jwt,
      });
    } catch (error) {
      res.status(500).json({
        success: 0,
        message: "An error occured in the login process",
      });
    }
  }
};
