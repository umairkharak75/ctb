const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var cors = require("cors");
const Notification = require("./models/notifications");


const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const question = require("./routes/api/question");

const posts = require("./routes/api/posts");
const auth = require("./routes/api/auth");

const app = express();
app.use("/uploads", express.static("uploads"));

//app.use(express.static("./public/uploads"));

app.use(cors());
//  const http = require('http').Server(app);
//  const client = require('socket.io')(http);
const port = process.env.PORT || 5000;

var server = app.listen(port);
var client = require("socket.io").listen(server);
// Body parser middleware
app.use(express.json({ extended: false }));
//app.use(bodyParser.json());
//app.use("/", express.static('social-fe/dist'));
app.use("/public", express.static("public"));

// DB Config
// const db = require('./config/keys').mongodb;
const db =
  "mongodb+srv://umairkharak75:1234567890@sa-backend-cnw8q.mongodb.net/sa-backend?retryWrites=true&w=majority";
// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => {
    console.log('MongoDB Connected')

    client.on('connection', function(socket){
    //  let chat = db.collection('chats');
       console.log('conenction done')
      // Create function to send status
      sendStatus = function(s){
          socket.emit('status', s);
      }

  
      // Handle input events
            socket.on('input', function(userId){
            fetchNotification()
        // Check for name and message   
            async function fetchNotification() {
                 
              try {
                 const notificaiton = await Notification.find().sort({ date: -1 })
                
                 client.emit('firstTimeCall', notificaiton);
                // Send status object
                sendStatus({
                    message: 'Message sent',
                    clear: true
                });
              } catch (err) {
                console.error(err.message);
                res.status(500).send("Server Error");
              }

               }
                 
            
          
      });
     


      // Handle clear
      socket.on('clear', function(data){
          // Remove all chats from collection
          chat.remove({}, function(){
              // Emit cleared
              socket.emit('cleared');
          });
      });
  });

  })
  .catch(err => console.log(err));
//app.get('/', (req, res) => res.send('Hello World'));
// Use Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/auth", auth);
app.use("/api/question", question);

app.use("/api/posts", posts);
// app.use((req, res, next) => {
//     res.sendFile(path.join(__dirname, "social-fe",'dist','social-fe', "index.html"));
//   });

// app.use(express.static('social=fe/dist'));

app.get("/", (req, res) => {
  console.log("hello");
  res.send("hello");
});

//app.listen(port, () => console.log(`Server running on port ${port}`));
