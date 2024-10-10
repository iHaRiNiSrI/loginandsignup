const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');  
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.use(express.static(path.join(__dirname, 'public'))); 


const uri = "mongodb+srv://harinisrivarmai:harinisrivarmai@database.cx72n.mongodb.net/?retryWrites=true&w=majority&appName=database";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function connectToMongoDB() {
  try {
    
    await client.connect();
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
  }
}
connectToMongoDB();


const database = client.db('logindb'); 
const usersCollection = database.collection('logindata'); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html')); 
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html')); 
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html')); 
});


app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

   
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.send('User already exists');
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = {
      username,
      password: hashedPassword
    };

    
    await usersCollection.insertOne(newUser);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.send('Error creating account');
  }
});


app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

   
    const foundUser = await usersCollection.findOne({ username });
    if (!foundUser) {
      return res.send('Invalid username or password');
    }

    
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (isMatch) {
      res.send('Login successful');
    } else {
      res.send('Invalid username or password');
    }
  } catch (err) {
    console.error(err);
    res.send('Error during login');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
