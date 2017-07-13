var request;

if(typeof window!="undefined") {
	// super quick and dirty browser wrapper
	request=function(ops,cb) {
		var x=new XMLHttpRequest();
		x.onreadystatechange=function() {
			if(x.readyState !== XMLHttpRequest.DONE)return;
			cb(null,{statusCode:x.status},x.responseText?JSON.parse(x.responseText):[]);
		}

		x.open(ops.method,ops.uri);
		x.setRequestHeader('Content-Type','application/json');
		x.setRequestHeader('Accept','application/json');
		x.send(JSON.stringify(ops.json))
	}
}
else {
	// Simple, straight forward node
	request=require('request');
}


var API= {
	domain_root: "www.hackmud.com",
	__promise_wrap:(endpoint,dat) => {
		return new Promise( (resolve,reject) => {
			request({ method: 'POST', uri: 'https://'+API.domain_root+'/mobile/'+endpoint+'.json', json:dat},
				(error,response,body) => {
					if(!error && response.statusCode == 200)
						resolve(body)
					else {
						reject({error:error,statusCode:response?response.statusCode:null,body:body})
					}
				}
			)
		})
	},

	// core API
	get_token:   (pass)                       => API.__promise_wrap('get_token',   {pass:pass}),
	account_data:(token)                      => API.__promise_wrap('account_data',{chat_token:token}),
	chats:       (token,usernames,ext={})     => API.__promise_wrap('chats',       Object.assign(ext,{chat_token:token, usernames:usernames})),
	send:        (token,username,channel,msg) => API.__promise_wrap('create_chat', {chat_token:token, username:username, channel:channel, msg:msg}),
	tell:        (token,username,user,msg)    => API.__promise_wrap('create_chat', {chat_token:token, username:username, tell:user, msg:msg}),
}
//------------------------------------------------------------------------------
function Channel(user,name,users) {
	this.user=user;
	this.name=name;
	this.users=users;
}
Channel.prototype.send=function(msg) {
	return API.send(this.user.account.token,this.user.name,this.name,msg);
}
Channel.prototype.print=function() {
	console.log('        Channel:');
	console.log('          name : '+this.name)
}
//------------------------------------------------------------------------------
function User(account,name,dat) {
	this.account=account;
	this.name=name;
	this.channels={}
	for(var i in dat) {
		this.channels[i]=new Channel(this,i,dat[i]);
	}
}
User.prototype.tell=function(to,msg) {
	return API.tell(this.account.token,this.name,to,msg);
}
User.prototype.print=function() {
	console.log('    User:');
	console.log('      name : '+this.name)
	console.log('      channels:')
	for(var i in this.channels)
		this.channels[i].print();
}
//------------------------------------------------------------------------------
function Account(last=null) {
	this.users=null;
	this.token=null;
	this.last=last
}
Account.prototype.login=function(pass) {
	if(pass.length>10)return this.update(pass)
	return API.get_token(pass).then(token=>this.update(token.chat_token))

}
Account.prototype.update=function(token) {
	this.token=token;
	return API.account_data(this.token).then(dat=>{
		if(!dat.ok)return false;
		this.users={};
		var channels=[];
		for(var i in dat.users) {
			var name=i
			this.users[name]=new User(this,name,dat.users[i]);
		}
		return this;
	})
}
Account.prototype.poll=function(ext={}) {
	var ar=[];
	var names=[];
	if(this.last) {
		if(ext.before=='last')
			ext.before=this.last+0.001;
		if(ext.after=='last')
			ext.after=this.last-0.001;
	}
	return API.chats(this.token,Object.keys(this.users),ext)
	.then(o=>{
		if(!o.ok)return o;
		var last=0;
		for(var i in o.chats) {
			o.chats[i].sort((a,b)=>a.t-b.t);
			var l=o.chats[i];
			if(l.length && l[l.length-1].t>last)
				last=l[l.length-1].t;
			o.chats[i]
				.filter(m=>typeof m.channel!="undefined" && (m.is_join || m.is_leave))
				.forEach(m=>{
					var ch=this.users[i].channels[m.channel];
					if(m.is_join) {
						if(ch.users.indexOf(m.from_user)==-1)
							ch.users.push(m.from_user);
					}
					if(m.is_leave) {
						var ind=ch.users.indexOf(m.from_user);
						for(var ind=ch.users.indexOf(m.from_user);ind!=-1;ind=ch.users.indexOf(m.from_user)) {
							ch.users.splice(ind,1);
						}
					}
				})
		}
		if(last)
			this.last=last
		return o;
	});
}
Account.prototype.print=function() {
	console.log('Account:');
	console.log('  token: '+this.token)
	console.log('  users:')
	for(var i in this.users)
		this.users[i].print();
}

if(typeof exports!="undefined") {
	exports.API=API;
	exports.Account=Account;
	exports.User=User;
	exports.Channel=Channel
}
