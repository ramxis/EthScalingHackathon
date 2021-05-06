var web3;
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
    console.log("inside signing transactions")
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    var _to = $('#toAddress').val();
    var _value = web3.utils.toWei($('#amount').val(), "ether");
    console.log(_value);
    var tx = {
        from: account,
        value: _value,
        // data: func.data,
        to: _to
    }
    var signedTx = await web3.eth.sendTransaction(tx);
    console.log(signedTx);
    // // console.log("signing transactions....")

    // const signedTx = await _web3Provider.eth.signTransaction(tx);
    // return signedTx;
}
    