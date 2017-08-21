var emitUserList,
	signIn,
	chatObj,
    socket = require('socket.io'),
    crud = require('./crud'),

	makeMongoId = crud.makeMongoId,
	chatterMap = {};

emitUserList = function(io){
	crud.read(
		'user',
		{is_online:true},
		{},
		( result_list )=>{
			io.of('/chat')
				.emit('listchange',result_list);
		}
	);
}

signIn = function(io, user_map, socket){
	crud.update(
		'user',
		{'_id':user_map._id},
		{is_online:true},
		(result_map)=>{
			emitUserList(io);
			user_map.is_online = true;
			socket.emit('userupdate',user_map);
		}
	);
	chatterMap[ user_map._id ] = socket;
	socket.user_id = user_map._id;
}

chatObj = {
    connect:function(server){
        var io = socket.listen(server);
		io.set('blacklist',[])
			.of('/chat')
			.on('connect',function(socket){
				socket.on('adduser',function(user_map){
					crud.read(
						'user',
						{ name: user_map.name },
						{},
						(result_list)=>{
							var result_map,
								cid = user_map.cid;
							delete user_map.cid;
							if(result_list.length > 0){
								result_map = result_list[0];
								result_map.cid = cid;
								signIn(io, result_map, socket);
							}else{
								user_map.is_online = true;
								crud.construct(
									'user',
									user_map,
									(result_list)=>{
										result_map = result_list[0];
										result_map.cid = cid;
										chatterMap[result_map._id] = socket;
										socket.user_id = result_map._id;
										socket.emit('userupdate',result_map);
										emitUserList(io);
									}
								);
							}
						}
					);
				});
				socket.on('updatechat',function(){});
				socket.on('leavechat',function(){});
				socket.on('disconnect',function(){});
				socket.on('updateavatar',function(){});
			});
        return io;
    }
};

module.exports = chatObj;
