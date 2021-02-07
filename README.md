# A bot
This is a bot I made.

## Setup
Okay, so you've invited the bot to your server. Now what? Well, the first thing you want to do is intialize the bot with the `!init` command. This creates a document in our database containing information relating to your server. Then you want to create your personal profile. This is done by requesting a command that requires a personal profile, such as the add command. `!add MATH 7.2 22:00 “Finish page 81” hw`. Doing this will prompt you to agree to the Terms of Use, and privacy policy. Once you've read them type `!agree`, please note that you may need to request a user specific command again, since the bot only looks for the `!agree` command for a few seconds after the fact.

## Usage
Using the bot is relatively simple. If you come upon a task you'd like to add to the bot just use the `!add` command as demonstrated bellow. If the subject you are requesting doesn't exist you'll be prompted to create it. Next you'll need to subscribe to it with the `!sub` command. Now you'll be able to see a comprehensive list of your upcoming tasks with the `!list` command.

## Commands
|Command|Description|Syntax|Example|Availible flags
|---|---|---|---|---|
|Add|Adds a task to a subject. Prompts subject creation if subject doesn't exist.|`!add <Subject> <Due date> (<Description> <Due time> <Assignment type>)`|`!add MATH 7.2 22:00 "Finish page 81" hw`|-p
|Sub|Subscribes user to a particular subject.|`!sub <Subject>`|`!sub MATH`|-p
|Desub|Unsubscribes user from the specified subject.|`!desub <Subject>`|`!desub MATH`|-p
|Init|Initializes a server file in database, probably the first command you want to use after inviting the bot.|`!init`|`!init`|-p
|List|Lists tasks from all the subjects the user is subscribed to.|`!list`|`!list`|-p,-a,-d
|Rm|Removes task by task ID|`!rm <Task id>`|`!list 6019da2ab3b7a300b8fd9e87`|-p
|Src|Links the bots source code|`!src`|`!src`|-p
|Help|Displays this menu.|`!help`|`!help`|-p
|Blank|Removes a user profile|`!blank`|`!blank`|-p

## Flags
|Flag name|Description|
|---|---|
|-p|Commands called with this flag, and responses to them won't be deleted.|
|-d|Requests details from commands, for instance task ids.|
|-a|Request all the relevant data, not just data linked to your user profile|
