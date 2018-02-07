const express = require("express");
const sModels = require("./../models/sequelize");
const mModels = require("./../models/mongoose");
const Study = sModels.Study;
const StudyOverflow = mModels.StudyOverflow;
const Collection = mModels.Collection;
const Analysis = mModels.Analysis;
const User = mModels.User;
let router = express.Router();

router.get("/:id", function(req, res, next) {
  Analysis.findById(req.params.id)
    .then(result => {
      console.log("result => ", result);
      res.json(result);
    })
    .catch(e => res.status(500).send(e.stack));
});

router.get("/ids", async (req, res, next) => {
  let results = [];
  let query = req.query.analyses;
  let queryParams = {
    where: {
      id: {
        [Op.or]: []
      }
    }
  };
  if (query[0] == "_") {
    query = query.substring(1);
  }
  let idArray = query.split("_");
  idArray.forEach(id => {
    queryParams.where.id[Op.or].push(id);
  });
  let rawAnalyses;
  try {
    rawAnalyses = await Analysis.find(queryParams);
  } catch (e) {
    res.status(500).send(e.stack);
  }
  if (rawAnalyses.length) {
    rawAnalyses.map(analysis => {
      results.push(analysis);
    });
  }

  res.send(JSON.stringify(results));
});

router.put('/:id', async (req, res, next) => {
  console.log(req.params.id);
  console.log(req.body);
  let updatedAnalysis;
  let submitter
  try {
    updatedAnalysis = await Analysis.findByIdAndUpdate(
      req.params.id,
      req.body,
    ); 
    console.log(updatedAnalysis);
    submitter = await User.findById(req.body.ownerId)
    console.log(submitter);
    let updateUser = true;
    let analysesArray = submitter.analyses || [];
    console.log(analysesArray);
    for(let i = 0; i < analysesArray.length; i++){
      if(submitter.analyses[i]._id.toString() == updatedAnalysis._id.toString()){
        updateUser = false;
      }
    }
    if(updateUser){
      submitter.analyses.push(updatedAnalysis);
      submitter = await submitter.save();
      res.json(updatedAnalysis);
    } else {
      res.status(200).send();
    }
  } catch (e) {
    res.status(500).send(e.stack);
  }
});

module.exports = router;
