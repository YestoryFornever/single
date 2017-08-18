spa.model = (function(){
	'use strict';
	var configMap = { anon_id: 'a0' },
		stateMap = {
			anon_user:null,
			cid_serial:0,
			people_cid_map:{},
			people_db:TAFFY(),
			user:null,
			is_connected: false
		},
		isFakeData = true,
		personProto,
		makeCid,
		clearPeopleDb,
		completeLogin,
		makePerson,
		removePerson,
		people,
		chat,
		initModule;

	/*
	 *	用户API
	 *	-------
	 *  spa.model.people
	 *  people对象提供方法和事件
	 *  方法:
	 *		* get_user() 返回当前用户对象
	 *		  如果当前用户没有注册,就返回一个匿名用户对象
	 *		* get_db() 返回taffy数据库中所有用户
	 *		* get_by_cid( client_id ) 通过唯一id返回用户对象
	 *		* login 根据用户提供的用户名登录。登陆成功后发起一个名为‘spa-login’的全局自定义事件
	 *		* logout 将当前用户转为匿名用户。成功后发起一个名为‘spa-logout’的全局自定义事件
	 *	全局自定义事件：
	 *		* spa-login 
	 *		* spa-logout
	 *	用户对象提供的方法：
	 *		* get_is_user() 判断是否为当前用户
	 *		* get_is_anon() 判断是否为匿名用户
	 *	用户属性
	 *		* cid 客户端用户id，每个用户都必须有这个字段，当且仅当该用户没有与后台同步时才与id字段值不同
	 *		* id 用户唯一id，当没有与后台同步时可能为undefined
	 *		* name 用户姓名
	 *		* css_map avatar相关样式
	 */

	personProto = {
		get_is_user:function(){
			return this.cid === stateMap.user.cid;
		},
		get_is_anon:function(){
			return this.cid === stateMap.anon_user.cid;
		}
	}

	makeCid = function(){
		return 'c' + String( stateMap.cid_serial++ );
	}

	clearPeopleDb = function(){
		var user = stateMap.user;
		stateMap.people_db = TAFFY();
		stateMap.people_cid_map = {};
		if( user ){
			stateMap.people_db.insert( user );
			stateMap.people_cid_map[ user.cid ] = user;
		}
	}

	completeLogin = function( user_list ){
		var user_map = user_list[ 0 ];
		delete stateMap.people_cid_map[ user_map.cid ];
		stateMap.user.cid = user_map._id;
		stateMap.user.id = user_map._id;
		stateMap.user.css_map = user_map.css_map;
		stateMap.people_cid_map[user_map._id] = stateMap.user;
		chat.join();

		$.gevent.publish( 'spa-login', [stateMap.user]);
	}
	
	makePerson = function( person_map ){
		var person,
			cid = person_map.cid,
			css_map = person_map.css_map,
			id = person_map.id,
			name = person_map.name;
		if( cid === undefined || !name ){
			throw 'client id and name required';
		}
		person = Object.create( personProto );
		person.cid = cid;
		person.name = name;
		person.css_map = css_map;

		if(id){ person.id = id; }

		stateMap.people_cid_map[cid] = person;

		stateMap.people_db.insert( person );
		
		return person;
	}

	removePerson = function( person ){
		if( !people ){ return false; }
		if( person.id === configMap.anon_id ) {
			return false;
		}
		stateMap.people_db({cid:person.cid}).remove();
		if(person.cid){
			delete stateMap.people_cid_map[ person.cid ];
		}
		return true;
	}
	
	people = (function(){
		var get_by_cid, get_db, get_user, login, logout;
		
		get_by_cid = function( cid ){
			return stateMap.people_cid_map[ cid ];
		};

		get_db = function(){ return stateMap.people_db; };

		get_user = function(){ return stateMap.user; };

		login = function( name ){
			var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
			stateMap.user = makePerson({
				cid:makeCid(),
				css_map:{ top:25, left:25, 'background-color':'#8f8'},
				name:name
			});
			sio.on( 'userupdate', completeLogin );
			sio.emit( 'adduser', {
				cid:stateMap.user.cid,
				css_map:stateMap.user.css_map,
				name:stateMap.user.name
			});
		};

		logout = function(){
			var is_removed, user = stateMap.user;

			chat._leave();
			is_removed = removePerson( user );
			stateMap.user = stateMap.anon_user;

			$.gevent.publish('spa-logout',[user]);
			
			return is_removed;
		};

		//get_cid_map = function(){ return stateMap.people_cid_map; };

		return {
			get_by_cid: get_by_cid,
			get_db: get_db,
			get_user: get_user,
			login: login,
			logout: logout
		}
	})();

	chat = (function(){
		var _publish_listchange,
			_publish_updatechat,
			_update_list,
			_leave_chat,

			get_chatee,
			join_chat,
			send_msg,
			set_chatee,
			update_avatar,
			chatee = null;

		_update_list = function( arg_list ){
			var i, person_map, make_person_map,
				people_list = arg_list[0],
				is_chatee_online = false;

			clearPeopleDb();

			PERSON:
			for( i=0; i<people_list.length; i++ ){
				person_map = people_list[i];
				if( !person_map.name ){ continue PERSON; }
				if( stateMap.user && stateMap.user.id === person_map._id ){
					stateMap.user.css_map = person_map.css_map;
					continue PERSON;
				}
				make_person_map = {
					cid: person_map._id,
					css_map: person_map.css_map,
					id: person_map._id,
					name: person_map.name
				};
				if( chatee && chatee.id === make_person_map.id ){
					is_chatee_online = true;
				}
				makePerson( make_person_map );
			}
			stateMap.people_db.sort('name');
			if(chatee && !is_chatee_online ){
				set_chatee('');
			}
		};

		_publish_listchange = function(arg_list){
			_update_list( arg_list );
			$.gevent.publish( 'spa-listchange',[arg_list]);
		};

		_publish_updatechat = function(arg_list){
			var msg_map = arg_list[0];
			if(!chatee){set_chatee(msg_map.sender_id);}
			else if( msg_map.sender_id !== stateMap.user.id
				&& msg_map.sender_id !== chatee.id
			){ set_chatee( msg_map.sender_id); }
			$.gevent.publish('spa-updatechat',[msg_map]);
		};

		_leave_chat = function(){
			var sio = isFakeData ? spa.fake.mockSio :spa.data.getSio();
			chatee = null;
			stateMap.is_connected = false;
			if(sio){sio.emit('leave_chat');}
		};

		get_chatee = function(){ return chatee;};

		join_chat = function(){
			var sio;
			if(stateMap.is_connected){return false;}
			if(stateMap.user.get_is_anon()){
				console.warn('User must be defined before joining chat');
				return false;
			}
			sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
			sio.on('listchange',_publish_listchange);
			sio.on('updatechat',_publish_updatechat );
			stateMap.is_connected = true;
			return true;
		}

		send_msg = function( msg_text ){
			var msg_map,
				sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

			if(!sio){return false;}
			if(!(stateMap.user&&chatee)){return false;};

			msg_map = {
				dest_id:chatee.id,
				dest_name:chatee.name,
				sender_id:stateMap.user.id,
				msg_text:msg_text
			};

			_publish_updatechat([msg_map]);
			sio.emit('updatechat',msg_map);
			return true;
		};

		set_chatee = function(person_id){
			var new_chatee;
			new_chatee = stateMap.people_cid_map[person_id];
			if(new_chatee){
				if(chatee && chatee.id === new_chatee.id){
					return false;
				}
			}else{
				new_chatee = null;
			}
			$.gevent.publish('spa-setchatee',
				{old_chatee:chatee,new_chatee:new_chatee}
			);
			chatee = new_chatee;
			return true;
		}

		update_avatar = function( avatar_update_map ){
			var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
			if( sio ){
				sio.emit( 'updateavatar',avatar_update_map );
			}
		}

		return {
			_leave:_leave_chat,
			get_chatee: get_chatee,
			join:join_chat,
			send_msg: send_msg,
			set_chatee: set_chatee,
			update_avatar: update_avatar
		}
	})();

	initModule = function(){
		var i, people_list, person_map;

		stateMap.anon_user = makePerson({
			cid: configMap.anon_id,
			id: configMap.anon_id,
			name: 'anonymous'
		});
		stateMap.user = stateMap.anon_user;
		
		if( isFakeData ) {
			people_list = spa.fake.getPeopleList();
			for ( i=0; i<people_list.length; i++ ){
				person_map = people_list[i];
				makePerson({
					cid: person_map._id,
					css_map: person_map.css_map,
					id: person_map._id,
					name: person_map.name
				});
			}
		}
	}
		
	return {
		initModule: initModule,
		chat: chat,
		people: people
	};
})();
