import express, { response } from "express";
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import md5 from "md5";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import mongoose from "mongoose";
import { database } from "./db/db.js";
import path from "path";
import { fileURLToPath } from "url";

import { Post } from "./models/post.js";
import { User } from "./models/user.js";
import { Chain } from "./models/chain.js";

const db = "mongodb+srv://aligroup:XyGGrOoHnnETTCGe@cluster0.00i6crk.mongodb.net/aligroup?retryWrites=true&w=majority";
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
    ``;
  });

const app = express();
const port = 5050;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static("photos"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.send("hello from simple server :)");
});

app.post("/login", (req, res) => {
  User.find().then((response) => {
    const email = req.body.email;
    const password = req.body.password;

    let result;
    let userFound = false;

    let users = response;
    for (const key in users) {
      console.log(users[key]);
      if (users[key].email == email) {
        let user = users[key];
        userFound = true;
        if (password == user.password) {
          result = "allow";
          let hash = md5(`${email}${password}`);

          res.send({
            info: result,
            hash: hash,
            name: user.name,
            role: user.role,
            email: user.email,
          });
        } else {
          result = "incorrect password";
          res.send({ info: result });
        }
      }
    }

    if (!userFound) {
      result = "user not found";
      res.send({ info: result });
    }
  });
});

app.post("/checkHash", (req, res) => {
  const email = req.body.email;
  const hash = req.body.hash;
  let correct = false;

  User.find().then((response) => {
    let users = response;
    for (const key in users) {
      let user = users[key];
      if (user.email == email) {
        if (hash == md5(user.email + user.password)) {
          correct = true;
          res.send({ correct: correct, name: user.name, role: user.role, email: user.email });
        } else {
          res.send({ correct: correct });
        }
      }
    }
  });
});

app.post("/getPhotos", (req, res) => {
  let files = req.files;
  for (const key in files) {
    let file = files[key];
    file.mv("photos/" + file.name, (err) => {});
  }
  res.sendStatus(200);
});

