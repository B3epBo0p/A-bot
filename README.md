# A bot
This is a bot I made.

## Setup
When the bot joins your guild a guild document is automatically created in our database. This Document is automatically deleted when the bot leaves the guild, or the guild is disbanded. While using the bot you'll encounter commands (such as the `!add` command) which require registration with the bot. You'll be prompted to register in a direct message from the bot. *If you aren't getting a direct message from the bot, and believe this is a mistake check if you have direct messages from non-friends enabled (if this doesn't work you can use the `!bug` command).*  Doing this will prompt you to agree to the Terms of Use, and privacy policy. Once you've read them direct message the bot with the requested phrase, something along the lines of "I have read and understood the Terms of Service and Privacy Policy".

## Usage
Using the bot is relatively simple. If you come upon a task you'd like to add to the bot just use the `!add` command as demonstrated below. If the subject you are requesting doesn't exist you'll be prompted to create it. Next, you'll need to subscribe to it with the `!sub` command. Now you'll be able to see a comprehensive list of your upcoming tasks with the `!list` command. You may want to alter the behaviour of these commands, you can do so by using flags, as shown below.

## Commands
|Command|Description|Syntax|Example|Available flags
|---|---|---|---|---|
|Add|Adds a task to a subject. Prompts subject creation if subject doesn't exist.|`!add <Subject> <Due date> (<Description> <Due time> <Assignment type>)`|`!add MATH 7.2 22:00 "Finish page 81" hw`|-p
|Sub|Subscribes user to a particular subject.|`!sub <Subject>`|`!sub MATH`|-p
|Desub|Unsubscribes user from the specified subject.|`!desub <Subject>`|`!desub MATH`|-p
|List|Lists tasks from all the subjects the user is subscribed to.|`!list`|`!list`|-p,-a,-d
|Rm|Removes task by task ID|`!rm <Task id>`|`!rm 6019da2ab3b7a300b8fd9e87`|-p
|Src|Links the bots source code|`!src`|`!src`|-p
|Help|Displays this menu.|`!help`|`!help`|-p
|Blank|Removes a user profile|`!blank`|`!blank`|-p

## Flags
You may use flags like this `!list -p -a`.
|Flag name|Description|
|---|---|
|-p|Commands called with this flag, and responses to them won't be deleted.|
|-d|Requests details from commands, for instance task ids.|
|-a|Request all the relevant data, not just data linked to your user profile|
