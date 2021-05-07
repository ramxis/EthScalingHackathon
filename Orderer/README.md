# EthScalingHackathon

in root folder: `docker-compose up --build`
In Smart Contract folder: `npx hardhat run --network localhost scripts/deploy.js`
Take the address and put it in here:
`curl -XPOST -H "content-type: application/json" http://localhost:8081/json-rpc --data '{"jsonrpc":"2.0","method":"sendContractAddress","params": "ADDRESS","id":1}'`

Fire curl command to executor