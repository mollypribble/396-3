"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({})
            .sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
        console.log(req.body);
        if (!req.body.name || !req.body.seasons){ 
            throw new Error("name and seasons required!");
        }
        const newDoc = req.body;
        Doctor.create(newDoc).save()
            .then(doc => {
                res.status(201).send(doc);
            })
            .catch(err => {
                res.status(400).send({
                    message: "unable to save to db"
                })
            })
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        res.status(501).send();
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.findById(req.params.id)
            .sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        Doctor.findOneAndUpdate({_id: req.params.id}, req.body, {new: true})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err =>{
                res.status(404).send({
                    message: "id not found"
                });
            })
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        Doctor.findOneAndDelete({_id: req.params.id})
        .then(data => {
            res.status(200).send(null);
        })
        .catch(err =>{
            res.status(404).send(err);
        })
    });
    
router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        const findId = req.params["id"];
        Companion.find( {"doctors": {$in : findId}} ) 
            .sort('ordering')  
            .then(companions => {
                res.status(200).send(companions);
                return;
            })
            .catch(err =>{
                res.status(404).send(err);
                return;
            })
    });
    

router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        const findId = req.params["id"];
        Doctor.findById(findId)
            .sort('ordering')
            .then(data => {
                return Companion.find( {"doctors": {$in : findId}} ); 
            })
            .then(companions => {
                for (const comp of companions){
                    if (!comp.alive){
                        res.status(200).send(false);
                        return;
                    }
                }
                res.status(200).send(true);
                return;
            })
            .catch(err => {
                res.status(404).send(err);
                return;
            })
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        res.status(501).send();
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        console.log(req.body);
        if (!req.body.name || !req.body.seasons || !req.body.character || !req.body.alive || !req.body.doctors){ 
            throw new Error("name, character, alive, doctors and seasons required!");
        }
        const newDoc = req.body;
        Companion.create(newDoc).save()
            .then(doc => {
                res.status(201).send(doc);
            })
            .catch(err => {
                res.status(400).send({
                    message: "unable to save to db"
                })
            })
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        Companion.find({})
            .sort('ordering')
            .then(companions => {
                let compList = [];
                if (companions){
                    for (const comp of companions){
                        if (comp.doctors.length > 1){
                            compList.push(comp);
                        }
                    }
                }
                res.status(200).send(compList);
                return;
            })
            .catch(err => {
                res.status(404).send(err);
                return;
            });  
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        res.status(501).send();
    })

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findById(req.params.id)
        .sort('ordering')
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(404).send(err);
        });
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        Companion.findOneAndUpdate({_id: req.params.id}, req.body, {new: true})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err =>{
                res.status(404).send({
                    message: "id not found"
                });
            })
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        Companion.findOneAndDelete({_id: req.params.id})
        .then(data => {
            res.status(200).send(null);
        })
        .catch(err =>{
            res.status(404).send(err);
        })
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        Companion.findById(req.params.id)
        .sort('ordering')
        .then(comp => {
            return Doctor.find({"_id": {$in : comp.doctors}})
        })
        .then(doc =>{
            res.status(200).send(doc);
            return;
        })
        .catch(err => {
            res.status(404).send(err);
            return;
        });
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        Companion.findById(req.params.id)
            .sort('ordering')
            .then(comp => {
                return Companion.find( {"_id" : {$ne : req.params.id}, "seasons" : {$in : comp.seasons} } );
            })
            .then(foundComp =>{
                res.status(200).send(foundComp);
                return;
            })
            .catch(err => {
                res.status(404).send(err); 
                return;
            })
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        res.status(501).send();
    });

module.exports = router;