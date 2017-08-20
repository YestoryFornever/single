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
	);
dbHandle.open(function(){console.log('** Connected to MongoDB **')});
	
router.get('/', (req, res, next)=>{
	res.redirect('./spa.html');
});
router.all('/:obj_type/*?',(req,res,next)=>{
	res.contentType('json');
	next();
});
router.get('/:obj_type/list',(req,res,next)=>{
	res.send({title:req.params.obj_type + ' list'});
});
router.post('/:obj_type/create',(req,res,next)=>{
	res.send({title:req.params.obj_type + ' create'});
});
router.get('/:obj_type/read/:id([0-9]+)',(req,res,next)=>{
	res.send({title:req.params.obj_type + ' with id ' + req.params.id + ' found'});
});
router.post('/:obj_type/update/:id([0-9]+)',(req,res,next)=>{
	res.send({title:req.params.obj_type + ' with id ' + req.params.id + ' updated'});
});
router.get('/:obj_type/delete/:id([0-9]+)',(req,res,next)=>{
	res.send({title:req.params.obj_type + ' with id ' + req.params.id + ' deleted'});
});

module.exports = router;