const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();

// middlewire
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.qhvkztn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    const toyCollection = client.db("toyDB").collection("toys");
   
    const indexKey = {name: 1}
    const indexOptions= {Name: "toysName"}
    const result = await toyCollection.createIndex(indexKey, indexOptions)



app.get('/search/:text', async(req, res)=>{
  const searchText = req.params.text;
  const result = await toyCollection.find({
    $or:[ {name: {$regex : searchText, $options: "i"}}]
  }).toArray()
  res.send(result)
})

    app.post("/toys", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    });

    app.get("/toys", async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          photo: 1,
          sellerName: 1,
          sellerEmail: 1,
          price: 1,
          rating: 1,
          quantity: 1,
          name: 1,
          description: 1,
        },
      };

      const result = await toyCollection.findOne(query, options);

      res.send(result);
    });

    app.get('/toy/:text', async (req, res)=>{
      console.log(req.params.text)
      if(req.params.text == "Marvel" || req.params.text == "DC comics" || req.params.text =="StarWar"){
        const result = await toyCollection.find({category: req.params.text }).toArray()
        res.send(result)
      }
    })


    app.get("/toys", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const updatedInfo = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: updatedInfo.price,
          quantity: updatedInfo.quantity,
          description: updatedInfo.description,
        },
      };

      const result = await toyCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toy is running");
});
app.listen(port, () => {
  console.log(`toys server is running on port: ${port}`);
});
