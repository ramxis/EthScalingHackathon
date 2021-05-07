const ethers = require('ethers');

var address_1 = require("@ethersproject/address");
var bytes_1 = require("@ethersproject/bytes");
var constants_1 = require("@ethersproject/constants");
var bignumber_1 = require("@ethersproject/bignumber");
var keccak256_1 = require("@ethersproject/keccak256");
var transaction_1 = require("@ethersproject/transactions")
var RLP = require("@ethersproject/rlp");

var transactionFields = [
  //{ name: "nonce", maxLength: 32, numeric: true },
  // { name: "gasPrice", maxLength: 32, numeric: true },
  // { name: "gasLimit", maxLength: 32, numeric: true },
  { name: "to", length: 20 },
  { name: "value", maxLength: 32, numeric: true },
  { name: "data" },
];

function serialize(transaction, signature) {
  var raw = [];
  transactionFields.forEach(function (fieldInfo) {
      var value = transaction[fieldInfo.name] || ([]);
      var options = {};
      if (fieldInfo.numeric) {
          options.hexPad = "left";
      }
      value = bytes_1.arrayify(bytes_1.hexlify(value, options));
      // Fixed-width field
      if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
          logger.throwArgumentError("invalid length for " + fieldInfo.name, ("transaction:" + fieldInfo.name), value);
      }
      // Variable-width (with a maximum)
      if (fieldInfo.maxLength) {
          value = bytes_1.stripZeros(value);
          if (value.length > fieldInfo.maxLength) {
              logger.throwArgumentError("invalid length for " + fieldInfo.name, ("transaction:" + fieldInfo.name), value);
          }
      }
      raw.push(bytes_1.hexlify(value));
  });
  var chainId = 0;
  if (transaction.chainId != null) {
      // A chainId was provided; if non-zero we'll use EIP-155
      chainId = transaction.chainId;
      if (typeof (chainId) !== "number") {
          logger.throwArgumentError("invalid transaction.chainId", "transaction", transaction);
      }
  }
  else if (signature && !bytes_1.isBytesLike(signature) && signature.v > 28) {
      // No chainId provided, but the signature is signing with EIP-155; derive chainId
      chainId = Math.floor((signature.v - 35) / 2);
  }
  // We have an EIP-155 transaction (chainId was specified and non-zero)
  if (chainId !== 0) {
      raw.push(bytes_1.hexlify(chainId)); // @TODO: hexValue?
      raw.push("0x");
      raw.push("0x");
  }
  // Requesting an unsigned transation
  if (!signature) {
      return RLP.encode(raw);
  }
  // The splitSignature will ensure the transaction has a recoveryParam in the
  // case that the signTransaction function only adds a v.
  var sig = bytes_1.splitSignature(signature);
  // We pushed a chainId and null r, s on for hashing only; remove those
  var v = 27 + sig.recoveryParam;
  if (chainId !== 0) {
      raw.pop();
      raw.pop();
      raw.pop();
      v += chainId * 2 + 8;
      // If an EIP-155 v (directly or indirectly; maybe _vs) was provided, check it!
      if (sig.v > 28 && sig.v !== v) {
          logger.throwArgumentError("transaction.chainId/signature.v mismatch", "signature", signature);
      }
  }
  else if (sig.v !== v) {
      logger.throwArgumentError("transaction.chainId/signature.v mismatch", "signature", signature);
  }
  
  raw.push(bytes_1.hexlify(v));
  raw.push(bytes_1.stripZeros(bytes_1.arrayify(sig.r)));
  raw.push(bytes_1.stripZeros(bytes_1.arrayify(sig.s)));
  return RLP.encode(raw);
}
function handleAddress(value) {
  if (value === "0x") {
      return null;
  }
  return address_1.getAddress(value);
}
function handleNumber(value) {
  if (value === "0x") {
      return constants_1.Zero;
  }
  return bignumber_1.BigNumber.from(value);
}
function _parse(rawTransaction) {
  var transaction = RLP.decode(rawTransaction);
  // transaction.length !== 9 && transaction.length !== 6
  // but we decresed the value by 3, since we don't have a nonce, gasPrice and gasLimit
  if (transaction.length !== 6 && transaction.length !== 3) {
      logger.throwArgumentError("invalid raw transaction", "rawTransaction", rawTransaction);
  }
  console.log(transaction)
  var tx = {
      // nonce: handleNumber(transaction[0]).toNumber(),
      // gasPrice: handleNumber(transaction[0]),
      // gasLimit: handleNumber(transaction[1]),
      to: handleAddress(transaction[0]),
      value: handleNumber(transaction[1]),
      data: transaction[2],
      chainId: 0
  };
  // Legacy unsigned transaction
  if (transaction.length === 6) {
      return tx;
  }
  try {
      tx.v = bignumber_1.BigNumber.from(transaction[3]).toNumber();
  }
  catch (error) {
      console.log(error);
      return tx;
  }
  tx.r = bytes_1.hexZeroPad(transaction[4], 32);
  tx.s = bytes_1.hexZeroPad(transaction[5], 32);
  if (bignumber_1.BigNumber.from(tx.r).isZero() && bignumber_1.BigNumber.from(tx.s).isZero()) {
      // EIP-155 unsigned transaction
      tx.chainId = tx.v;
      tx.v = 0;
  }
  else {
      // Signed Tranasaction
      tx.chainId = Math.floor((tx.v - 35) / 2);
      if (tx.chainId < 0) {
      }
      tx.chainId = 0;
      var recoveryParam = tx.v - 27;
      var raw = transaction.slice(0, 6);
      if (tx.chainId !== 0) {
          raw.push(bytes_1.hexlify(tx.chainId));
          raw.push("0x");
          raw.push("0x");
          recoveryParam -= tx.chainId * 2 + 8;
      }
      var digest = keccak256_1.keccak256(RLP.encode(raw));
      try {
          tx.from = transaction_1.recoverAddress(digest, { r: bytes_1.hexlify(tx.r), s: bytes_1.hexlify(tx.s), recoveryParam: recoveryParam });
      }
      catch (error) {
          console.log(error);
      }
      tx.hash = keccak256_1.keccak256(rawTransaction);
  }
  tx.type = null;
  return tx;
}

function parse(rawTransaction) {
  var payload = bytes_1.arrayify(rawTransaction);
  // Legacy and EIP-155 Transactions
  if (payload[0] > 0x7f) {
      return _parse(payload);
  }
  // Typed Transaction (EIP-2718)
  // switch (payload[0]) {
  //     case 1:
  //         return _parseEip2930(payload);
  //     default:
  //         break;
  // }
  // return logger.throwError("unsupported transaction type: " + payload[0], logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
  //     operation: "parseTransaction",
  //     transactionType: payload[0]
  // });
}

function compressTx(tx) {
    // parse the hex string to get an transaction object
    const parsed_tx = ethers.utils.parseTransaction(tx);
    // get the signature values
    const signature = {
      s: parsed_tx.s,
      r: parsed_tx.r,
      v: parsed_tx.v
    };
    delete parsed_tx.v;
    delete parsed_tx.r;
    delete parsed_tx.s;
    delete parsed_tx.from;
    delete parsed_tx.hash;
    delete parsed_tx.type;
    return serialize(parsed_tx, signature);
}
module.exports = {
    compressTx
}