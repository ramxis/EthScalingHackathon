var web3;
var Tx = require('ethereumjs-tx').Transaction;
var keythereum = require("keythereum");
$(document).ready(function() {
    console.log("script loaded");
    if (typeof  window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        web3=new Web3(window.ethereum);
    }
    
    web3.eth.defaultAccount = web3.eth.accounts[0];
    console.log(web3.eth.defaultAccount);
    console.log("web3 version is:" + web3.version.api);
});


async function signTransaction() {
    console.log("inside signing transactions");
    var privateKey = Buffer.from('2ff716e2adfb575da83db6191bccb4506237050fd924312b80d3665c9ed95741', 'hex');

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    var _to = $('#toAddress').val();
    var _value = web3.utils.toWei($('#amount').val(), "ether");


    //
    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
    var tx = {
        from: account,
        value: _value,
        // data: func.data,
        to: _to
    }
    var signedTx = await web3.eth.sendTransaction(tx);
    console.log(signedTx);
    // create a raw tx
    var tx = new Tx(tx);
    tx.sign(privateKey);

    // var serializedTx = tx.serialize();
    // console.log('serialzied');
    // var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    // console.log(receipt);
    // // console.log("signing transactions....")

    // const signedTx = await _web3Provider.eth.signTransaction(tx);
    // return signedTx;
}
    