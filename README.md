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
