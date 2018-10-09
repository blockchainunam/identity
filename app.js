const logger = require('morgan');

const IPFS = require('ipfs');
const dns = require('dns-then');
const uuidv4 = require('uuid/v4');
const md5 = require('md5');
const web3 = require('web3');
const Tx = require('ethereumjs-tx');

web3js = new web3(new web3.providers.HttpProvider("https://rinkeby.infura.io/aK4AhtatQ5uilkOv"));


const http = require('http');
const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser');
const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.urlencoded({ extended: true }));
var path = require("path");
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('views'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var sess = { secret: 'keyboard cat', cookie: {}, resave: true, saveUninitialized: true };

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}
app.use(session(sess));

//#################################  IPFS

const node = new IPFS();

node.on('ready', async () => {
  const version = await node.version();
  console.log('IPFS Version:', version.version);
  addContentToIPFS('{Identity: "hello world"}');
});

node.on('error', error => {
  console.error(error.message);
});

async function addContentToIPFS(content){
    var response = "";
    try{
        const filesAdded = await node.files.add({
            path: 'reputation.json',
            content: Buffer(content)
        });
        console.log('Added file:', filesAdded[0].path, filesAdded[0].hash);
        if (filesAdded[0].hash){
            return filesAdded[0].hash;
        } else {
            return "";
        }
    } catch (err) {
         return "";
    }
}

async function retriveJsonFromIPFS(hash){
    var response = "";
    try{
        const fileBuffer = await node.files.cat(hash);
        response = fileBuffer.toString();
        if (response){
            return response;
        } else {
            return "";
        }
    } catch (err) {
         return "";
    }
}

//######################    ETHER FUNCTIONS    ######################


async function writeIPFS(content){

}

async function readIPFS(urlIPFS){

}

async function writeIdentity(company_uuid, event_type){
     var contract = new web3js.eth.Contract(contractABI, contractAddress);

}

async function readIdentity(company_uuid, event_type){
     var myAddress = 'ADDRESS_THAT_SENDS_TRANSACTION';
     var privateKey = Buffer.from('YOUR_PRIVATE_KEY', 'hex')
     var toAddress = 'ADRESS_TO_SEND_TRANSACTION';
     var contractABI =YOUR_CONTRACT_ABI;
     var contractAddress ="YOUR_CONTRACT_ADDRESS";
     var contract = new web3js.eth.Contract(contractABI, contractAddress);

     web3js.eth.getTransactionCount(myAddress).then(function(v){
            console.log("Count: "+v);
            count = v;
            var amount = web3js.utils.toHex(1e16);
            //creating raw tranaction
            var rawTransaction = {"from":myAddress, "gasPrice":web3js.utils.toHex(20* 1e9),"gasLimit":web3js.utils.toHex(210000),"to":contractAddress,"value":"0x0","data":contract.methods.transfer(toAddress, amount).encodeABI(),"nonce":web3js.utils.toHex(count)}
            console.log(rawTransaction);
            //creating tranaction via ethereumjs-tx
            var transaction = new Tx(rawTransaction);
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
            .on('transactionHash',console.log);
            contract.methods.balanceOf(myAddress).call()
            .then(function(balance){
              console.log(balance);
            });
        });
}


function generateNewToken(){
  return 'sxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function getPath(img){


}

async function compareBiometricImages(company_uuid, mobile_number, webhook_url, customer_event){
    var data = {"mobile_number": mobile_number, "customer_event": customer_event};
    var data = { face_one: getPath(face_two), face_two:getPath(face_two) };



    request.post({url:"http://127.0.0.1:7777/api", params:data}, function optionalCallback(err, httpResponse, body) {
          if (err) {
            console.error('post request failed:', err);

          }
          console.log('request successful!, server responded with:', body);
          return true;
     });

}


/////  #########  BEGIN  PUBLIC REST API FUNCTIONS     ##########

/**
 * @api {post} /v1/face_recognition Perform a Face Recognition Request
 * @apiName Identity
 * @apiGroup Identity
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} public_api_key public api_key.
 *
 * @apiHeader {String} private_api_key private api_key.
 *
 * @apiParam {String} image_one Base 64 Image .
 *
 * @apiParam {String} image_two Base 64 Image .
 *
 * @apiParamExample {json} Request-Example:
 *                { "image_one": "...", "image_two": "..."}
 *
 * @apiSuccess {Boolean} success  Result of the transaction.
 * @apiSuccess {String} message  Description of the transaction.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "It is a Match"
 *     }
 */
app.post('/v1/face_recognition', async (req, res) => {
    try {
        var api_key = req.get("api_key");
        console.log("post relationship ", api_key );
        var company = await isApiKeyValid(api_key);
        console.log(company);
        if(company.success){

            res.status(200).send({ success: true, message: 'Relationship requested'});
        } else {
            res.status(200).send({ success: false, message: 'Invalid api_key'});
        }
    } catch (e) {
        console.error(e);
        res.status(500).send({ success: false, message: 'error'});
    }
});




module.exports = app;

app.listen(8080, function () {
  console.log('Sidentity app running');
});
