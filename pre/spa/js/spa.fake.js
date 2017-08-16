spa.fake = (function(){
	'use strict';
	var getPeopleList;
	getPeopleList = function(){
		return [
			{
				name:'Betty',
				_id:'id_01',
				css_map:{
					top:20,
					left:20,
					'background-color':'rgb(128,128,128)'
				}
			},{
				name:'Mike',
				_id:'id_02',
				css_map:{
					top:60,
					left:20,
					'background-color':'rgb(128,128,128)'
				}
			},{
				name:'Pebbles',
				_id:'id_03',
				css_map:{
					top:100,
					left:20,
					'background-color':'rgb(128,128,128)'
				}
			},{
				name:'Wilma',
				_id:'id_04',
				css_map:{
					top:140,
					left:20,
					'background-color':'rgb(128,128,128)'
				}
			},
		]
	};
	return { getPeopleList: getPeopleList };
})();
