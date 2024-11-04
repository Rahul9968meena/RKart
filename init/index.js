const express = require("express");
const initData = require("./data.js");
const mongoose = require("mongoose");
const Karting = require("../models/karting.js");

const MongoUrl = "mongodb://127.0.0.1:27017/RKart";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MongoUrl);
}

const initDB = async () => {
  await Karting.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "67286734d1199f6a76a23306",
  }));
  await Karting.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
