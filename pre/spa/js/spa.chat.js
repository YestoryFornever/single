spa.chat = (function(){
	var configMap = {
		main_html:
			'\
			<div style="padding:1em;color:#fff;">\
				Say hello to chat\
			</div>\
			',
		settable_map:{}
	},
	stateMap = { $container:null },
	jqueryMap, configModule, initModule;

	setJqueryMap = function(){
		var $container = stateMap.$container;
		jqueryMap = { $container: $container };
	};
	/*
	 * setSliderPosition
	 * example: spa.chat.setSliderPosition('closed');
	 * purpose: ensure chat slider is in the requested state
	 * arguments:
	 *		* position_type - enum('closed','opened',or'hidden')
	 *		* callback - 可选,动画结束后的回调函数
	 *			(接收dom元素作为参数)
	 * action: 
	 *		如果当前状态与锚点状态匹配,保持滑块不动
	 * returns:
	 *		* true requested state achived
	 *		* false requested state not achived
	 * Throws: none;
	 */
	/* 公共方法
	 * example:spa.chat.configModule({ slider_open_em:18 });
	 * purpose:初始化配置
	 * arguments:
	 *  * set_chat_anchor - 一个修改URI的回调函数,如果请求未成功一定要返回false
	 *  * chat_model - 提供与消息实例交互的方法
	 *  * people_model - 提供与管理人员列表交互的方法
	 *  * slider_* 设置 - 这部分全部是可选配置
	 *    	详见mapConfig.settable_map
	 *    	Example: slider_open_em 是聊天窗口的展开高度
	 * action:
	 *    内部配置数据结构(configMap)根据提供的arguments进行更新
	 * returns:true
	 * Throws:js错误对象
	 */
	configModule = function( input_map ) {
		spa.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
		return true;
	};
	/*
	 * example: spa.chat.initModule( $('#div_id') );
	 * purpose:
	 *		向用户提供聊天功能
	 * arguments:
	 *		* $append_target (example:$('#div_id))
	 *		  一个jquery容器
	 * action:
	 *		将聊天滑块添加到html容器中,
	 *		渲染节点,绑定事件,向用户提供聊天室接口
	 * returns:
	 *		true/false
	 *	Throws: none
	 */
	initModule = function( $container ){
		$container.html( configMap.main_html );
		stateMap.$container = $container;
		setJqueryMap();
		return true;
	};

	return {
		configModule: configModule,
		initModule: initModule
	};
})();
