const express = require("express");
const app = express();
app.use(express.static('chat'));

const http = require("http");
const server = http.createServer(app);
const socketIO = require("socket.io");
// const cors = require('cors');
// app.use(cors());
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    getAllRooms,
    getroomAdminId,
    requestJoin,
    requestLeave,
    getCurrentReqList,
    getReqRoomUsers
  } = require('./utils/users');
  const externalRoute =require('./routers/roomsRoute');
  app.use('/',externalRoute)

let io = socketIO(server);

// ********************** socket communication  ************************
io.on("connection", (socket) => {
  console.log("socket opened......");

  //listing member request 
  socket.on("request_member",(data)=>{
    console.log('request sent successfully....')
         requestJoin(socket.id,data.room);
      let roomAdminId=getroomAdminId(data.room);
     if(roomAdminId){
          socket.to(roomAdminId).emit("server_request_member",{
          user:data.user,
          user_id:socket.id,
          room:data.room
        })
     }
     else{
       console.log('room is no more........');
       console.log(socket.id);
       socket.emit('server_reject_member')
     }
  })

  //Listening Accept 
  socket.on('accept_member',(data)=>{
    requestLeave(data.uid);
    socket.to(data.uid).emit("server_accept_member",{
      isAccept:true
    })
  })

  //Listening Recject member
  socket.on('reject_member',(data)=>{
    console.log('host rejected request.......')
    requestLeave(data.uid);
   socket.to(data.uid).emit('server_reject_member')
  })



  //Listening new Joinee
  socket.on("new_joinee", (data) => {
      let user=userJoin(socket.id,data.user,data.room,data.role);
      let roomUsers= getRoomUsers(data.room);
    socket.join(data.room);

    //  for  other users in same room
    socket.in(data.room).broadcast.emit("server_new_joinee", {
      msg: data.user + " has joined the chat " ,
      roomUsers:roomUsers
    });
    //for same user
    socket.emit("server_new_joinee", {
      msg: "You " + " has joined the chat " ,
      roomUsers:roomUsers
    });
  });

  //Listening new msg from client
  socket.on("client_new_msg", (data) => {
    //  for  other users in same room
    socket.in(data.room).broadcast.emit("server_new_msg", {
      msg: data.msg,
      user: data.user,

    });
    //for same user
    socket.emit("server_new_msg", {
      msg: data.msg,
      user: 'you',
    });
  });


//socket disconnect
  socket.on('disconnect',()=>{
    user= userLeave(socket.id);
    if(user){
      let roomUsers= getRoomUsers(user.room);
      if(user.role=="member"){
        socket.broadcast.in(user.room).emit("server_leave_room",{
          msg:user.username +" has left the room",
          roomUsers:roomUsers
        })
      }else if(user.role=="admin"){
        console.log('admin refreshed the page......*****')
         socket.broadcast.to(user.room).emit('server_leave_all',user.room);

         //remove all request List
         let requestList=getReqRoomUsers(user.room)
         console.log("request list is " ,requestList.length)
         for(let key of requestList){
           socket.to(key.id).emit('server_reject_member');
         }
      }

    }
    // request socket handling
    else{
      let request=getCurrentReqList(socket.id);
      if(request){
        socket.broadcast.to(request.room).emit("request_leave_room",socket.id);
        console.log("it's user leave requst")    
      }
    }
  })




   //Listening Remove existed member
    socket.on('remove_member',(data)=>{
      userLeave(data.uid);
      socket.to(data.uid).emit('server_remove_member');

      //return room list
      let roomUsers=getRoomUsers(data.room);
     socket.broadcast.to(data.room).emit('server_remove_update',{
       roomUsers,
       msg:'host removed '+data.name
      })
     socket.emit('server_remove_update',{
       roomUsers,
       msg:' you removed '+data.name
      });
    })

});
// ******************************************************************************
var port = process.env.PORT | 3000;
server.listen(port, () => {
  console.log("server started.....");
});
