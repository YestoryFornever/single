let express = require('express'),
	router = express.Router(),
	crud = require('./crud');

router.get('/', (req, res, next)=>{
	res.redirect('./spa.html');
});
router.all('/api/:obj_type/*?',(req,res,next)=>{
	res.contentType('json');
	next();
});
router.get('/api/:obj_type/list',(req,res,next)=>{
	crud.read(
		req.params.obj_type,
		{},
		{},
		(map_list)=>{
			res.send(map_list);
		}
	);
});
router.post('/api/:obj_type/create',(req,res,next)=>{
	crud.construct(
		req.params.obj_type,
		{_id:makeMongoId(req.params.id)},
		{},
		(map_list)=>{
			res.send(map_list);
		}
	);
});
router.get('/api/:obj_type/read/:id([0-9]+)',(req,res,next)=>{
	crud.read(
		req.params.obj_type,
		{_id: makeMongoId(req.params.id)},
		{},
		(map_list)=>{
			res.send(map_list);
		}
	);
});
router.post('/api/:obj_type/update/:id([0-9]+)',(req,res,next)=>{
	crud.update(
		req.params.obj_type,
		{_id: makeMongoId(req.params.id)},
		req.body,
		(result_map)=>{
			res.send(result_map);
		}
	);
});
router.get('/api/:obj_type/delete/:id([0-9]+)',(req,res,next)=>{
	crud.destory(
		req.params.obj_type,
		{_id: makeMongoId(req.params.id)},
		(result_map)=>{
			res.send(result_map);
		}
	);
});

module.exports = router;
