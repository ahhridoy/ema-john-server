const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middileware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s1xse.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run () {
    try {
        await client.connect();
        // console.log('database connected successfully')
        const database = client.db('online_shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();

            if(page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }

            res.send(
                {count,
                products});
        })

        // Use POST to get data by keys
        app.post('/products/byKeys', async (req, res) => {
            const keys = req.body;
            const query = {key: {$in : keys}}
            const products = await productCollection.find(query).toArray();
            res.json(products);
        })

        // Get orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir)

app.get("/", (req, res) => {
    res.send("Ema John Server is running");
});

app.listen(port, () => {
    console.log("Server running is port", port);
});
