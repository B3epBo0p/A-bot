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
								_id: mm.oid(),
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
			subber(msg,"$addToSet", "Successfully subscribed to subject.");
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
			subber(msg,"$pull", "Successfully unsubscribed from subject.");
		},
		help: {
			dscr: "Unsubscribes user from a particular subject.",
			syntax: "<Subject>",//same as sub
			ex:"MATH"
		},
		reqReg:true
	},
	{
		command: "init",
		cb: function(msg,args){
			mm.db.db("freq_access").collection("servers").insertOne({
				_id: msg.guild.id,
				owner: msg.guild.ownerID,
				joinTime: msg.guild.joinedTimestamp,
				initTime: msg.createdTimestamp,
				subjects: [],
				users: []
			},(er,res)=>{
				if (er){
					if (er.message.includes("duplicate key")) msg.reply("This server has already been initiated.");
					else throw er;
				}
				else msg.reply("Server successfully initiated.");
			});
		},
		help:{
			dscr:"Used to initialize the server document. One of the first commands you will use.",
			syntax:"",//removable?
			ex:""
		}
	},
	{
		command: "list",
		cb: async function(msg,args){//_should do that in Maine_ did that in Maine
			const ams = [],
			all = args.flags.includes("-a");
			const preliminary = (await mm.maindb.collection("users").findOne({
					_id:msg.author.id
				},
				{
					projection:{
						subjects: 1,
						_id: 0
					}
				})).subjects;
			//console.log(preliminary);
			const result = (await mm.maindb.collection("servers").findOne({
					_id:msg.guild.id
				},
				{
					projection:{
						_id:0,
						subjects:1/*,
						subjects:{
							$elemMatch:{
								_id:{
									$in: preliminary
								}
							}
						}*/
					}
			}));
			const edic = {
				"test": "📜",
				"proj": "🌐",
				"hw": "🥨"
			};
			const embed = new Ds.MessageEmbed().setTitle(all?"All assignments":"Your assignments:");
			console.log(result.subjects[0].tasks);
			console.log("--------\nthe -a tag decides between");
			console.log(result.subjects.map(x=>x.tasks));
			console.log("and");
			console.log(result.subjects.filter(val=>preliminary.map(x=>String(x)).includes(String(val._id))).map(x=>x.tasks));
			for(const ob of all?result.subjects:result.subjects.filter(val=>preliminary.map(x=>String(x)).includes(String(val._id)))){
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
			/*console.log(ams);
			console.log(ams.append);*/
			ams.push(msg.reply(embed));
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
			console.log("--");
			//console.log(ams);
			//return ["test","test but 2"];
			return ams;
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
		command: "purge",
		cb: function(msg,args){
			if(msg.author.id == msg.guild.ownerID){
				db.list().then(keys =>{
					for(const key of keys){
						console.log(`deleting entry ${key}`);
						db.delete(key);
					}
				});
				msg.reply("purging database");
			}
			else msg.reply("Insufficient permissions.");

		},
		help: {
			dscr: "Clears database."
		}
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
		command: "test",
		cb: function(msg,args){
			const embed = new Ds.MessageEmbed()
			.setTitle("Okay");
			embed.addField("This", "Should work");
			embed.setColor("#FFFFFF");
			msg.reply(embed);
		},	
		help: {
			dscr:"For testing purposes only.",
			syntax:"",
			ex:""//removable
		}
	},
	{
		command: "blank",
		cb: async function(msg,args){
			await mm.maindb.collection("users").deleteOne({_id:msg.author.id});
			return [msg.reply("All information we had on you have been deleted. Good Luck out there.")];
		},
		help:{
			dscr:"Removes the user profile.\nNote: This doesn't remove the tasks the user has added since we don't track task authors.",
			syntax:"",
			ex:""//removable
		},
		reqReg:true
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
	})

	clint.login(process.env.TOKEN);
});
async function isRegistered(msg){//untested
	if(!await mm.maindb.collection("users").findOne({_id:msg.author.id})){
		msg.reply("Hello, it seems that you haven't agreed to our Terms of Service and Privacy Policy yet. You can do so by reading them here https://bit.ly/3nC06gH, and typing 'I have read and understood the above specified Terms of Service and Privacy Policy'.");
		const msgc = await msg.channel.awaitMessages(x=>x.author.id==msg.author.id && x.content === 'I have read and understood the above specified Terms of Service and Privacy Policy',{max:1,time:10000,errors:["time"]});
		if(msgc.first()){
			console.log("first fired");
			msg.reply("Hold on, adding you to the database.");
			await mm.maindb.collection("users").insertOne({
				_id:msg.author.id,
				preferences:{},
				subjects:[]
			});
			msg.reply("Everything should be set up now.");
			return true;
		}
	}
	else return true;
}
function getById(msg){
	return mm.maindb.collection("servers").findOne({
			_id:msg.guild.id,
			subjects: {$elemMatch: {name: msg.content}}
		},
		{
			projection:{
				_id:0,
				"subjects.$":1
			}
	});
}
async function subber(msg,sub,res){
	const o = await getById(msg);
			console.log(o);
			const update = {};
			update[sub] = {subjects:o.subjects[0]._id}
			if(o){
				mm.maindb.collection("users").updateOne({
					_id:msg.author.id
				},
				update);
				if(res)msg.reply(res);
			}
			else msg.reply("Something went wrong.");
}