app.post("/savePost", (req, res) => {
  let fields = JSON.parse(req.body.fields);
  const post = new Post({ ...fields });
  post
    .save()
    .then((response) => {
      let id = response._id.toString();

      new Promise(function (resolve, reject) {
        let passData = {};

        fs.mkdirSync("photos/" + id);
        let files = req.files;
        let photos_path = [];
        let mainPhoto_path = "";
        for (const key in files) {
          let file = files[key];
          let fileName = file.name;
          fileName = fileName.split(".");
          file.mv(`photos/${id}/` + `${fileName[0]}.jpg`, (err) => {});
          if (fileName[0] == "main") {
            mainPhoto_path = `photos/${id}/main.jpg`;
          } else {
            photos_path.push(`photos/${id}/${fileName[0]}.jpg`);
          }
        }
        passData.photos_path = photos_path;
        passData.mainPhoto_path = mainPhoto_path;

        // extras to DB

        resolve(passData);
      }).then((data) => {
        Post.findByIdAndUpdate(id, {
          mainPhoto_path: data.mainPhoto_path,
          photos_path: data.photos_path,
        }).then((response1) => {});
      });

      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/getPosts", (req, res) => {
  let role = req.body.role;
  let name = req.body.name;

  if (role == "admin") {
    Post.find().then((response) => {
      res.send(response);
    });
  } else {
    Post.find({ name: name }).then((response) => {
      res.send(response);
    });
  }
});

app.post("/getMainPhoto", (req, res) => {
  let id = req.body.id;

  if (fs.existsSync(path.join(__dirname, "/photos/" + id + "/", "main.jpg"))) {
    res.sendFile(path.join(__dirname, "/photos/" + id + "/", "main.jpg"));
  } else {
    res.send({ err: "file not found" });
  }
});

app.post("/hasPhoto", (req, res) => {
  let id = req.body.id;
  fs.readdir(path.join(__dirname, "/photos/" + id), function (err, files) {
    if (err) {
      console.log(err);
        res.send({ hasPhoto: false });
    } else {
      if (files.length == 0) {
        res.send({ hasPhoto: false });
      } else {
        res.send({ hasPhoto: true });
      }
    }
  });
});

app.post("/getPhoto", (req, res) => {
  const email = req.body.email;
  const hash = req.body.hash;
  let id = req.body.id;
  let photoName = req.body.photoName;

  User.find().then((response) => {
    let users = response;
    for (const key in users) {
      let user = users[key];
      if (user.email == email) {
        if (hash == md5(user.email + user.password)) {
          res.sendFile(path.join(__dirname, "/photos/" + id + "/", `${photoName}.jpg`));
        } else {
          res.send({ correct: "hash not correct" });
        }
      }
    }
  });
});

app.post("/deletePost", (req, res) => {
  let foundUsed = false;
  Chain.find().then((response) => {
    let allChains = response;
    for (const chain of allChains) {
      for (const object of chain.objects) {
        if (object._id == req.body.id) {
          console.log("founddddd");
          foundUsed = true;
          res.send({ info: "postUsed", name: chain.name });
        }
      }
    }
    if (!foundUsed) {
      Post.findByIdAndDelete(req.body.id).then((response) => {
        if (fs.existsSync("photos/" + response._id)) {
          fs.rmdir("photos/" + response._id, { recursive: true }, (err) => {
            if (err) {
              throw err;
            }
          });
        }
        console.log("bullshit");
        res.send({ info: 200 });
      });
    }
  });
});

app.post("/getUsers", (req, res) => {
  let names = [];
  User.find().then((response) => {
    for (const item of response) {
      names.push(item.name);
    }
    res.send(names);
  });
});

app.post("/getPostItem", (req, res) => {
  Post.findById(req.body.id).then((response) => {
    if (response != null) {
      res.send(response);
    } else {
      res.send({ info: "not found" });
    }
  });
});

app.post("/updatePost", (req, res) => {
  let fields = JSON.parse(req.body.fields);
  new Promise(function (resolve, reject) {
    if (fs.existsSync("photos/" + req.body.id)) {
      fs.rm("photos/" + req.body.id, { recursive: true }, (err) => {
        if (err) {
          throw err;
        }
        resolve();
      });
    }
  }).then(() => {
    Post.findByIdAndUpdate(req.body.id, { $set: { ...fields } }).then((response) => {});
    new Promise(function (resolve, reject) {
      let passData = {};
      let id = req.body.id;

      fs.mkdirSync("photos/" + id);
      let files = req.files;
      let photos_path = [];
      let mainPhoto_path = "";
      for (const key in files) {
        let file = files[key];
        let fileName = file.name;
        fileName = fileName.split(".");
        file.mv(`photos/${id}/` + `${fileName[0]}.jpg`, (err) => {});
        if (fileName[0] == "main") {
          mainPhoto_path = `photos/${id}/main.jpg`;
        } else {
          photos_path.push(`photos/${id}/${fileName[0]}.jpg`);
        }
      }
      passData.photos_path = photos_path;
      passData.mainPhoto_path = mainPhoto_path;

      // extras to DB

      resolve(passData);
    }).then((data) => {
      let id = req.body.id;
      Post.findByIdAndUpdate(id, {
        mainPhoto_path: data.mainPhoto_path,
        photos_path: data.photos_path,
      }).then((response1) => {
        res.send({ info: "updated" });
      });
    });
  });
});

app.post("/getFavs", (req, res) => {
  if (!req.body.email) {
    res.send("Gde email");
  }
  User.find({ email: req.body.email }).then((response) => {
    res.send(response[0].favourites);
  });
});

app.post("/saveFav", (req, res) => {
  User.findOneAndUpdate({ email: req.body.email }, { $push: { favourites: req.body.id } }).then((response) => {
    res.send(true);
  });
});

app.post("/deleteFav", (req, res) => {
  User.find({ email: req.body.email }).then((user) => {
    if (user[0].favourites.includes(req.body.id)) {
      User.findOneAndUpdate({ email: req.body.email }, { $pull: { favourites: req.body.id } }).then((response) => {
        res.send(true);
      });
    }
  });
});

app.post("/getExchange", (req, res) => {
  let posts = [];
  Post.find()
    .then((response) => {
      posts = response;
    })
    .then(() => {
      let notOurPosts = [];
      let result = [];
      for (const item of posts) {
        if (item.isOur == "нет") {
          notOurPosts.push(item);
        }
      }
      for (const initial of notOurPosts) {
        for (const second of posts) {
          if (initial.ex_price_from <= second.price && initial.ex_price_to >= second.price) {
            if (initial._id != second._id && initial.ex_type == second.type) {
              if (result.length != 0) {
                let duplicate_found = false;
                for (const item of result) {
                  if (item.ids.includes(initial._id.toString())) {
                    if (item.ids.includes(second._id.toString())) {
                      duplicate_found = true;
                    }
                  }
                }
                if (!duplicate_found) {
                  let checkState = check(initial, second);
                  console.log(checkState);
                  let data_obj = {};
                  if (checkState.ok) {
                    data_obj.initial_matches = checkState.matches;
                    data_obj.initial_score = checkState.score;
                    data_obj.initial_all_scores = checkState.all_scores;
                    checkState = check(second, initial);
                    if (checkState.ok) {
                      data_obj.initial = initial._id;
                      data_obj.second = second._id;
                      data_obj.second_score = checkState.score;
                      data_obj.second_matches = checkState.matches;
                      data_obj.second_all_scores = checkState.all_scores;
                      data_obj.ids = [initial._id.toString(), second._id.toString()];
                      data_obj.types = [initial.type, second.type];
                      data_obj.initial_photo = false;
                      data_obj.second_photo = false;

                      if (fs.existsSync("photos/" + data_obj.initial + "/main.jpg")) {
                        data_obj.initial_photo = true;
                      }
                      if (fs.existsSync("photos/" + data_obj.second + "/main.jpg")) {
                        data_obj.second_photo = true;
                      }

                      result.push(data_obj);
                    }
                  }
                }
              } else {
                let checkState = check(initial, second);
                let data_obj = {};
                if (checkState.ok) {
                  data_obj.initial_matches = checkState.matches;
                  data_obj.initial_score = checkState.score;
                  data_obj.initial_all_scores = checkState.all_scores;
                  checkState = check(second, initial);
                  if (checkState.ok) {
                    data_obj.initial = initial._id;
                    data_obj.second = second._id;
                    data_obj.second_score = checkState.score;
                    data_obj.second_matches = checkState.matches;
                    data_obj.second_all_scores = checkState.all_scores;
                    data_obj.ids = [initial._id.toString(), second._id.toString()];
                    data_obj.types = [initial.type, second.type];

                    data_obj.initial_photo = false;
                    data_obj.second_photo = false;

                    if (fs.existsSync("photos/" + data_obj.initial + "/main.jpg")) {
                      data_obj.initial_photo = true;
                    }
                    if (fs.existsSync("photos/" + data_obj.second + "/main.jpg")) {
                      data_obj.second_photo = true;
                    }

                    result.push(data_obj);
                  }
                }
              }
            }
          }
        }
      }

      let final_result = { gold: [], silver: [], bronze: [] };

      for (const item of result) {
        let all_scores = item.initial_all_scores + item.second_all_scores;
        let score = item.initial_score + item.second_score;
        if (all_scores == score) {
          final_result.gold.push(item);
        } else if (all_scores - 3 <= score) {
          final_result.silver.push(item);
        } else {
          final_result.bronze.push(item);
        }
      }

      res.send(final_result);
    });
});

app.post("/findMatching", async (req, res) => {
  let result = {
    gold: [],
    silver: [],
    bronze: [],
  };
  Post.findById(req.body.id).then((matchingFor) => {
    Post.find()
      .then(async (posts) => {
        for (const post of posts) {
          if (post._id != matchingFor) {
            if (matchingFor.ex_type == post.type && (matchingFor.ex_price_from <= post.price && matchingFor.ex_price_to >= post.price)) {
              let checkResult = check(matchingFor, post);
              console.log(checkResult);
              if (checkResult.ok) {
                let post_copied = JSON.parse(JSON.stringify(post));
                if (checkResult.all_scores == checkResult.score) {
                  post_copied.all_scores = checkResult.all_scores;
                  post_copied.score = checkResult.score;
                  result.gold.push(post_copied);
                } else if (checkResult.all_scores - 3 <= checkResult.score) {
                  post_copied.all_scores = checkResult.all_scores;
                  post_copied.score = checkResult.score;
                  result.silver.push(post_copied);
                } else {
                  post_copied.all_scores = checkResult.all_scores;
                  post_copied.score = checkResult.score;
                  result.bronze.push(post_copied);
                }
              }
            }
          }
        }
      })
      .then(() => {
        res.send(result);
      });
  });
});

app.post("/saveChain", async (req, res) => {
  try {
    let data = JSON.parse(req.body.data);
    let duplicateName = false;

    Chain.find().then((chains) => {
      for (const chain of chains) {
        if (chain.name == data.name) {
          duplicateName = true;
        }
      }
      if (!duplicateName) {
        const chain = new Chain({ ...data });
        chain.save().then(() => {
          res.send({ info: 200 });
        });
      } else {
        res.send({ info: "duplicate" });
      }
    });
  } catch (error) {}
});

app.post("/updateChain", async (req, res) => {
  let data = JSON.parse(req.body.data);
  Chain.findOneAndUpdate({ _id: data.chainId }, data, { upsert: true }).then((response) => {
    res.send({ info: 200 });
  });
});

app.post("/removeChain", async (req, res) => {
  let id = req.body.chainId;
  Chain.findByIdAndRemove({ _id: id }).then(() => {
    res.send({ info: 200 });
  });
});

app.post("/getChains", async (req, res) => {
  Chain.find().then((chains) => {
    res.send(chains);
  });
});

app.post("/getChainById", (req, res) => {
  let id = req.body.id;
  Chain.findById(id).then((chain) => [res.send(chain)]);
});

function check(initial, second) {
  switch (initial.ex_type) {
    case "Квартира":
      if (initial.ex_region == second.region) {
        if (initial.ex_city == second.city) {
          let score = 0;
          let skipped = 0;
          let matches = [];
          if (initial.ex_district == "" || initial.ex_district == second.district) {
            score++;
            matches.push("Район");
          }
          if (initial.ex_complex == "" || initial.ex_complex == second.complex) {
            score++;
            matches.push("Жилой комплекс");
          }
          if (initial.ex_built_year_from <= second.built_year && initial.ex_built_year_to >= second.built_year) {
            matches.push("Год постройки");
            score++;
          }
          if (initial.ex_class == "" || initial.ex_class == second.class) {
            score++;
            matches.push("Класс ЖК");
          }
          if (initial.ex_rooms_from <= second.rooms && initial.ex_rooms_to >= second.rooms) {
            return { ok: false, score: score, type: initial.ex_type, reason: "rooms" };
          } else {
            matches.push("Кол-во комнат");
            score++;
          }
          if (initial.ex_area_from <= second.area && initial.ex_area_to >= second.area) {
            matches.push("Общ. площадь");
            score++;
          } else {
            return { ok: false, score: score, type: initial.ex_type, reason: "square" };
          }
          if (initial.ex_height == second.height) {
            matches.push("Высота потолков");
            score++;
          }
          if (initial.toilet == second.toilet) {
            matches.push("Туалет");
            score++;
          }
          if (initial.ex_otdelka == second.otdelka) {
            matches.push("Отделка");
            score++;
          }
          if (initial.ex_floor_from <= second.floor && initial.ex_floor_to >= second.floor) {
            matches.push("Этаж");
            score++;
          }
          return { ok: true, score: score, matches: matches, all_scores: 10 };
        }
      }

      break;

    // ======================

    case "Помещение":
      if (initial.ex_region == second.region) {
        if (initial.ex_city == second.city) {
          let score = 0;
          let matches = [];
          if (initial.ex_district == "" || initial.ex_district == second.district) {
            score++;
            matches.push("Район");
          }
          if (initial.ex_complex == "" || initial.ex_complex == second.complex) {
            score++;
            matches.push("Жилой комплекс");
          }
          if (initial.ex_built_year_from <= second.built_year && initial.ex_built_year_to >= second.built_year) {
            matches.push("Год постройки");
            score++;
          }
          if (initial.ex_area_from <= second.area && initial.ex_area_to >= second.area) {
            score++;
            matches.push("Общ. площадь");
          } else {
            return { ok: false, score: score, type: initial.ex_type, reason: "square" };
          }
          if (initial.ex_height == second.height) {
            matches.push("Высота потолков");
            score++;
          }
          if (initial.ex_otdelka == second.otdelka) {
            matches.push("Отделка");
            score++;
          }
          if (initial.ex_first_line == second.first_line) {
            matches.push("Первая линия");
            score++;
          }
          if (initial.ex_ready_business == second.ready_business) {
            matches.push("Готовый бизнес");
            score++;
          }
          if (initial.ex_arendator == second.arendator) {
            matches.push("Арендатор");
            score++;
          }
          if (initial.ex_car_parking == second.car_parking) {
            matches.push("Паркинг");
            score++;
          }
          return { ok: true, score: score, matches: matches, all_scores: 10 };
        }
      }
      break;

    case "Участок":
      if (initial.ex_region == second.region) {
        if (initial.ex_city == second.city) {
          let score = 0;
          let matches = [];
          if (initial.ex_district == "" || initial.ex_district == second.district) {
            score++;
            matches.push("Район");
          }
          if (initial.ex_built_year_from <= second.built_year && initial.ex_built_year_to >= second.built_year) {
            matches.push("Год постройки");
            score++;
          }
          if (initial.ex_uchastok_from <= second.uchastok && initial.ex_uchastok_to >= second.uchastok) {
            matches.push("Участок (сот)");
            score++;
          } else {
            return { ok: false, score: score, type: initial.ex_type, reason: "uchastok square" };
          }
          if (initial.ex_purpose == second.purpose) {
            matches.push("Назначение");
            score++;
          }
          if (initial.ex_any_buildings == second.any_buildings) {
            matches.push("Наличие построек");
            score++;
          }
          if (initial.ex_pdp == second.pdp) {
            matches.push("ПДП");
            score++;
          }
          if (initial.ex_project == second.project) {
            matches.push("Проект");
            score++;
          }
          if (initial.ex_uchastok_type == second.uchastok_type) {
            matches.push("Тип участка");
            score++;
          }
          return { ok: true, score: score, matches: matches, all_scores: 7 };
        }
      }
      break;

    case "Дом":
      if (initial.ex_region == second.region) {
        if (initial.ex_city == second.city) {
          let score = 0;
          let matches = [];
          if (initial.ex_district == "" || initial.ex_district == second.district) {
            score++;
            matches.push("Район");
          }
          if (initial.ex_built_year_from <= second.built_year && initial.ex_built_year_to >= second.built_year) {
            score++;
            matches.push("Год постройки");
          }
          if (initial.ex_rooms_from <= second.rooms && initial.ex_rooms_to >= second.rooms) {
            return { ok: false, score: score, type: initial.ex_type, reason: "rooms" };
          } else {
            matches.push("Кол-во комнат");
            score++;
          }
          if (initial.ex_area_from <= second.area && initial.ex_area_to >= second.area) {
            matches.push("Общ. площадь");
            score++;
          } else {
            return { ok: false, score: score };
          }
          if (initial.ex_height_from <= second.height && initial.ex_height_to >= second.height) {
            matches.push("Высота потолков");
            score++;
          }
          if (initial.ex_otdelka == second.otdelka) {
            matches.push("Отделка");
            score++;
          }
          if (initial.ex_uchastok_from <= second.uchastok && initial.ex_uchastok_to >= second.uchastok) {
            matches.push("Участок");
            score++;
          }
          if (initial.ex_floors_number_from <= second.floors_number && initial.ex_floors_number_to >= second.floors_number) {
            matches.push("Кол-во этажей");
            score++;
          } else {
            return { ok: false, score: score, type: initial.ex_type, reason: "floors num" };
          }
          return { ok: true, score: score, matches: matches, all_scores: 8 };
        }
      }
      break;

    case "База/Склад":
      if (initial.ex_region == second.region) {
        if (initial.ex_city == second.city) {
          let score = 0;
          let matches = [];
          if (initial.ex_district == "" || initial.ex_district == second.district) {
            score++;
            matches.push("Район");
          }
          if (initial.ex_built_year_from <= second.built_year && initial.ex_built_year_to >= second.built_year) {
            matches.push("Год постройки");
            score++;
          }
          if (initial.ex_area_from <= second.area && initial.ex_area_to >= second.area) {
            matches.push("Общ. площадь");
            score++;
          } else {
            return { ok: false, score: score, type: initial.ex_type, reason: "square" };
          }
          if (initial.ex_offices_area_from <= second.offices_area && initial.ex_offices_area_to >= second.offices_area) {
            matches.push("Площадь офисов");
            score++;
          }
          if (initial.ex_warehouse_area_from <= second.warehouse_area && initial.ex_warehouse_area_to >= second.warehouse_area) {
            matches.push("Площадь складов");
            score++;
          } else {
            return {
              ok: false,
              score: score,
              type: initial.ex_type,
              reason: "warehouse area",
            };
          }
          if (initial.ex_heating == second.heating) {
            matches.push("Отопление");
            score++;
          }
          if (initial.ex_railroad == second.railroad) {
            score++;
            matches.push("ЖД тупик");
          }
          if (initial.ex_electricity_from <= second.electricity && initial.ex_electricity_to >= second.electricity) {
            matches.push("Электроэнергия");
            score++;
          }
          if (initial.ex_transformator == second.transformator) {
            matches.push("Трансформатор");
            score++;
          }

          return { ok: true, score: score, matches: matches, all_scores: 9 };
        }
      }

      break;

    case "Завод":
      if (initial.ex_region == second.region) {
        if (initial.ex_city == second.city) {
          let score = 0;
          let matches = [];
          if (initial.ex_district == "" || initial.ex_district == second.district) {
            score++;
            matches.push("Район");
          }
          if (initial.ex_built_year_from <= second.built_year && initial.ex_built_year_to >= second.built_year) {
            score++;
            matches.push("Год постройки");
          }
          if (initial.ex_warehouse_area_from <= second.warehouse_area && initial.ex_warehouse_area_to >= second.warehouse_area) {
            matches.push("Площадь складов");
            score++;
          } else {
            return { ok: false, score: score, type: initial.ex_type, reason: "warehouse area" };
          }
          if (initial.ex_railroad == second.railroad) {
            score++;
            matches.push("ЖД тупик");
          }
          if (initial.ex_uchastok_from <= second.uchastok && initial.ex_uchastok_to >= second.uchastok) {
            matches.push("Участок (сот)");
            score++;
          }
          if (initial.ex_production.trim().toLowerCase() == second.production.trim().toLowerCase()) {
            matches.push("Производство");
            score++;
          }
          if (initial.ex_mobility == second.mobility) {
            score++;
            matches.push("Мобильность");
          }

          return { ok: true, score: score, matches: matches, all_scores: 7 };
        }
      }

      break;

    case "Авто":
      if (initial.ex_region == second.region) {
        if (initial.ex_city == second.city) {
          let score = 0;
          let matches = [];
          if (initial.ex_auto_class == second.auto_class) {
            score++;
            matches.push("Класс авто");
          } else {
            return { ok: false };
          }
          if (initial.ex_marka == second.marka) {
            score++;
            matches.push("Марка");
          } else {
            return { ok: false };
          }
          if (initial.ex_model == second.model) {
            score++;
            matches.push("Модель");
          } else {
            return { ok: false };
          }
          if (initial.ex_auto_year_from - 3 <= second.auto_year && initial.ex_auto_year_to + 3 >= second.auto_year) {
            score++;
            matches.push("Год выпуска");
          } else {
            return { ok: false };
          }
          if (initial.ex_probeg >= second.probeg) {
            score++;
            matches.push("Пробег");
          } else {
            return { ok: false };
          }
          if (initial.ex_cleared == second.cleared) {
            score++;
            matches.push("Растоможка");
          } else {
            return { ok: false };
          }

          return { ok: true, score: score, matches: matches, all_scores: 6 };
        }
      }

      break;

    case "БЦ":
      if (initial.ex_region == second.region) {
        if (initial.ex_city == second.city) {
          let score = 0;
          let matches = [];
          if (initial.ex_district == "" || initial.ex_district == second.district) {
            score++;
            matches.push("Район");
          }
          if (initial.ex_built_year_from <= second.built_year && initial.ex_built_year_to >= second.built_year) {
            score++;
            matches.push("Год постройки");
          }
          if (initial.ex_area_from <= second.area && initial.ex_area_to >= second.area) {
            score++;
            matches.push("Общ. площадь");
          } else {
            return { ok: false, score: score };
          }
          if (initial.ex_uchastok_from <= second.uchastok && initial.ex_uchastok_to >= second.uchastok) {
            score++;
            matches.push("Участок (сот)");
          }
          if (initial.ex_floors_number_from <= second.floors_number && initial.ex_floors_number_to >= second.floors_number) {
            score++;
            matches.push("Кол-во этажей");
          } else {
            return { ok: false, score: score };
          }
          if (initial.ex_office_area_from <= second.office_area && initial.ex_office_area_to >= second.office_area) {
            matches.push("Площадь офисов");
            score++;
          } else {
            return { ok: false, score: score };
          }
          if (initial.ex_offices_number_from <= second.offices_number && initial.ex_offices_number_to >= second.offices_number) {
            score++;
            matches.push("Кол-во офисов");
          }
          if (initial.ex_parking_number_from <= second.parking_number && initial.ex_parking_number_to >= second.parking_number) {
            matches.push("Кол-во парк. мест");
            score++;
          }

          return { ok: true, score: score, matches: matches, all_scores: 9 };
        }
      }
      break;

    case "Гостиница":
      if (initial.ex_region == second.region) {
        if (initial.ex_city == second.city) {
          let score = 0;
          let matches = [];
          if (initial.ex_district == "" || initial.ex_district == second.district) {
            score++;
            matches.push("Район");
          }
          if (initial.ex_built_year_from <= second.built_year && initial.ex_built_year_to >= second.built_year) {
            score++;
            matches.push("Год постройки");
          }
          if (initial.ex_area_from <= second.area && initial.ex_area_to >= second.area) {
            score++;
            matches.push("Общ. площадь");
          } else {
            return { ok: false, score: score };
          }
          if (initial.ex_uchastok_from <= second.uchastok && initial.ex_uchastok_to >= second.uchastok) {
            matches.push("Участок (сот)");
            score++;
          }
          if (initial.ex_floors_number_from <= second.floors_number && initial.ex_floors_number_to >= second.floors_number) {
            matches.push("Кол-во этажей");
            score++;
          } else {
            return { ok: false, score: score };
          }
          if (initial.ex_hotel_rooms_area_from <= second.hotel_rooms_area && initial.ex_hotel_rooms_area_to >= second.hotel_rooms_area) {
            matches.push("Площадь номеров");
            score++;
          } else {
            return { ok: false, score: score };
          }
          if (initial.ex_hotel_rooms_from <= second.hotel_rooms && initial.ex_hotel_rooms_to >= second.hotel_rooms) {
            matches.push("Кол-во номеров");
            score++;
          }
          if (initial.ex_parking_number_from <= second.parking_number && initial.ex_parking_number_to >= second.parking_number) {
            matches.push("Кол-во парк. мест");
            score++;
          }

          return { ok: true, score: score, matches: matches, all_scores: 9 };
        }
      }

      break;

    default:
      break;
  }
}

app.listen(port, () => console.log("> Server is up and running on port : " + port));
