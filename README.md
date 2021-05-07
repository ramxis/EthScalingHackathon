1) in root folder: `docker-compose up --build`
2) In Smart Contract folder: `npx hardhat run --network localhost scripts/deploy.js` 
3) Take the address and put it in here: `curl -XPOST -H "content-type: application/json" http://localhost:8082/json-rpc --data '{"jsonrpc":"2.0","method":"sendContractAddress","params": "ADDRESS","id":1}'`
4) Sending single transaction to orderer:
`curl -XPOST -H "content-type: application/json"  http://localhost:8080/sendTransaction --data '{"_to": "0xE838bC8b2D069CE43894143836fA974643646291","_value": 1}'`
5) Sengind batch transaction to orderer:
`curl -XPOST -H "content-type: application/json"  http://localhost:8080/sendbatchtransactions --data '{"_to1": "0xE838bC8b2D069CE43894143836fA974643646291","_value1": 1, "_nonce1": 1, "_to2": "0x077C1228a9F9A61734BD584987F77F59458E9AEb","_value2": 1, "_nonce2": 2}'`
