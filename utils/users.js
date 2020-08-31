const users = [];
const reqList=[];

//******** Requst List related functions******** */

// Join request user
function requestJoin(id,room){
  const request= {id,room};
  reqList.push(request);

  return reqList;
}

// Leave Request User
function requestLeave(id){
  const index=reqList.findIndex(req => req.id === id);
  if (index !== -1) {
    return reqList.splice(index, 1)[0];
  }
}

// Get current request List
function getCurrentReqList(id) {
  return reqList.find(req => req.id === id);
}
//get current Requset Room users
function getReqRoomUsers(room) {
  return reqList.filter(user => user.room === room);
}


// ******************** users related Functions ********************


// Join user to chat
function userJoin(id, username, room,role) {
  const user = { id, username, room,role };

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

//get room admin id 
function getroomAdminId(room){
  let roomUsers = getRoomUsers(room);

  if(roomUsers.length>0){
    let admin = roomUsers.find(user=> user.role == 'admin')
     return admin.id;  
  }
  else return false;
}

//get all room details
function getAllRooms(){
  return users;
}


module.exports = {
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
};