const express= require('express');
const router= express.Router();
const { getAllRooms,getRoomUsers } = require('../utils/users');

//get All Room Route
router.get("/allUsersData",(req,res)=>{
    response =getAllRooms();  
    res.send(JSON.stringify(response)); 
})

router.get('/getRoomUsers/:room',(req,res)=>{
    response=getRoomUsers(req.params.room);
    res.send(JSON.stringify(response));
})



module.exports = router;