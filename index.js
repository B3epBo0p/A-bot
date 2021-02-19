require('dotenv').config();

const events = require('events');
const em = new events.EventEmitter();//oneliner doesn't work here
//const table = require("table").table,//this I don't use, that is sad
 mm = (function(){
	this.lib = require('mongodb');
	this.client = this.lib.MongoClient;
	this.oid = this.lib.ObjectId;

	this.collections = {};

	this.client.connect(process.env.MANGA, function(err,dbc){
		if(err) throw err;
		console.log("Mongo: connection successful.");
		this.db = dbc;
		
		this.maindb = dbc.db("freq_access");
		this.ready = true;
		em.emit("mongoLoaded");
	}.bind(this));
	
	return this;
}()),
Ds = require('discord.js'),
clint = new Ds.Client(),
prefix = '!',
commandTree = [
	{
		command: "add",
		cb: function(msg,args){
			const fObj = args,
			ams = [];
			for(const cArg of ["subject", "dateObj"]) if(!fObj[cArg]){
				ams.push(msg.reply(`The ${cArg} argument either isn't present, or isn't formatted correctly.`));
				console.log(fObj);
				return;
			} 
			if (fObj.dateObj < new Date()) fObj.dateObj.setYear(fObj.dateObj.getUTCFullYear()+1);//COMMENTED OUT FOR TESTING PURPOSES COMMENT BACK IN

			console.log("successfully finished execution");
			console.log(fObj);
			//console.log(fObj.date.split(".").map(x =>parseInt(x)));
			
			!async function(){
				const insertFormat = {
					_id: mm.oid(),
					dscr: fObj.description,
					dateObj: fObj.dateObj,
					type: fObj.type
				},
				 updateRet = await mm.maindb.collection("servers").updateOne({
					_id:msg.guild.id,
					subjects: {$elemMatch: {name: fObj.subject}}
				},
				{
					$push: {
						"subjects.$.tasks": insertFormat
					}
				});
				if(!updateRet.modifiedCount){
					const reply = await msg.reply("The specified category doesn't exist (**ye**e**t**)\nWould you like to amend that?");
					ams.push(reply);
					reply.react("✔️");
					reply.react("❌");
					const reactions = await reply.awaitReactions((r)=>r.emoji.name==="✔️"||r.emoji.name==="❌",{max:1,time:7000, erros: ["time"]});
					if(reactions.first().emoji.name==="✔️") await mm.maindb.collection("servers").updateOne({
						_id:msg.guild.id
					},
					{
						$push:{
							subjects: {
								name: fObj.subject,
								tasks: [
									insertFormat
								]
							}
						}
					});
				}
				else ams.push(msg.reply("Successfully added."));
			}();
			return ams;
		},
		help: {
			dscr: "Adds an entry.",
			syntax: "<Subject> <Due date> [<Description>] [<Due time>] [<Assignment type>]",
			ex: "MATH 8.2 \"The whole of page 81\" 22:00 hw"
		},
		reqReg:true
	},
	{
		command:"bug",
		cb:async function(msg, args){
			clint.users.cache.get(process.env.AUTHORID).send(`Bug Report.\nFrom:${msg.author.username}, with id of ${msg.author.id}.\n${args.description}`);
			return [];
		},
		help:{
			dscr: "Report a bug.",
			syntax: "<Description>",
			ex:"\"If you don't see this I've encountered a bug!\""
		} 
	},
	{
		command: "sub",
		cb: async function(msg,args){ 
			return subber(args.subject,msg,"$addToSet", "Successfully subscribed to subject.");
		},
		help:{
			dscr: "Subscribes user to a subject of their choosing.",
			syntax: "<Subject>",
			ex:"MATH"
		},
		reqReg:true
	},
	{
		command: "desub",
		cb: function(msg,args){
			return  subber(args.subject,msg,"$pull", "Successfully unsubscribed from subject.");
		},
		help: {
			dscr: "Unsubscribes user from a particular subject.",
			syntax: "<Subject>",//same as sub
			ex:"MATH"
		},
		reqReg:true
	},
	{
		command: "list",
		cb: async function(msg,args){//_should do that in Maine_ did that in Maine
			const ams = [],
			all = args.flags.includes("-a")
			query = await mm.maindb.collection("servers").findOne({
				_id:msg.guild.id
			},
			{
				projection:{
					"_id":0,
					"users":{
						$elemMatch:{
							"_id": msg.author.id
						}
					}
				}
			}),
			edic = {
				"test": "📜",
				"proj": "🌐",
				"hw": "🥨"
			},
			taskQuery = await mm.maindb.collection("servers").findOne({
				_id:msg.guild.id
			},
			{
				projection:{
					"_id":0,
					"subjects":{
						$elemMatch:{
							"name":{
								$in:query.users[0].subjects
							}
						}
					}
				}
			})
			embed = new Ds.MessageEmbed().setTitle(all?"All assignments":"Your assignments:");
			/*console.log(query);
			console.log(query.users);
			console.log(query.users[0]);
			console.log(query.users[0].subjects);*/
			for(const ob of taskQuery.subjects){
				eqS = "".padStart(10,"-");
				embed.addField(`${eqS}${ob.name}${eqS}`,`total: ${ob.tasks.length}`, false);
				for(const task of ob.tasks){
					console.log(task);
					//embed.addField(task.dateObj.toLocaleDateString(),task.dscr, true);
					console.log(task.dscr);
					embed.addField(`${task.dateObj.getDate()}.${task.dateObj.getMonth()+1} ${edic[task.type]}`,`${task.dscr} ${args.flags.includes("-d")?"\n("+task._id+")":""}`, true);//_id only in debug mode
				}
			}
			
			return [msg.reply(embed)];
			/*console.log(result.subjects[0].tasks);
			console.log("--------\nthe -a tag decides between");
			console.log(result.subjects.map(x=>x.tasks));
			console.log("and");
			console.log(result.subjects.filter(val=>preliminary.map(x=>String(x)).includes(String(val._id))).map(x=>x.tasks));*/
			/*for(const ob of all?result.subjects:result.subjects.filter(val=>preliminary.map(x=>String(x)).includes(String(val._id)))){
				console.log(ob.name);
				eqS = "".padStart(10,"-");
				embed.addField(`${eqS}${ob.name}${eqS}`,`total: ${ob.tasks.length}`, false);
				for(const task of ob.tasks){
					console.log(task);
					//embed.addField(task.dateObj.toLocaleDateString(),task.dscr, true);
					console.log(task.dscr);
					embed.addField(`${task.dateObj.getDate()}.${task.dateObj.getMonth()+1} ${edic[task.type]}`,`${task.dscr} ${args.flags.includes("-d")?"\n("+task._id+")":""}`, true);//_id only in debug mode
				}
			}
			ams.push(msg.reply(embed));
			console.log("--");
			return ams;*/
			/*console.log(ams);
			console.log(ams.append);*/
			
			//console.log(ams);
			/*const data = [];
			for(const ob of result.subjects){
				const row = [ob.name];
				console.log(ob);
				for(const task of ob.tasks){
					row.concat([task.descr,task.dateObj.toString(),task.type,]);
				}
			}*/
			/*msg.reply("\n```"+table([
				["so", "this"],
				["like", "works"],
				["right", "?"],
				["okay", "but"],
				["what", "if"],
				["I", "leave"],
				["a"],
				["space"]
			])+"```");*/
			//console.log(ams);
			
			//console.log(ams);
			//return ["test","test but 2"];
			
		},
		help: {
			dscr:"Lists database entries.",
			syntax:"",//removable?
			ex:""
		},
		reqReg:true
	},
	{
		command:"rm",//subject argument technically unnecessary
		cb: async function(msg,args){
			console.log(args);
			if((await mm.maindb.collection("servers").updateOne({
				_id: msg.guild.id
			},
			{
				$pull:{
					"subjects.$[].tasks":{
						_id: mm.oid(args.mongoId)
					}
				}
			})).modifiedCount) return [msg.reply("Successfully removed.")];
			else return[msg.reply("Something went wrong")];
		},
		help:{
			dscr:"Removes a task specified by an id.\nNote: The bot scans for tasks that are no longer needed every 24 hours, you don't have to remove old tasks manually.",
			syntax:"<Subject> <Task Id>",
			ex:"MATH 6019da2ab3b7a300b8fd9e87"
			
		},
		reqReg:true
	},
	{
		command: "src",
		cb: function(msg,args){
			console.log("\tReplying to src.");
			return [msg.reply("The source code for this bot can be found here: <https://github.com/B3epBo0p/A-bot>")];
		},
		help: {
			dscr:"Replies with the source code to this bot.",
			syntax:"",//removable?
			ex:""
		}
	},
	{
		command: "help",
		cb: function(msg,args){
			return [msg.reply("All available commands can be found here: <https://github.com/B3epBo0p/A-bot/blob/main/README.md#commands>")];
		},
		help: {
			dscr:"Displays this menu.",
			syntax:"",
			ex:""//removable
		}
	},
	{
		command: "blank",
		cb: async function(msg,args){
			const servers = (await mm.maindb.collection("users").findOne({_id:msg.author.id},
			{
				projection:{
					"_id":0,
					"servers":1
				}
			})).servers;
			if(servers){
				await Promise.all(servers.map(id=>mm.maindb.collection("servers").updateOne({_id:id},{
					$unset:{
						"users.$[user].id":""
					}
				},
				{
					arrayFilters:[{"user.id":msg.author.id}]
				})));
				await mm.maindb.collection("users").deleteOne({_id:msg.author.id});
				return [msg.reply("All information we had on you have been deleted. Good Luck out there.")];
			}
			else [msg.reply("No account found with your id, you may be in the clear")];
		},
		help:{
			dscr:"Removes the user profile.\nNote: This doesn't remove the tasks the user has added since we don't track task authors.",
			syntax:"",
			ex:""//removable
		},
		reqReg:true
	},
	{
		command:"test",
		cb: async function(msg,args){
			//console.log((await msg.guild.members.fetch()).map(x=>x.user.id));
			console.log(await msg.guild.members.fetch(msg.author.id));
			console.log("--------------------------------");
			console.log(await Promise.all((clint.guilds.cache.map(async guild=> (await guild.members.fetch(msg.author.id)).guild.id))));
			//console.log(await Promise.all((await clint.guilds.cache.map(guild=>guild.members.fetch(msg.author.id)))));
			//console.log(await client.guilds.cache.mapmembers.fetch(msg.author.id));
			return [];
		}
	}

];
console.log(em);
em.on("mongoLoaded", ()=>{
	clint.on('ready', ()=>{
		console.log('Logged in.');
	});
	clint.on('message', async function(msg){
		if(!msg.content.startsWith(prefix)) return;//guard clause
		msg.content = msg.content.replace(prefix, "");
		//console.log("command registered");
		!async function(){
			let fired = false;
			/*console.log("\n");
			console.log(msg.content.split(" ")[0]);
			console.log(commandTree.map(x=>x.command));*/
			for(const cObj of commandTree) if(msg.content.split(" ")[0] == cObj.command){
				if((!cObj.reqReg) || (cObj.reqReg && await isRegistered(msg))){
					msg.content = msg.content.replace(new RegExp(`${cObj.command}\\s*`), "");
					console.log(msg.content);
					//
					const fObj = {dateObj: new Date(),type:"hw",flags:[]};
					fObj.dateObj.setHours(0,0,0,0);
					!function(){
						const queries = [
							["subject", /[A-Z]{2,5}\d?/],
							["time", /\d\d?:\d\d?/],
							["date", /\d\d?\.\d\d?/],
							["mongoId", /[a-z0-9]{24}/],
							["flags", /\-[a-z]+/g]
						];
						for(const part of msg.content.split('"').entries()){
							if(!(part[0]%2)){//is command
								//console.log("command");
								if(part[1].includes("test")) fObj.type = "test";
								else if(part[1].includes("proj")) fObj.type = "proj";//continue
								for(const arg of queries.entries()){
									console.log("lopp start");
									const match = part[1].match(arg[1][1]),
									temp = match?match[0]:undefined;
									console.log(match);
									//console.log(part[1].match(arg[1][1]));
									//seems impractical
									//console.log(temp);
									//console.log(arg[1][0]);
									if(temp){
										if(arg[1][0]=="date"){
											console.log("dated");
											const tf = temp.split(".").map(x=>parseInt(x));
											fObj.dateObj.setDate(tf[0]);//variables undefined for some reason
											fObj.dateObj.setMonth(tf[1]-1);
											console.log(tf);
										}
										else if(arg[1][0]=="time"){
											const tf = temp.split(":").map(x=>parseInt(x));
											fObj.dateObj.setHours(tf[0]);
											fObj.dateObj.setMinutes(tf[1]);
											console.log(tf);
										}
										else if(arg[1][0]=="flags"){
											//console.log(part[1].match(arg[1][1]));
											//fObj.flags.push(temp);
											console.log("in flags pre loop");
											for(const matchAspect of match) fObj.flags.push(matchAspect);
											console.log("in flags post loop");
										} 
										else fObj[arg[1][0]] = temp;
										queries.splice(arg[0],1);
									}
								}					
							}
							else{
								//console.log("dscr");
								fObj.description = part[1];//is description
							}
							console.log("loop finished");
						}
					}();
					//
					fired = true;
					console.log(fObj);
					const step = await cObj.cb(msg, fObj);
					console.log("successfully evalueated step");
					console.log(step);
					const ret = (await Promise.all(step));
					console.log("successfully evaluated ret");
					if(!fObj.flags.includes("-p")) for(const am of ret.concat(msg)) am.delete({timeout: 13000, reason: "Deletion due to non permanence."});
					break;
				}
			}
			if(!fired) console.log("Unknown command.");
		}();
		//console.log("Exiting event handler.")
	});
	clint.on("guildCreate", async function(guild){
		console.log(`Created guild document entry ${guild.id}`);
		/*const zdusers = await (await guild.members.fetch()).map(x=>({id: x.user.id, subjects:[]}));
		console.log(zdusers);*/
		await mm.maindb.collection("servers").insertOne({
				_id: guild.id,
				owner: guild.ownerID,
				joinTime: guild.joinedTimestamp,
				subjects: [],
				users: []
			}
		);
		
		/*mm.maindb.collection("servers").insertOne({
				_id: guild.id,
				owner: guild.ownerID,
				joinTime: guild.joinedTimestamp,
				subjects: [],
				users: zdusers
			},(er,res)=>{
				if (er){
					if (er.message.includes("duplicate key")) console.log("the server has already been initiated");
					else throw er;
				}
				else console.log("Server successfully initiated.");
		});*/
	});
	clint.on("guildDelete", async function(guild){
		console.log("delete registered");
		//console.log(await guild.members.fetch());
		const server = await mm.maindb.collection("servers").findOne({
			_id: guild.id
		},
		{
			projection:{
				_id:0,
				users:1,
				subjects:1
			}
		});
		
		/*for (const guild of await clint.guilds.cache){
			for(const member of await guild.members.fetch()){

			}
		}*/
		if(server.users){
			for(const userId of server.users){
				mm.maindb.collection("users").updateOne({
					_id: userId
				},
				{
					$pull:{
						subjects:{
							_id: {
								$in: server.subjects
							}
						}
					}
				});
			}
			try{
				await mm.maindb.collection("servers").deleteOne({
					_id: guild.id
				});
			}
			catch(e){
				if(e) throw e;
				else console.log(`${guild.id} successfully deleted`);
			}
			console.log("delete finished");
		}
		else{
			console.log("erroccured");
			console.log(server);
		} 
		
	});
	clint.on("guildMemberAdd", async function(member){
		mm.maindb.collection("users").updateOne({
			_id:member.id
		},
		{
			$push:{
				servers:member.guild.id
			}
		});
		mm.maindb.collection("servers").updateOne({
			_id:member.guild.id
		},
		{
			$push:{
				users:{
					"id": member.id,
					"subjects": []
				}
			}
		});
	});
	clint.on("guildMemberRemove", async function(member){
		mm.maindb.collection("users").updateOne({
			_id:member.id
		},
		{
			$pull:{
				servers:member.guild.id
			}
		});
		mm.maindb.collection("servers").updateOne({
			_id:member.guild.id
		},
		{
			$pull:{
				users: {id: member.id}
			}
		});
	});

	clint.login(process.env.TOKEN);
});
async function isRegistered(msg){//untested
	if(!await mm.maindb.collection("users").findOne({_id:msg.author.id})){
		msg.reply("Hello, it seems that you haven't agreed to our Terms of Service and Privacy Policy yet. You can do so by reading them here <https://bit.ly/3nC06gH>, and typing 'I have read and understood the above specified Terms of Service and Privacy Policy'.");
		const msgc = await msg.channel.awaitMessages(x=>x.author.id==msg.author.id && x.content === 'I have read and understood the above specified Terms of Service and Privacy Policy',{max:1,time:10000,errors:["time"]});
		if(msgc.first()){
			console.log("first fired");
			msg.reply("Hold on, adding you to the database.");
			await mm.maindb.collection("users").insertOne({
				_id:msg.author.id,
				preferences:{},
				servers:[await Promise.all((clint.guilds.cache.map(async guild=> (await guild.members.fetch(msg.author.id)).guild.id)))],
				subjects:[]
			});
			await mm.maindb.collection("servers").updateOne({
				_id:msg.guild.id
			},
			{
				$push:{
					users: {
						_id: msg.author.id,
						subjects: []
					}
				}
			})
			msg.reply("Everything should be set up now.");
			return true;
		}
	}
	else return true;
}
async function subber(subject,msg,sub,res){
	let existsCheck;
	try{
		existsCheck = (await mm.maindb.collection("servers").findOne({
			_id:msg.guild.id,
			subjects: {$elemMatch: {name:subject}}
		},
		{
			projection:{
				"_id":0,
				"subjects.$":1
			}
		}));
	}
	catch(e){
		console.log(e);
		return [msg.reply("Something went terribly wrong.")];
	}
	if(existsCheck instanceof Array) return [msg.reply("the specified subject does not exist")];
	const update = {
		
	};
	update[sub] = {
			"users.$[user].subjects": subject
	};
	console.log(update);
	try{
		if(await mm.maindb.collection("servers").updateOne({
		_id:msg.guild.id
		},
		{
			$addToSet:{
				"users.$[user].subjects": subject
			}
		},
		{
			arrayFilters: [{"user._id":msg.author.id}]
		}).modifiedCount) return [msg.reply(res)];
		else return [msg.reply("no modification")];
		
	}
	catch(e){
		console.log(e);
		return [msg.reply("Something went terribly wrong.")];
	}
	/*try{
		mm.maindb.collection("servers").updateOne(
		{
		'_id': msg.guild.id
		},
		[
			{
			'$unwind': {
			'path': '$subjects'
			}
		}, {
			'$match': {
			'subjects.name': 'MAT'
			}
		}, {
			'$unwind': {
			'path': '$users'
			}
		}, {
			'$match': {
			'users._id': '96609466178355200'
			}
		}, {
			'$addFields': {
			'users.subjects': {
				'$concatArrays': [
				'$users.subjects', [
					'$subjects._id'
				]
				]
			}
			}
		}
		]);
	}
	catch(e){
		throw e;
	}*/
	
}