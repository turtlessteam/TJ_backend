const express = require("express");
const fs = require("fs");
const path = require("path");
var cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 🔹 환경 변수에서 BASE_URL 가져오기
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// 🔹 정적 파일 제공
app.use("/images", express.static(path.join(__dirname, "images")));

// 🔹 제목(title)로 이미지 검색 (모든 확장자 허용)
const searchImageByTitle = (title) => {
  const imagesDir = path.join(__dirname, "images");
  if (!fs.existsSync(imagesDir)) return null;

  console.log("🔍 Searching for:", title);

  // 🔹 폴더 내 모든 파일 가져오기
  const files = fs.readdirSync(imagesDir);
  console.log("📂 Files in images folder:", files);

  // 🔹 title을 포함하는 파일 찾기 (확장자 제한 없음)
  const matchedFiles = files.filter((file) =>
    file.toLowerCase().includes(title.toLowerCase())
  );

  console.log("🎯 Matched files:", matchedFiles);

  return matchedFiles.length > 0
    ? encodeURI(`${BASE_URL}/images/${matchedFiles[0]}`)
    : null;
};

const searchRankImageByTitle = (title) => {
  const imagesDir = path.join(__dirname, "rankImages");
  if (!fs.existsSync(imagesDir)) return null;

  console.log("🔍 Searching for:", title);

  // 🔹 폴더 내 모든 파일 가져오기
  const files = fs.readdirSync(imagesDir);
  console.log("📂 Files in images folder:", files);

  // 🔹 title을 포함하는 파일 찾기 (확장자 제한 없음)
  const matchedFiles = files.filter((file) =>
    file.toLowerCase().includes(title.toLowerCase())
  );

  console.log("🎯 Matched files:", matchedFiles);

  return matchedFiles.length > 0
    ? encodeURI(`${BASE_URL}/images/${matchedFiles[0]}`)
    : null;
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

/*
// 🔹 랭크 이미지 검색 API
app.get("/rank/images", (req, res) => {
  const title = req.query.title;
  if (!title) {
    return res.status(400).json({ error: "Title parameter is required" });
  }

  const imageUrl = searchRankImageByTitle(title);
  if (!imageUrl) {
    return res.status(404).json({ message: "No matching image found" });
  }

  res.json({ imageUrl });
});
*/

// 🔹 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Server is running on ${BASE_URL}`);
});
