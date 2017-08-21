let checkType,
    constructObj,
    readObj,
    updateObj,
    destoryObj,
    loadSchema,
    checkSchema,
    clearIsOnline,
    objTypeMap = {'user':{}};

let JSV = require('JSV').JSV,
    validator = JSV.createEnvironment();
    
let mongodb = require('mongodb'),
    mongoServer = new mongodb.Server(
        'localhost',
        '27017'
    ),
    dbHandle = new mongodb.Db(
		'spa',
		mongoServer,
		{safe:true}
	),
    makeMongoId = mongodb.ObjectID;

let fs = require('fs');

loadSchema = function( schema_name, schema_path ){
	fs.readFile( schema_path,'utf-8',(err,data)=>{
		objTypeMap[ schema_name ] = JSON.parse( data );
	});
};

checkSchema = function( obj_type, obj_map, callback ){
	var schema_map = objTypeMap[ obj_type ],
		report_map = validator.validate( obj_map, schema_map );
	// console.log(report_map);
	callback( report_map.errors );
};

clearIsOnline = function(){
    updateObj(
        'user',
        {is_online:true},
        {is_online:false},
        (response_map)=>{
            console.log('All users set to offline');//, response_map);
        }
    );
};

checkType = function(obj_type){
    if(!objTypeMap[obj_type]){
        return ({
            erro_msg: 'Object type "' + obj_type
                + '" is not supported.'
        });
    }
    return null;
};

constructObj = function(obj_type, obj_map, callback){
    let type_check_map = checkType( obj_type );
    if( type_check_map ){
        callback( type_check_map );
    }
    checkSchema(
        obj_type,
        obj_map,
        (error_list)=>{
            if(error_list.length === 0){
                dbHandle.collection(
                    obj_type,
                    (outer_error,collection)=>{
                        let options_map = {safe:true};
                        collection.insert(
                            obj_map,
                            options_map,
                            (inner_error,result_map)=>{
                                callback(result_map);
                            }
                        );
                    }
                );
            }else{
                callback({
                    error_msg:'Input document not valid',
                    error_list:error_list
                });
            }
        }
    );
};
readObj = function(obj_type, find_map, fields_map, callback){
    let type_check_map = checkType( obj_type );
    if( type_check_map ){
        callback( type_check_map );
        return;
    }
    dbHandle.collection(
        obj_type,
        (outer_error,collection)=>{
            collection.find( find_map, fields_map ).toArray(
                (inner_error, map_list)=>{
                    callback( map_list );
                }
            );
        }
    );
};
updateObj = function(obj_type, find_map, set_map, callback){
    let type_check_map = checkType(obj_type);
    if(type_check_map){
        callback(type_check_map);
        return;
    }
    checkSchema(
		obj_type, set_map,
		function(error_list){
			if( error_list.length === 0 ){
				dbHandle.collection(
					obj_type,
					(outer_error,collection)=>{
                        collection.update(
                            find_map,
                            {
                                $set:set_map
                            },
                            {
                                safe:true,
                                multi:true,
                                upsert:false
                            },
                            (inner_error,update_count)=>{
                                callback({ update_count:update_count });
                            }
                        );
					}
				);
			}else{
				callback({
					error_msg:'Input document not valid',
					error_list:error_list
				});
			}
		}
	);
};
destoryObj = function(obj_type, find_map, callback){
    let type_check_map = checkType( obj_type );
    if( type_check_map ){
        callback( type_check_map );
        return;
    }
    dbHandle.collection(
        obj_type,
		(outer_error,collection)=>{
			let options_map = {safe:true,single:true};
			collectin.remove(
				find_map,
				options_map,
				(inner_error,delete_count)=>{
					callback({ delete_count: delete_count })
				}
			);
		}
    );
};

console.log('** CRUD module loaded **');

dbHandle.open(function(){
    console.log('** Connected to MongoDB **');
    clearIsOnline();
});

(function(){
	var schema_name, schema_path;
	for(schema_name in objTypeMap){
		if( objTypeMap.hasOwnProperty( schema_name ) ){
			schema_path = __dirname + '/' + schema_name + '.json';
			loadSchema( schema_name, schema_path );
		}
	}
})();

module.exports = {
    makeMongoId:mongodb.ObjectID,
    checkType:checkType,
    construct:constructObj,
    read:readObj,
    update:updateObj,
    destory:destoryObj
};