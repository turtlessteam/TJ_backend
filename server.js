const express = require("express");
const fs = require("fs");
const path = require("path");
var cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

let imagesDir = path.join(__dirname, "images");

let imagesDir_kHip = path.join(imagesDir, "kHip");
let imagesDir_aHip = path.join(imagesDir, "aHip");
let imagesDir_band = path.join(imagesDir, "band");
let imagesDir_total = path.join(imagesDir, "total");
let imagesDir_idol = path.join(imagesDir, "idol");
let imagesDir_indi = path.join(imagesDir, "indi");
let imagesDir_ballade = path.join(imagesDir, "ballade");
let imagesDir_pop = path.join(imagesDir, "pop");
let imagesDir_Jpop = path.join(imagesDir, "Jpop");

//********images폴더 안에 장르별로 각각 폴더 새로 만들어야함!!!!


//*********genre_dic 키값과 장르 순서 맞아야함
const imagesDir_arr = [
  imagesDir_kHip,
  imagesDir_aHip,
  imagesDir_band,
  imagesDir_total,
  imagesDir_idol,
  imagesDir_indi,
  imagesDir_ballade,
  imagesDir_pop,
  imagesDir_Jpop
];

var isImagesRead = false;


const genre_dic = {
  kHip: [[], []],
  aHip: [[], []],
  band: [[], []],
  total: [[], []],
  idol: [[], []],
  indi: [[], []],
  ballade: [[], []],
  pop: [[], []],
  Jpop: [[], []]
};


// 🔹 환경 변수에서 BASE_URL 가져오기
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// 🔹 정적 파일 제공
app.use("/images", express.static(path.join(__dirname, "images")));




const readFiles = () => { //각 장르별 이미지 폴더를 모두 읽는 함수. 한번만 작업 (isImagesRead 변수로 제어어)

  //폴더 존재 확인
  if (!fs.existsSync(imagesDir)) {
    console.log("error: readFiles func, no images folder");
    return null;
  } else {
    console.log("success: images folder exist");
  }

  for (let i = 0; i < imagesDir_arr.length; i++) {
    if (!fs.existsSync(imagesDir_arr[i])) {
      console.log("error: readFiles func, no detail image folder");
      return null;
    }
    else {
      console.log("success: datail images folder exist");
    }
  }

  // 🔹 처음 한 번만 모든 폴더 이미지 파일 불러오기
  //나중에 이미지 파일 수정되면,, 다시 업데이트하는 코드 추가해도 좋을듯?
  if (!isImagesRead) {
    for (let i = 0; i < imagesDir_arr.length; i++) {
      const temp_dir = fs.readdirSync(imagesDir_arr[i]); //각 폴더의 모든 파일 이름 읽기
      const genre = Object.keys(genre_dic)[i];

      genre_dic[genre][0].push(...temp_dir.map((file) => path.join(imagesDir_arr[i], file)));//경로 배열에 이미지 값 넣기기
    }
    isImagesRead = true;
    console.log("📂 read all images folder");
  } else {
    console.log("imageFiles already read");
    return null;
  }

};



const serveImageDirAndTitle = (_temp_arr) => { //_temp_arr는 특정 장르의 배열

  if (_temp_arr.length === 0) return null;
  const _imageDir = _temp_arr[0]; //첫 번째 경로 저장

  //경로 문자열에서 제목만 추출
  const _title = path.basename(_imageDir, path.extname(_imageDir));

  //사용한 경로(배열의 요소) 삭제
  const index = _temp_arr.indexOf(_imageDir);
  if (index !== -1) _temp_arr.splice(index, 1); //있을 경우 사용한 요소 삭제

  //제목:경로로 값 반환환
  return { title: _title, imageDir: _imageDir };
};



function fillCopyArr(genre_dic_key) { //장르 받아서 복사본 배열 랜덤하게 다시 채우기

  if (genre_dic[genre_dic_key][0].length == 0) { //원본 배열에 값이 없을 경우
    console.log(`error: fillCopyArr, original ${genre_dic_key} arr is empty`);
    return null;
  }

  if (genre_dic[genre_dic_key][1].length == 0) {

    const copy = [...genre_dic[genre_dic_key][0]]; //원본 복사

    for (let i = copy.length - 1; i > 0; i--) { //복사본 랜덤하게 섞기
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    genre_dic[genre_dic_key][1] = copy;
    console.log(`getShuffleArr func: shuffled ${genre_dic_key} into copy array`);
    return true;

  } else {
    console.log("getShuffleArr func: copy_arr is already filled");
  }

};




app.get("/", (req, res) => {
  //온보딩에서 이미지 파일 불러오기. 만약 이미 불러져있으면 다시 부르지 않음
  if (!isImagesRead) {
    readFiles();
  }
  return res.status(200).send("OK");
});


// 🔹 이미지 검색 API
app.get("/images", (req, res) => {

  //프론트가 장르 보냄.
  const genre = req.query.genre;

  if (!genre) {
    return res.status(400).json({ error: "Genre parameter is required" });
  }

  //장르에 맞는 장르배열 찾기
  if (genre_dic.hasOwnProperty(genre)) { //만약 장르에 해당하는 키가 있을 경우

    const temp_arr = genre_dic[genre][1]; //특정 장르의 이미지 경로 배열 (복사본)

    if (temp_arr.length > 0) { //장르배열에 경로 1개이상 있다면

      const temp_res = serveImageDirAndTitle(temp_arr);
      if (temp_res == null) { // 혹시모를 예외처리
        return res.status(500).json({ error: "'temp_arr.length' secondary filter detected a lack of elements." });
      }
      return res.status(200).json({ message: "shoot^_^", ...temp_res });//{제목:경로} 형태도 응답 보냄

    } else { //장르 배열에 경로가 없다면 (초반에 불러온 경로를 모두 사용했다면)
      fillCopyArr(genre);
      const temp_arr = genre_dic[genre][1]; //채운 배열 재 할당당
      if (temp_arr.length > 0) {
        const temp_res = serveImageDirAndTitle(temp_arr);
        return res.status(200).json({ message: "shoot^_^", ...temp_res });//{제목:경로} 형태도 응답 보냄
      } else {
        return res.status(500).json({ error: "fillCopyArr func didn't operate." });
      }
    }

  } else { //잘못된 장르값이 전달됐을 경우
    return res.status(404).json({ message: "No matching genre found" });
  }
});

// 🔹 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Server is running on ${BASE_URL}`);
});



//원래 쓰던 코드
/*
// 🔹 제목(title)로 이미지 검색 (모든 확장자 허용)
const searchImageByTitle = (title) => {
  // 🔹 title을 포함하는 파일 찾기 (확장자 제한 없음)
  const matchedFiles = files.filter((file) =>
    file.toLowerCase().includes(title.toLowerCase())
  );

  console.log("🎯 Matched files:", matchedFiles);

  return matchedFiles.length > 0
    ? encodeURI(`${BASE_URL}/images/${matchedFiles[0]}`)
    : null;
};
*/


//genre 변수에 맞는 장르 배열 찾기기

/*
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

*/


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


/*
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

*/


