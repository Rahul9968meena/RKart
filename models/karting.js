const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js");

const kartingSchmea = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD4Rdbd2MCReY8p_lfzzkKd1jxS92SkGeCnw&s",
    set: (v) =>
      v === ""
        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD4Rdbd2MCReY8p_lfzzkKd1jxS92SkGeCnw&s"
        : v,
  },
  price: Number,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

kartingSchmea.post("findOneAndDelete", async (karting) => {
  if (karting) {
    await Review.deleteMany({ _id: { $in: karting.reviews } });
  }
});

const Karting = mongoose.model("Karting", kartingSchmea);
module.exports = Karting;
