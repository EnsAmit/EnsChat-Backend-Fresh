import { createServer } from 'http'
import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import Message from '../../models/message/message.model.js'
import { createError } from './backend.functions.js'
import Chat from '../../models/chat/chat.model.js'


const ensModuleBackendApp = express();
const httpServer = createServer(ensModuleBackendApp)
ensModuleBackendApp.use(cors());

const io = new Server(httpServer, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
let roomId;
io.on('connect', (socket) => {

  socket.on('setup', (userData) => {
    socket.join(userData);
    console.log('userData',userData)
    socket.emit('connected')
  })

  socket.on('join chat', (room) => {
    socket.join(room)
    // console.log("user joined")
    const numUsers = io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(`Number of users in room ${room}: ${numUsers}`);

  })

  socket.on('message send', async (chatData) => {
    try {
      console.log("chatData",chatData)
      if(chatData.chat == null){
        const chatMembers = [
          { userId: chatData.sender },
          { userId: chatData.receiver }
        ];
  
        const newChat = new Chat({
          members: chatMembers
        });

        const savedChat = await newChat.save();
        chatData.chat =  savedChat._id;
      }
      console.log("after daving chatData",chatData)
      const newMessage = new Message(chatData);
      const savedMessage = await newMessage.save();

      const selectedMessage = {
        sender: savedMessage.sender,
        messageType: savedMessage.messageType,
        fileName: savedMessage.fileName,
        chat: savedMessage.chat,
        content: savedMessage.content
      };
   
      // console.log('chatData',chatData)
      // const newMessage = new Message(chatData);
      // const savedMessage = await newMessage.save();

      
      // const selectedMessage = {
      //   sender: savedMessage.sender,
      //   chat: savedMessage.chat,
      //   content: savedMessage.content
      // };
      // console.log("selectedMessage",selectedMessage)
      const room = chatData.chat;
      console.log('room',room)
      
      console.log('selectedMessage',selectedMessage)

    // const  chatId=['664eccac02d9362769cf23aa','6651c59101ac02e581f44ad0']
    chatData.members.forEach((id)=>{
      socket.in(id).emit('message received', selectedMessage);

    })
      // io.to(room).emit('message received',()=>{console.log('event is fire')}, selectedMessage);

    } catch (error) {
      console.error('Error saving message:', error);
      // createError(next(400,"Error saving message:"))
      throw new Error("Error in saving message");
      
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });

  // --------------- video call ---------------------

  socket.on("room:join", (data) => {
    console.log(data, "room: join now");
    const { chatId, room } = data;
    emailToSocketIdMap.set(chatId, socket.id);
    socketidToEmailMap.set(socket.id, chatId);
    io.to(room).emit("user:joined", { chatId, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
    console.log("room:join")
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
    console.log("user:call")
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
    console.log("call:accepted")
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    console.log("peer:nego:needed")
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    console.log("peer:nego:done")
  });

  // --------------- video call ---------------------
})

export { ensModuleBackendApp, httpServer };
