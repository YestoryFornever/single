let express = require('express'),
	router = express.Router();

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
	makeMongoId = mongodb.ObjectID;

dbHandle.open(function(){
	console.log('** Connected to MongoDB **');
});
	
router.get('/', (req, res, next)=>{
	res.redirect('./spa.html');
});
router.all('/:obj_type/*?',(req,res,next)=>{
	res.contentType('json');
	next();
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
	// res.send({title:req.params.obj_type + ' create'});
	dbHandle.collection(
		req.params.obj_type,
		(outer_error,collection)=>{
			let options_map = {safe:true},
				obj_map = req.body;
			collection.insert(
				obj_map,
				options_map,
				(inner_error,result_map)=>{
					res.send(result_map);
				}
			);
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
		obj_map = req.body;
	dbHandle.collection(
		req.params.obj_type,
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