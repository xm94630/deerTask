/*******************************
* 第十章
* 正则表达式研究 实战
********************************/

var bee = (function(bee){

	/* 
	 * 研究案例1:
	 */
	bee.caseJ1 = function(){

		//有了上一个章节的铺垫，这个式子分析就简单多了
		//其实就是科学计数法的匹配
		var r = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/;  
		l(r.test('123'));
		l(r.test('+123'));
		l(r.test('-123'));
		l(r.test('+123.'));
		l(r.test('+123.123'));
		l(r.test('+123.123E100'));
		l(r.test('+123.123E-100'));
		l(r.test('+123.123e-100'));
		l(r.test('+123.123e-123'));
		l(r.test('+.123e-123'));
	}

	return bee;
})(bee || {});


//bee.caseJ1();


