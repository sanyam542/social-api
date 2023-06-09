const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const conversationRoute = require("./routes/conversation");
const messageRoute = require("./routes/message");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const { ImgurClient } = require("imgur");
const fs = require("fs");

const client = new ImgurClient({
  accessToken: "7df8e120772b6adc91f2089bd20d586dc6c4b315",
});

dotenv.config();
app.use(helmet());
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors());

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);

app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(morgan("common"));

//upload

const storage = multer.diskStorage({
  destination: (req, File, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    // const fileName = req.body.name;
    const file = req.file;
    const fileData = fs.readFileSync(
      __dirname + `/public/images/${file.originalname}`
    );

    const response = await client.upload({
      image: fileData,
      type: "stream",
    });
    console.log(response.data.link);
    fs.unlinkSync(__dirname + `/public/images/${file.originalname}`);
    return res.status(200).json(response.data.link);
  } catch (err) {
    console.log(err);
  }
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);

app.listen(8800, () => {
  console.log("Backend server is running! port:8800");
});
