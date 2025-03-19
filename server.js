const express = require("express");
const fs = require("fs");
const path = require("path");
var cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 🔹 배포된 클라우드 서버의 URL (⚠️ .env 파일에서 설정해야 함!)
const BASE_URL = process.env.BASE_URL;

// 🔹 정적 파일 제공 (이미지를 직접 제공)
app.use("/images", express.static(path.join(__dirname, "images")));

// 🔹 제목(title)로 이미지 검색
const searchImageByTitle = (title) => {
  const imagesDir = path.join(__dirname, "images");
  if (!fs.existsSync(imagesDir)) return null;

  console.log("title", title);
  const files = fs
    .readdirSync(imagesDir)
    .filter(
      (file) =>
        file.toLowerCase().includes(title.toLowerCase()) &&
        path.extname(file).toLowerCase() === ".webp"
    );

  console.log("files", files);

  return files.length > 0 ? encodeURI(`${BASE_URL}/images/${files[0]}`) : null;
};

// 🔹 이미지 검색 API
app.get("/images", (req, res) => {
  const title = req.query.title;
  if (!title) {
    return res.status(400).json({ error: "Title parameter is required" });
  }

  const imageUrl = searchImageByTitle(title);
  if (!imageUrl) {
    return res.status(404).json({ message: "No matching image found" });
  }

  res.json({ imageUrl });
});

// 🔹 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on ${BASE_URL}`);
});
