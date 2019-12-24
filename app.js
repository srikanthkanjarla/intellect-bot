const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
const app = express();
const port = process.env.PORT || 3000;

const ASSISTANT_ID = process.env.ASSISTANT_ID;
const URL = process.env.URL;
const API_KEY = process.env.API_KEY;
const VERSION = process.env.VERSION;
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// ZYCLYX - IBM Watson Assistant
const assistant = new AssistantV2({
  version: VERSION,
  authenticator: new IamAuthenticator({
    apikey:API_KEY,
  }),
  url:URL,
  headers: {
    'X-Watson-Learning-Opt-Out': 'true'
  }
});
  
app.get('/', function (req, res) {
  res.status(200).send({status:'active'});
})

// CREATE A NEW SESSION
app.get('/session',function(req,res){
    assistant.createSession({ assistantId: ASSISTANT_ID })
    .then(function(response){
        return response.result.session_id;
    })
    .then(function(session){       
        res.status(200).send({session:session});
    })
    .catch(function(error){          
        res.status(error.code || 500).send(error);
        console.log(error);
    })
}) 

app.post('/intellect',function(req,res){
    if(!req.body.session_id){
        res.status(500).send({output:{message:"Invalid Session"}})
    }    
    assistant.message({
        assistantId: ASSISTANT_ID,
        sessionId:req.body.session_id,
        input: {
          'message_type': 'text',
          'text': req.body.text
        }
      })
      .then(function(response){        
       res.status(200).send(response.result.output.generic);  
      })
})
 
app.listen(port, () => console.log(`app listening on port ${port}!`));