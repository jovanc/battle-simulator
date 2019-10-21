# battle-simulator

Note:
development.env and production.env should be hidden, but for this test purpose it`s simplier to use app like this.


To run app (development env) please start mongoDB and run command:
- npm start


Scripts / Helpers (ENV=development,test or production):

NODE_ENV=development node scripts/clearDatabases.js   => Drop all documents from collections in Development environment

NODE_ENV=development node scripts/createFakeArmies.js 15   => create 15 armies in Development environment. If no flag, then the number of armies will be randome.


Testing features are in TODO list
- npm test
