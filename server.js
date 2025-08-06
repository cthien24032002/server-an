require("dotenv").config({ path: "./.env" });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = ["https://h5.zdn.vn"];
      const isLocalhost = origin && origin.startsWith("http://localhost");

      if (!origin || allowedOrigins.includes(origin) || isLocalhost) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "Accept",
      "X-Requested-With",
      "Content-Type",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
      "Authorization",
    ],
    credentials: true,
  })
);

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = ["https://h5.zdn.vn"];
      const isLocalhost = origin && origin.startsWith("http://localhost");

      if (!origin || allowedOrigins.includes(origin) || isLocalhost) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS (Socket.IO)"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const messageSchema = new mongoose.Schema({
  from: String,
  to: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(403).json({ error: "Invalid token" });
  }
};

app.get("/history", authMiddleware, async (req, res) => {
  const { from, to } = req.query;
  const messages = await Message.find({
    $or: [
      { from, to },
      { from: to, to: from },
    ],
  }).sort({ timestamp: 1 });
  res.json(messages);
});

app.post("/auth/zalo", async (req, res) => {
  try {
    const { id, name, avatar } = req.body;
    if (!id)
      return res
        .status(400)
        .json({ success: false, error: "User ID is required" });

    const ADMIN_ID = "7948708725058758361";
    const role = id === ADMIN_ID ? "admin" : "user";

    const jwtPayload = {
      id,
      name: name || "Unknown User",
      avatar: avatar || "",
      role,
      platform: "zalo",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ success: false, error: "Server configuration error" });
    }

    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET);
    res.json({ success: true, jwtToken, user: { id, name, role } });
  } catch (error) {
    console.error("/auth/zalo error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    socket.phoneNumber = decoded.phoneNumber;
    next();
  } catch (error) {
    console.error("Socket JWT verification error:", error);
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.userId} (${socket.userRole})`);

  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("message", async (data) => {
    try {
      const message = new Message({
        from: data.from,
        to: data.to,
        message: data.message,
      });
      await message.save();

      if (socket.userRole === "admin" && data.broadcast) {
        io.emit("broadcast_message", {
          from: data.from,
          message: data.message,
          timestamp: new Date(),
          type: "admin_broadcast",
        });
      } else {
        io.to(data.to).emit("message", data);
      }
    } catch (error) {
      console.error("Message handling error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.userId}`);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});

app.post("/api/auth/jwt-login", async (req, res) => {
  try {
    const { userId, userInfo } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    const token = jwt.sign(
      { userId, userInfo, timestamp: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, user: userInfo });
  } catch (error) {
    console.error("JWT login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/phone/verify-token", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token required" });

    res.json({
      success: true,
      phoneNumber: "+84987654321",
      userInfo: { verified: true },
    });
  } catch (error) {
    console.error("Phone verification error:", error);
    res.status(500).json({ error: "Phone verification failed" });
  }
});

app.post("/auth/verify-phone", async (req, res) => {
  try {
    const { token, secretKey } = req.body;
    if (!token || !secretKey)
      return res
        .status(400)
        .json({ success: false, error: "Token and secret key required" });

    const phoneNumber = "8496989746899";
    // const ADMIN_PHONE = "0963332502";
    const ADMIN_PHONE = "0962846467";

    const role = phoneNumber === ADMIN_PHONE ? "admin" : "user";

    const jwtPayload = {
      id: `phone_${phoneNumber}`,
      phoneNumber,
      role,
      platform: "zalo",
      iat: Math.floor(Date.now() / 1000),
    };

    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      jwtToken,
      user: { id: jwtPayload.id, phoneNumber, role },
    });
  } catch (error) {
    console.error("Phone verification error:", error);
    res
      .status(500)
      .json({ success: false, error: "Phone verification failed" });
  }
});

const decodeZaloPhoneToken = async (token, secretKey) => {
  try {
    const crypto = require("crypto");
    const decoded = jwt.verify(token, secretKey, { algorithms: ["HS256"] });
    return { id: decoded.id, number: decoded.number };
  } catch (error) {
    try {
      const response = await axios.get("https://graph.zalo.me/v2.0/me/info", {
        headers: { access_token: token },
      });
      return { id: response.data.id, number: response.data.phone };
    } catch (apiError) {
      throw new Error("Cannot decode phone token");
    }
  }
};
