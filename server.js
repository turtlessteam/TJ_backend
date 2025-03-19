const express = require("express");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // 🔹 .env 파일 사용

const app = express();
const PORT = process.env.PORT || 3000;

// 🔹 배포된 클라우드 서버의 URL (⚠️ .env 파일에서 설정해야 함!)
const BASE_URL = process.env.BASE_URL;

// 🔹 지원하는 카테고리 목록
const validCategories = [
  "아이돌",
  "발라드",
  "POP",
  "JPOP",
  "국힙",
  "외힙",
  "밴드",
  "인디",
];

// 🔹 정적 파일 제공 (이미지를 직접 제공)
app.use("/images", express.static(path.join(__dirname, "images")));

// 🔹 특정 폴더 내에서 WebP 파일만 가져오기
const getImagesFromCategory = (category) => {
  const categoryPath = path.join(__dirname, "images", category);
  if (!fs.existsSync(categoryPath)) return [];

  return fs
    .readdirSync(categoryPath)
    .filter((file) => path.extname(file).toLowerCase() === ".webp") // WebP 파일만 필터링
    .map((file) => encodeURI(`${BASE_URL}/images/${category}/${file}`)); // 🔹 띄어쓰기 및 특수문자 자동 변환
};

// 🔹 모든 카테고리의 WebP 이미지 데이터 로드
const allImages = validCategories.flatMap((category) =>
  getImagesFromCategory(category)
);

// 🔹 이미지 가져오기 API
app.get("/images", (req, res) => {
  let category = req.query.category;

  if (category) {
    category = decodeURIComponent(category); // 🔹 URL 인코딩된 카테고리 자동 디코딩
  }

  // 유효한 카테고리인지 확인
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  // 카테고리에 맞게 필터링
  let filteredImages = category ? getImagesFromCategory(category) : allImages; // 카테고리 없으면 전체에서 랜덤 선택

  if (filteredImages.length === 0) {
    return res.status(404).json({ message: "No images found" });
  }

  // 랜덤으로 하나 선택
  let randomImageUrl =
    filteredImages[Math.floor(Math.random() * filteredImages.length)];

  res.json({ imageUrl: randomImageUrl }); // 🔧 응답 URL이 배포된 주소로 변경됨
});

// 🔹 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on ${BASE_URL}`); // 🔧 배포된 URL로 변경되었는지 확인 필요
});
