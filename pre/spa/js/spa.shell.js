/*
 * spa.shell.js
 * Shell module for SPA
 */
spa.shell = (function(){
	var configMap = {
		anchor_schema_map:{
			chat:{open:true,closed:true}
		},
		main_html:
			'\
				<div class="spa-shell-head">\
					<div class="spa-shell-head-logo"></div>\
					<div class="spa-shell-head-acct"></div>\
					<div class="spa-shell-head-search"></div>\
				</div>\
				<div class="spa-shell-main">\
					<div class="spa-shell-main-nav"></div>\
					<div class="spa-shell-main-content"></div>\
				</div>\
				<div class="spa-shell-foot"></div>\
				<div class="spa-shell-chat"></div>\
				<div class="spa-shell-modal"></div>\
			',
		chat_extend_time:250,
		chat_retract_time:300,
		chat_extend_height:450,
		chat_retract_height:15,
		chat_extend_title:'click to retract',
		chat_retract_title:'click to extend'
	},
	stateMap = { 
		$container:null,
		anchor_map:{},
		is_chat_retracted:true
	},
	jqueryMap = {},
	copyAnchorMap,
	setJqueryMap, toggleChat, onClickChat, initModule,
	changeAnchorPart, onHashchange;
	// END MODULE SCOPE VARIABLES
	// BEIGN UTILITY METHODS
	copyAnchorMap = function(){
		return $.extend( true,{},stateMap.anchor_map );
	};
	// END UTILITY METHODS
	// BEGIN DOM METHODS
	changeAnchorPart = function(arg_map){
		var 
			anchor_map_revise = copyAnchorMap(),
			bool_return = true,
			key_name, key_name_dep;
		KEYVAL:
		for( key_name in arg_map ){
			if(arg_map.hasOwnProperty( key_name ) ){
				if( key_name.indexOf('_') === 0 ) {
					continue KEYVAL;
				}
				anchor_map_revise[key_name] = arg_map[key_name];
				key_name_dep = '_' + key_name;
				if( arg_map[key_name_dep]){
					anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
				}else{
					delete anchor_map_revise[key_name_dep];
					delete anchor_map_revise['_s'+key_name_dep];
				}
			}
		}
		try{
			$.uriAnchor.setAnchor( anchor_map_revise );
		}catch(error){
			$.uriAnchor.setAnchor( stateMap.anchor_map,null,true );
			bool_return = false;
		}
		return bool_return;
	}
	setJqueryMap = function(){
		var $container = stateMap.$container;
		jqueryMap = {
			$container:$container,
			$chat:$container.find('.spa-shell-chat')
		}
	};
	/* Begin callback method /setChatAnchor/
	 * Example: setChatAnchor('closed');
	 * purpose: 更改聊天模块的锚链接
	 * arguments: 
	 *  * $append_target ( example: $('#div_id') );
	 *		jquery dom 容器  
	 * action: 
	 *	将chat滑块添加到服务容器中,
	 *	初始化元素,
	 *	注册事件,
	 *	提供用户聊天接口
	 */
	toggleChat = function( do_extend, callback){
		var 
			px_chat_ht = jqueryMap.$chat.height(),
			is_open = px_chat_ht === configMap.chat_extend_height,
			is_closed = px_chat_ht === configMap.chat_retract_height,
			is_sliding = ! is_open && !is_closed;
		if( is_sliding ){ return false; }
		if( do_extend ){
			jqueryMap.$chat.animate(
				{ height:configMap.chat_extend_height },
				configMap.chat_extend_time,
				function(){
					jqueryMap.$chat.attr(
						'title',configMap.chat_extended_title
					);
					stateMap.is_chat_retracted = false;
					if( callback ){
						callback( jqueryMap.$chat );
					}
				}
			);
			return true;
		}
		jqueryMap.$chat.animate(
			{ height:configMap.chat_retract_height },
			configMap.chat_retract_time,
			function(){
				jqueryMap.$chat.attr(
					'title',configMap.chat_retract_title
				);
				stateMap.is_chat_retracted = true;
				if( callback ) {callback( jqueryMap.$chat ); }
			}
		);
		return true;
	}
	// END DOM METHODS
	// BEGIN EVENT HANDLES
	//onClickChat = function( event ){
	//	toggleChat( stateMap.is_chat_retracted );
	//	return false;
	//}
	onHashchange = function(event){
		var 
			anchor_map_previous = copyAnchorMap(),
			anchor_map_proposed,
			_s_chat_previous,
			_s_chat_proposed,
			s_chat_proposed;
		try{
			anchor_map_proposed = $.uriAnchor.makeAnchorMap();
		}catch(error){
			$.uriAnchor.setAnchor( anchor_map_previous,null,true );
			return false;
		}
		stateMap.anchor_map = anchor_map_proposed;

		_s_chat_previous = anchor_map_previous._s_chat;
		_s_chat_proposed = anchor_map_proposed._s_chat;

		if( ! anchor_map_previous
			|| _s_chat_previous !== _s_chat_proposed
		){
			s_chat_proposed = anchor_map_proposed.chat;
			switch( s_chat_proposed ) {
				case 'open':
					toggleChat(true);
					break;
				case 'closed':
					toggleChat(false);
					break;
				default:
					toggleChat(false);
					delete anchor_map_previous.chat;
					$.uriAnchor.setAnchor( anchor_map_proposed,null,true);
			}
		}
		return false;
	}
	onClickChat = function(event) {
		changeAnchorPart({
			chat:( stateMap.is_chat_retracted ? 'open' : 'closed' )
		});
		return false;
	};
	// END EVENT HANDLES
	initModule = function( $container ){
		stateMap.$container = $container;
		$container.html( configMap.main_html );
		setJqueryMap();
		// 初始化聊天滑块并绑定点击事件
		stateMap.is_chat_retracted = true;
		jqueryMap.$chat
			.attr( 'title', configMap.chat_retract_title)
			.click( onClickChat );
		$.uriAnchor.configModule({
			schema_map: configMap.anchor_schema_map
		});
		// configure and initialize feature modules
		spa.chat.configModule({});
		spa.chat.initModule( jqueryMap.$chat );
		$(window)
			.bind('hashchange',onHashchange)
			.trigger('hashchange');
	};

	return { initModule: initModule}
})();

