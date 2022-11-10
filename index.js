const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000 
const cors = require('cors')
const jwt = require('jsonwebtoken');


// middle ware 
app.use(cors())
app.use(express.json())
require('dotenv').config();



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hcgdznz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function verify(req, res, next){
  const justify = req.headers.authorization 
  if(!justify){
      return res.status(401).send({message: 'unothoraize access'})
   }

   const token = justify.split(' ')[1]

   jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
      if(err){
         return res.status(404).send({message: 'unauthorize access'})
      }
      req.decoded = decoded
      next()
     })
}








async function run(){

  try{
    const serviceCollection= client.db('photograpyServiceDB').collection('serviceDB')
    const reviewCollection=client.db('userReview').collection('userReviewCollection')
    const addServiceCollection=client.db('photograpyServiceDB').collection('newservice')





    app.post('/jwt', (req, res)=>{
      const user = req.body 
      console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
      res.send({token})
  })










    app.get('/service', async (req, res)=>{
      const query={}
      const cursor=serviceCollection.find(query)
      const result= await cursor.toArray()
      res.send(result)
    })


    app.get('/servicelimit', async (req, res)=>{
      const query={}
      const cursor=serviceCollection.find(query).limit(3)
      const result= await cursor.toArray()
      res.send(result)
    })






    app.get('/service/:id', async (req, res)=>{
         const id= req.params.id;
         const query= {_id:ObjectId(id)}
         const result=await serviceCollection.findOne(query)
         res.send(result)
    })


    app.post('/review', async (req, res)=>{
       const data=req.body;
       const result= await reviewCollection.insertOne(data)
       res.send(result)
       
    })
    app.get('/review/:service', async (req, res)=>{
       const id=req.params.service;
       const query= {service:id}
       const cursor= reviewCollection.find(query)
       const result=await cursor.toArray()
       res.send(result)
    })








    app.get('/myreview',verify, async(req, res)=>{

      const decoded = req.decoded
      console.log(decoded)

      if(decoded.email !== req.query.email){
          return res.status(402).send({message: 'unauthorize access'})
     }


      let query={}
      if(req.query.email){
        query={
          email: req.query.email
        }
      }
      const cursor=reviewCollection.find(query)
      const myreview=await cursor.toArray()
      res.send(myreview)
    })







    app.delete("/myreview/:id", async(req, res)=>{
         const id=req.params.id
         const query={_id:ObjectId(id)}
         const cursor= await reviewCollection.deleteOne(query)
         res.send(cursor)
    })


    // add service 

    app.get('/newservice', async(req, res)=>{
      const query = {}
      const cursor = addServiceCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)

  })
  
  
  app.post('/newservice', async(req, res)=>{
      const review = req.body
      const result = await  addServiceCollection.insertOne(review)
      res.send(result)

  })


// Review text update 

app.patch('/reviews/:id', async(req, res)=>{
  const id = req.params.id
  const message = req.body.message
  const query = {_id: ObjectId(id)}
  const updateDoc = {
      $set:{
          message: message
      }
  }

  const result = await reviewCollection.updateOne(query, updateDoc)
  res.send(result)
  console.log(result)
})



  }
  finally{

  }

}

run().catch((err)=>console.log(err))












app.get('/', (req, res) => {
  res.send('Service server run')
})

app.listen(port, () => {
  console.log(`Service server is runing ${port}`)
})

