# battle-simulator

Note:
development.env and production.env should be hidden, but for this test purpose it`s simplier to use app like this.


To run app (development env) please start mongoDB and run command:
- npm start


Scripts / Helpers (ENV=development,test or production):

Drop all documents from collections in Development environment
- NODE_ENV=development node scripts/clearDatabases.js

create 15 armies in Development environment. If no flag, then the number of armies will be randome.
- NODE_ENV=development node scripts/createFakeArmies.js 15

create new battle with 20 armies in Development environment. If no flag, then the number of armies will minimum number of armies to start battle - global settings.
- NODE_ENV=development node scripts/createNewBattle.js 20

Testing features are in TODO list
- npm test


------------------------------------------------
                 Task requests
------------------------------------------------


Battle Simulator
Task Author: Zoran Lazic

Task description

The goal of this task is to build an app simulator between 10 and n armies. The system consists of two functional segments.

REST API for triggering system commands
Battle simulator


REST API
The REST API is straightforward. Here is the list of the API Routes.

Add Army
Add the army to the system. This API accepts:

Name
Name of the army

Units
Number of units the army has (80 - 100)

Attack strategy
Based on the attacking strategy the army chose whom to attack

NOTE: Armies can be added before the start of the game. Armies cannot be to the game already in progress.

List games
List existing games, their status, units, ids.

Start a game
The API call to start the game. The game can start only if at least 10 armies have joined.


Return a specific game log
This API call is used to retrieve a full battle log for a specific game.

Reset game
The API call to reset the game in progress


Simulation of the battle
Once at least 10 armies have joined, the battle can start. When the start action is called, the armies start to attack.

Attack and strategies:

Random: Attack a random army

Weakest: Attack the army with the lowest number of units

Strongest: Attack the army with the highest number of units


Attack chances
Not every attack is successful. Army has 1% of success for every alive unit in it.

Attack damage
The army always does 0.5 damage per unit, when an attack is successful.

Received damage
For every whole point of received damage from the attacking army, one unit is removed from the attacked army.

Reload time
Reload time takes 0.01 seconds per 1 unit in the army.


The army is dead (defeated) when all units are dead.
The battle is over when there is one army standing.

THERE IS NO UI FOR THIS TASK

ADDITIONAL RULES

There are no blocking events.
Store all data in the database.
If the app stops at any moment, or the user stops it manually (kill the process) starting it again, the app must continue from the previous state. The same concept is also applied to reloads and attacks. If a reload is interrupted at any time when the application is started again, that army reload will continue from the same moment.
Log all actions. The log can be used to recreate a battle from any point in the log timeline.


ADDITIONAL RULE

Linter
You must use ESLint with Airbnb config


Database
MongoDB is a mandatory DB

------------------------------------------------
 Additional requests - after first code review
------------------------------------------------

- Dotenv is always in the root folder of the project. Make your script to load files from /.env.{environment}
- Structure of the project should be next: In the root folder, we have packages, index.js, node_modules and src folder, also other files/folder not related to the main code. Main code should be inside of the src folder. Please follow this structure
- Army router (example name) should just be ArmyController and return all code there, there is no need for additional separation into additional file “armyController”. This has more logic only if a army router is a mix of multiple army related controllers. But in your case, it is not.
- Please use this eslint config https://github.com/ezelohar/task-boilerplate/blob/master/.eslintrc-node ‑ Connect your account to preview links Using it will change a nice amount of your code. Please try to implement as much as you can. If you don’t want to implement some rule, please argument why.
- if (!name || !units || !attackStrategy) throw new Error(error.MISSING_PARAMETERS);Never use an if without bracelets . It should be like this https://prnt.sc/pnjqfs
- if (units < 80 || units > 100)Use some global constants for this units min/max numbers  
- Same as the above for all if’s where you have to confirm with some value “which can change” like max armies or units etc.
- Why just one here? https://prnt.sc/pnjsan findOne? Also, why not using the same code as startBattle from the battle controller?
- .ptch('/battle/start', catchAsyncError(BattleController.startBattle)) Is missing an Id. The route should be something like /battle/:battleId/start
- The documentation didn’t specify it, but there should be an API route to create a battle, where you will be adding armies and everything.
- Why mixed approach in writing functions here? https://prnt.sc/pnjwkb
- If battleUtils are utils, they shouldn’t work with the DB, e.g. think about them as pure functions to do some helping
