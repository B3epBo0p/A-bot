# A bot
This is a bot I made.

## Setup
When the bot joins your guild a guild document is automatically created in our database. This Document is automatically deleted when the bot leaves the guild, or the guild is disbanded. While using the bot you'll encounter commands (such as the `!add` command) which require registration with the bot. You'll be prompted to register in a direct message from the bot. *If you aren't getting a direct message from the bot, and believe this is a mistake check if you have direct messages from non-friends enabled (if this doesn't work you can use the `!bug` command).*  Doing this will prompt you to agree to the Terms of Use, and privacy policy. Once you've read them direct message the bot with the requested phrase, something along the lines of "I have read and understood the Terms of Service and Privacy Policy".

## Usage
Using the bot is relatively simple. If you come upon a task you'd like to add to the bot just use the `!add` command as demonstrated below. If the subject you are requesting doesn't exist you'll be prompted to create it. Next, you'll need to subscribe to it with the `!sub` command. Now you'll be able to see a comprehensive list of your upcoming tasks with the `!list` command. You may want to alter the behaviour of these commands, you can do so by using flags, as shown below.

## Commands
*Please note that:*
1. The examples below use the `!` as their prefix. This can be substituted for a mention of the bot like this `@HWBot list`, or a custom prefix which can be modified via the `!prefix` command (more information below)
2. The types (such as `<Description>`), that are in parentheses are optional.
3. The syntax for flags, and arguments can be found below the Commands section.

|Command|Description|Syntax|Example|Available flags
|---|---|---|---|---|
|Add|Adds a task to a subject. Prompts subject creation if subject doesn't exist.|`!add <Subject> <Due date> (<Description> <Due time> <Assignment type>)`|`!add MATH 7.2 22:00 "Finish page 81" hw`|-p
|Sub|Subscribes user to a particular subject.|`!sub <Subject>`|`!sub MATH`|-p
|Desub|Unsubscribes user from the specified subject.|`!desub <Subject>`|`!desub MATH`|-p
|List|Lists tasks from all the subjects the user is subscribed to.|`!list`|`!list`|-p,-a,-d
|Rm|Removes task by task ID|`!rm <Task id>`|`!rm 6019da2ab3b7a300b8fd9e87`|-p
|Prefix|Changes the bots designated prefix|`!prefix <Prefix>`| `!prefix ?`|-p
|Src|Links the bots source code|`!src`|`!src`|-p
|Help|Displays this menu.|`!help`|`!help`|-p
|Blank|Removes a user profile|`!blank`|`!blank`|-p

### Arguments
Some arguments have specific requirements to be recognized.
|Argument type|Requirement|
|---|---|
|Subject|2 to 5 capital letters, that can be followed by a number
|Due date|Date in the DD.MM format. If the specified date has already passed this year it's automatically transferred to the next (for example if it's currently 28.2.2021, and the user specifies  25.2 as the due date it's interpreted as 25.2.2022).
|Description|an unlimited number of characters between double quotes
|Due time|Time in military format (hh:mm).
|Assignment type|Currently only three options are supported hw, proj, test
|Task id|A series of alphanumeric characters. Please note this series is **not** user generated, it's instead generated from commands such as `!list -d`
|Prefix|Any series of characters that aren't numbers, letters, or spaces.

### Flags
You may use flags like this `!list -p -a`.
|Flag name|Description|
|---|---|
|-p|Commands called with this flag, and responses to them won't be deleted.|
|-d|Requests details from commands, for instance task ids.|
|-a|Request all the relevant data, not just data linked to your user profile|
