let express = require('express'),
	router = express.Router(),
	loadSchema,
	fs = require('fs'),
	checkSchema,
	JSV = require('JSV').JSV;

let mongodb = require('mongodb'),
	mongoServer = new mongodb.Server(
		'localhost',
		27017
		// mongodb.Connection.DEFAULT_PORT
	),
	dbHandle = new mongodb.Db(
		'spa',
		mongoServer,
		{safe:true}
	),
	validator = JSV.createEnvironment(),
	makeMongoId = mongodb.ObjectID,
	objTypeMap = {'user':{}};

dbHandle.open(function(){
	console.log('** Connected to MongoDB **');
});
	
loadSchema = function( schema_name, schema_path ){
	fs.readFile( schema_path,'utf-8',(err,data)=>{
		objTypeMap[ schema_name ] = JSON.parse( data );
	});
};

checkSchema = function( obj_type, obj_map, callback ){
	var schema_map = objTypeMap[ obj_type ],
		report_map = validator.validate( obj_map, schema_map );
	// console.log(report_map);
	callback( report_map );
};

(function(){
	var schema_name, schema_path;
	for(schema_name in objTypeMap){
		if( objTypeMap.hasOwnProperty( schema_name ) ){
			schema_path = __dirname + '/' + schema_name + '.json';
			loadSchema( schema_name, schema_path );
		}
	}
})();

router.get('/', (req, res, next)=>{
	res.redirect('./spa.html');
});
router.all('/:obj_type/*?',(req,res,next)=>{
	res.contentType('json');
	if( objTypeMap[req.params.obj_type]){
		next();
	}else{
		res.send({error_msg:req.params.obj_type+'is not a valid object type'});
	}
});
router.get('/:obj_type/list',(req,res,next)=>{
	dbHandle.collection(
		req.params.obj_type,
		(outer_error,collection)=>{
			collection.find().toArray(
				(inner_error,map_list)=>{
					res.send(map_list);
				}
			);
		}
	);
});
router.post('/:obj_type/create',(req,res,next)=>{
	var obj_type = req.params.obj_type,
		obj_map = req.body;
	checkSchema(
		obj_type, obj_map,
		function(error_list){
			if( error_list.errors.length === 0 ){
				dbHandle.collection(
					obj_type,
					function(outer_error,collection){
						var options_map = { safe: true };
						collection.insert(
							obj_map,
							options_map,
							function(inner_error,result_map){
								res.send(result_map);
							}
						);
					}
				);
			}else{
				res.send({
					error_msg: 'Input document not valid',
					error_list: error_list.errors
				});
			}
		}
	);
});
router.get('/:obj_type/read/:id([0-9]+)',(req,res,next)=>{
	// res.send({title:req.params.obj_type + ' with id ' + req.params.id + ' found'});
	let find_map = { _id: makeMongoId( req.params.id ) };
	dbHandle.collection(
		req.params.obj_type,
		(outer_error,collection)=>{
			collection.findOne(
				find_map,
				(inner_error,result_map)=>{
					res.send(result_map);
				}
			);
		}
	);
});
router.post('/:obj_type/update/:id([0-9]+)',(req,res,next)=>{
	// res.send({title:req.params.obj_type + ' with id ' + req.params.id + ' updated'});
	let find_map = { _id: makeMongoId( req.params.id )},
		obj_map = req.body,
		obj_type = req.params.obj_type;
	checkSchema(
		obj_type, obj_map,
		function(error_list){
			if( error_list.errors.length === 0 ){
				dbHandle.collection(
					obj_type,
					(outer_error,collection)=>{
						let sort_order = [],
							options_map = {
								'new': true,
								upsert: false,
								safe: true
							};
						collection.findAndModify(
							find_map,
							sort_order,
							obj_map,
							options_map,
							(inner_error,updated_map)=>{
								res.send(updated_map);
							}
						);
					}
				);
			}else{
				res.send({
					error_msg:'Input document not valid',
					error_list:error_list.errors
				});
			}
		}
	);
});
router.get('/:obj_type/delete/:id([0-9]+)',(req,res,next)=>{
	// res.send({title:req.params.obj_type + ' with id ' + req.params.id + ' deleted'});
	let find_map = { _id: makeMongoId( req.params.id ) };
	dbHandle.collection(
		req.params.obj_type,
		(outer_error,collection)=>{
			let options_map = {safe:true,single:true};
			collectin.remove(
				find_map,
				options_map,
				(inner_error,delete_count)=>{
					res.send({ delete_count: delete_count })
				}
			);
		}
	);
});

module.exports = router;