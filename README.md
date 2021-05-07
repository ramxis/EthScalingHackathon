1) in root folder: `docker-compose up --build`
2) In Smart Contract folder: `npx hardhat run --network localhost scripts/deploy.js` 
3) Take the address and put it in here: `curl -XPOST -H "content-type: application/json" http://localhost:8082/json-rpc --data '{"jsonrpc":"2.0","method":"sendContractAddress","params": "ADDRESS","id":1}'`
4) Sending this message to the orderer:
`curl -XPOST -H "content-type: application/json"  http://localhost:8080/sendTransaction --data '{"_to": "0xE838bC8b2D069CE43894143836fA974643646291","_value": 1}'`