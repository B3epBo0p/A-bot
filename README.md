# A bot
This is a bot I made.

## Setup
**The setup process is fully automatic.** When the bot joins your guild a respective guild document is automatically created in our database. This document is automatically deleted when the bot leaves the guild, or the guild is disbanded. If the bot is offline when such an event takes place it automatically creates or deletes a guild document when it goes back online.
## Registration
While using the bot you'll encounter commands which require registration with the bot (`!add` for instance). When you attempt to use such commands, while not registered you'll be prompted to register in a direct message from the bot. *If you aren't getting a direct message from the bot, and believe this is a mistake check if you have direct messages from non-friends enabled (if this doesn't work you can use `!bug` to report the issue).*  The message will prompt you to agree to the Terms of Use, and privacy policy. Once you've read them, direct message the bot with the requested phrase.

## Basic usage
 Your day-to-day interaction with the bot will look something like this:
 1. Encounter a task you want to add.
 2. Use the `!add` command to add it. (If you aren't subscribed to the task's subject, you can use `!sub`)
 3. Use `!list` to see your current tasks.

 The bot will automatically delete commands and their results after 13 seconds. This behaviour can be avoided by using the `-p` flag.

## Commands
*Please note that:*
1. The examples below use an `!` as their prefix. This can be substituted for a mention of the bot (like this `@HWBot list`), or a custom prefix which can be modified via the `!prefix` command (more information below).
2. The arguments (such as `<Description>`), that are in parentheses are optional.
3. The syntax for flags and arguments can be found below the Commands section.

|Command|Description|Syntax|Example|Available flags
|---|---|---|---|---|
|Add|Adds a task to a subject. Prompts subject creation if subject doesn't exist.|`!add <Subject> <Due date> (<Description> <Due time> <Assignment type>)`|`!add MATH 7.2 22:00 "Finish page 81" hw`|-p
|Sub|Subscribes user to a particular subject. (To see all the subjects in a particular guild, you can use `!list -a`. More on Flags below.)|`!sub <Subject>`|`!sub MATH`|-p
|Desub|Unsubscribes user from the specified subject.|`!desub <Subject>`|`!desub MATH`|-p
|List|Lists tasks from all the subjects the user is subscribed to.|`!list`|`!list`|-p,-a,-d
|Rm|Removes task by task ID. (You can get task IDs with `!list -d`.)|`!rm <Task id>`|`!rm 6019da2ab3b7a300b8fd9e87`|-p
|Prefix|Changes the bot's designated prefix.|`!prefix <Prefix>`| `!prefix ?`|-p
|Src|Links the bots source code.|`!src`|`!src`|-p
|Help|Responds with a link to this website.|`!help`|`!help`|-p
|Blank|Removes all of the information pertaining to the user. (Does **not** remove tasks, or subjects the user has created, as their creation isn't linked to the user in our database. Doesn't delete command results that were requested with `-p` either.)|`!blank`|`!blank`|-p

### Arguments
Some arguments need to fulfill specific criteria to be recognized.
*Note: The subject argument supports unicode characters.*
|Argument type|Requirement|
|---|---|
|Subject|2 to 5 capital letters, that can be followed by a number.
|Due date|Date in the DD.MM format. If the specified date has already passed this year it's automatically transferred to the next (for example if it's currently 28.2.2021, and the user specifies  25.2 as the due date it's interpreted as 25.2.2022).
|Description|An unlimited number of characters between double quotes.
|Due time|Time in military format (hh:mm).
|Assignment type|Currently only three options are supported hw, proj, test.
|Task id|A series of alphanumeric characters. Please note this series is **not** user generated, it's instead generated from commands such as `!list -d`.
|Prefix|Any series of characters that aren't numbers, letters, or spaces.

### Flags
You may use flags like this `!list -p -a`.
|Flag name|Description|
|---|---|
|-p|Commands called with this flag, and bot responses to them won't be deleted.|
|-d|Requests details from commands, for instance, task IDs.|
|-a|Request all the relevant data, not just data linked to your user profile.|
