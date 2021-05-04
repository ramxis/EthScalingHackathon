const { toUtf8CodePoints } = require('@ethersproject/strings');
const express = require('express');
const router = express.Router();
const { ethers } = require("ethers");
var Web3 = require('web3');
const {sendTransaction, sendBatchTransactions} = require('../buisnessFacade/ordererBF');
// const signTransaction = require('../util/signTransaction');

// let web3 = new Web3(Web3.givenProvider);
// let provider = new ethers.providers.Web3Provider(web3.currentProvider);
// let signer = provider.getSigner();

// router.get('/', function(req, res, next) {
//     res.render('index');
// });

// router.get('/sendtransaction', function(req, res, next) {

//     res.redirect('sendtransaction');
// });

// router.get('/sendbatchtransactions', function(req, res, next) {

//     console.log("Batching Transactions.....");
//     res.redirect('sendbatchtransactions');
// });

router.post('/sendtransaction', async(req, res, next) => {
    // console.log('transaction sending', Web3.givenProvider, Web3.currentProvider);

    // let web3 = new Web3(Web3.currentProvider);
    // let provider = new ethers.providers.Web3Provider(web3.currentProvider);
    // let signer = provider.getSigner();


    let tx = req.body.tx;
    // console.log(web3);

    // console.log(signer);

    // let tx = "0x022sd2sa2d32as2da1s2d";
    //let tx = await signTransaction(ethAddress,"web3.eth.accounts[0]",amount,web3);
    console.log('transaction signed');
    sendTransaction(tx);
    // console.log(provider.getBlockNumber())

    // let res = sendTransaction(tx);
    res.send(req.body);
});

router.post('/sendbatchtransactions', async(req, res, next) => {

    console.log("Batching Transactions.....");

    let txArray = req.body.tx;
    // let amount1 = req.body.amount1;
    // let ethAddress2 = req.body.ethAddress2;
    // let amount2 = req.body.amount2;

   // let web3 = new Web3(Web3.currentProvider);
    // let provider = new ethers.providers.Web3Provider(web3.currentProvider);
    // let signer = provider.getSigner();

    console.log(ethAddress1,amount1,ethAddress2,amount2);
    let tx1 =  await signTransaction(ethAddress1,web3.eth.accounts[0],amount1,web3);
    let tx2 =  await signTransaction(ethAddress2,web3.eth.accounts[0],amount2,web3);
    
    sendBatchTransactions();
    res.send("sendBatchTransactions");
});



module.exports = router;