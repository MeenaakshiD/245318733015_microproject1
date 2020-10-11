const express=require('express');
const app=express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;

let server=require('./server');
let config=require('./config');
let middleware=require('./middleware');
const response=require('express');

const url='mongodb://127.0.0.1:27017';
const dbname="hospitalManagement";
let db

MongoClient.connect(url,(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbname);
    console.log(`connected database: ${url}`);
    console.log(`Database:${dbname}`);
});

app.get('/hospitaldetails', middleware.checkToken, (req,res)=>{
    console.log("getting things ready");
    const data=db.collection("hospitaldetails").find().toArray()
    .then(result => res.json(result));
});

app.get('/ventilatordetails', middleware.checkToken, (req,res)=>{
    console.log("getting things ready");
    const data=db.collection("ventilatordetails").find().toArray()
    .then(result=>(res.json(result)));
});

app.post('/searchventilatorbystatus', middleware.checkToken, (req,res) => {
    const status = req.query.status;
    console.log(status);
    const ventilator=db.collection('ventilatordetails')
    .find({"status":status}).toArray().then(result=>res.json(result));
});

app.post('/searchventilatorbyname', middleware.checkToken, (req,res) => {
    const name=req.query.name;
    console.log(name);
    const ventilatordetails=db.collection('ventilatordetails')
    .find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

app.post('/searchhospital', middleware.checkToken, (req,res) => {
    const name=req.query.name;
    console.log(name);
    const ventilator=db.collection('hospitaldetails')
    .find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

app.post('/addvent',(req,res)=>{
    const hId=req.query.hId;
    const ventilatorId=req.query.ventilatorId;
    const status=req.query.status;
    const name=req.query.name;
    console.log("adding ventilator, please wait a moment");
    const item={"hId":hId, "ventilatorId":ventilatorId, "status":status, "name":name};
    db.collection("ventilatordetails").insertOne(item, function(err, result){
        res.json("inserted successfully");
    });
});

app.put('/updateventilator', middleware.checkToken, (req,res) => {
    const ventilatorId= {ventilatorId: req.query.ventilatorId};
    console.log(ventilatorId);
    const newvalues={$set: {status:req.query.status}};
    console.log("updating ventilator details, please wait a moment");
    db.collection("ventilatordetails").updateOne(ventilatorId, newvalues, function(err, result){
        res.json('updated one document');
        if(err) throw err;
    });
});

app.delete('/deletevent', middleware.checkToken, (req,res) => {
    const ventilatorId=req.query.ventilatorId;
    console.log(ventilatorId);
    const temp={"ventilatorId":ventilatorId};
    db.collection("ventilatordetails").deleteOne(temp, function(err,obj){
        if(err) throw err;
        res.json("deleted one element");
    });
});

app.listen(9000,(req,res)=>{
    console.log("working well");
});