const Sauce = require("../models/sauces");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  sauce.save()
  .then(() => {
      res.status(201).json({ message: "Nouvelle sauce crée" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
exports.modifySauce = (req, res, next) => {
  const newSauceValue = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
        _id: req.params.id,
      }
    : { ...(req.body), _id: req.params.id };

  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (sauce.userId === req.auth.userId) {
      if (req.file) {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) {
            console.error("error deleting image");
          }
        });
      }
      Sauce.updateOne({ _id: req.params.id }, newSauceValue)
        .then(() => res.status(201).json({ message: "Sauce modifié" }))
        .catch((error) => res.status(400).json({ error }));
    } else {
      res.status(403).json({ message: "Unauthorized" });
    }
  });
};

/*=== Delete a Sauce from DB ===*/
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId === req.auth.userId) {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimé" }))
          .catch((error) => res.status(400).json({ error }));
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) {
            console.error("error deleting image");
          }
        });
      } else {
        res.status(403).json({ message: "Unauthorized" });
      }
    })
    .catch((error) =>
      res
        .status(404)
        .json({ message: "Sauce non présente in DataBase", error: error })
    );
};

/*=== Add or remove a Like or Dislike ===*/
exports.likeOrDislike = (req, res, next) => {
  console.log(req.auth)
  Sauce.findOne({ _id: req.params.id })
  
    .then((sauce) => {
      if (req.body.like === 1) {
        if (
          !(
            sauce.usersLiked.includes(req.auth.userId) ||
            sauce.usersDisliked.includes(req.auth.userId)
          )
        ) {
          sauce.likes = sauce.likes + 1;
          sauce.usersLiked.push(req.auth.userId);
        }
      }
      if (req.body.like === 0) {
        if (sauce.usersLiked.includes(req.auth.userId)) {
          sauce.likes = sauce.likes - 1;
          sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.auth.userId), 1);
        } else if (sauce.usersDisliked.includes(req.auth.userId)) {
          sauce.dislikes = sauce.dislikes - 1;
          sauce.usersDisliked.splice(
            sauce.usersDisliked.indexOf(req.auth.userId),
            1
          );
        }
      }
      if (req.body.like === -1) {
        if (
          !(
            sauce.usersLiked.includes(req.auth.userId) ||
            sauce.usersDisliked.includes(req.auth.userId)
          )
        ) {
          sauce.dislikes = sauce.dislikes + 1;
          sauce.usersDisliked.push(req.auth.userId);
        }
      }
      Sauce.updateOne({ _id: req.params.id }, sauce)
        .then(() =>
          res
            .status(201)
            .json({ message: "Modification des likes ou dislikes" })
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) =>
      res
        .status(404)
        .json({ message: "Sauce non présente in DataBase", error: error })
    );
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  
  Sauce.find()
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
    console.log(req.body);
};