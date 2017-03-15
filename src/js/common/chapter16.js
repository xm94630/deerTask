/*******************************
* 第十六章 原型继承、mixin模式、装饰者模式
* 这个三者其实关系还是比较紧密的，所以组合在一起处理
* 之前已经对原型继承有不少案例了，这里还是会回顾一些
********************************/

var bee = (function(bee){


    /**************************************************************
    * 第一节 原型继承 
    ***************************************************************/

    /* 
     * 研究案例1: 最简单的原型继承
     */
    bee.caseP1 = function(){
        
        var Animal = function(age){
            this.age = age;
        }
        Animal.prototype.run = function(){
            l('run');
        }
        var Fish = function(width){
            this.width = width;
        }
        Fish.prototype = new Animal(2);  //这里是Animal实例，Fish实例中含有父级的全部属性
        Fish.prototype.constructor = Fish;
        Fish.prototype.swim = function(){l('swimming');}
        var f = new Fish(100);
        l(f);

        //此案例原型链共有节点 3+1（后一个是null）
    }


    /* 
     * 研究案例1_2: 变化
     */
    bee.caseP1_2 = function(){
        
        var Animal = function(age){
            this.age = age;
        }
        Animal.prototype.run = function(){
            l('run');
        }
        var Fish = function(width){
            this.width = width;
        }
        Fish.prototype = Animal.prototype;  //这里是Object实例，Fish实例中只含有父级“原型”上的全部属性（因此不包含age，所以这个继承有点问题）
        Fish.prototype.constructor = Fish;
        Fish.prototype.swim = function(){l('swimming');}
        var f = new Fish(100);
        l(f);

        //此案例原型链共有节点 2+1（后一个是null）
    }


    /* 
     * 研究案例1_3: 变化
     * 和1_2相比，多了mixin这部分，所以这里有age属性，并且是fish实例自己的，而不是来自父级。就是mixin的作用！
     */
    bee.caseP1_3 = function(){
        
        var Animal = function(age){
            this.age = age;
        }
        Animal.prototype.run = function(){
            l('run');
        }
        var Fish = function(width,age){
            Animal.call(this,age)           //mixin
            this.width = width;
        }
        Fish.prototype = Animal.prototype;  //这里是Object实例，Fish实例中只含有父级“原型”上的全部属性（所以不包含age，这里ages属性是通过mixin进来的）
        Fish.prototype.constructor = Fish;
        Fish.prototype.swim = function(){l('swimming');}
        var f = new Fish(100,9);
        l(f);

        //同上例
    }


    /* 
     * 研究案例1_4: 标准原型继承 
     * 使用 Object.create + mixin 官方推荐
     * 当然，这里还可以优化的是，比如，改函数如果调用的时候，忘记了new的处理。为了展示核心，其他细节都不处理了。
     */
    bee.caseP1_4 = function(){
        
        var Animal = function(age){
            this.age = age;
        }
        Animal.prototype.run = function(){
            l('run');
        }
        var Fish = function(width,age){
            Animal.call(this,age)           //mixin
            this.width = width;
        }
        Fish.prototype = Object.create(Animal.prototype);  //这样子和1_3已经非常类似了，只是在原型链上要多出 Animal实例 这个节点！
        Fish.prototype.constructor = Fish;
        Fish.prototype.swim = function(){l('swimming');}
        var f = new Fish(100,9);
        l(f);

        //此案例原型链共有节点 3+1（后一个是null）
    }


    /* 
     * 研究案例1_5: 再变化 
     */
    bee.caseP1_5 = function(){
        
        var Animal = function(age){
            this.age = age;
        }
        Animal.prototype.run = function(){
            l('run');
        }
        var Fish = function(width,age){
            Animal.call(this,age)           //mixin
            this.width = width;
        }

        //继续使用 Object.create ，这里使用了new Animal(88)
        //然而，这个模式并不好，
        //1）观察log，比1_4又多了一个原型链节点！
        //2）既然已经有mixin了，age属性可以直接给出，完全没有必要去“new Animal(88)”一下，而且这个88的参数也显得有点多余。
        Fish.prototype = Object.create(new Animal(88));  
        Fish.prototype.constructor = Fish;
        Fish.prototype.swim = function(){l('swimming');}
        var f = new Fish(100,9);
        l(f);

        //此案例原型链共有节点 4+1（后一个是null）
    }


    /* 
     * 研究案例2: Object.setPrototypeOf 改变实例原型链节点 ！
     */
    bee.caseP2 = function(){
        
        var Animal = function(age){
            this.age = age;
        }
        Animal.prototype.run = function(){
            l('run');
        }
        var Fish = function(width,age){
            Animal.call(this,age)           //mixin
            this.width = width;
        }
        Fish.prototype.swim = function(){l('swimming');}  //这个不会在log中出现！因为原型链被改变了。

        var f = new Fish(100,9);
        Object.setPrototypeOf(f,Animal.prototype);
        f.constructor = Fish;
        l(f);

        //这个例子最接近 caseP1_3 案例中的写法：
        //Fish.prototype = Animal.prototype; 
        //Fish.prototype.constructor = Fish;
        //
        //区别是：一个是在构造之前处理原型。一个是在实例之后改变原型。
        //为何它没有成为最好的继承方式呢？
        //原因就在于：
        //“f.constructor = Fish;”这个！因为如果我每次实例之后，需要调整其构造函数，这个是非常蠢的做法...
        
        //此案例原型链共有节点 2+1（后一个是null）
    }


    /* 
     * 研究案例3: 继承封装 【BOSS】
     * 如何将1_4案例中经典继承封装成通用函数呢？见下：
     */
    bee.caseP3 = function(){
        
        var Animal = function(age){
            this.age = age;
        }

        Animal.prototype.run = function(){
            l('run');
        }

        function extend(parentClass,options){
            var fn = function(){
                if(!(this instanceof fn)){throw new Error('missing new');}
                var args = Array.prototype.slice.call(arguments,0);
                args.unshift(parentClass.bind(this));
                options.constructor.apply(this,args);
            };
            fn.prototype = Object.create(parentClass.prototype);
            for(k in options){
                fn.prototype[k] = options[k];
            }
            fn.prototype.constructor = fn;
            return fn;
        }

        var Fish = extend(Animal,{
            //本来以为这个没有constructor会报错，但是意外的发现没有事！
            //因为，这里 options 作为为一个对象，其默认的constructor就是 Object
            //这个 options.constructor.apply(this,args); 执行的时候，等效于：
            //Object.apply(this,args);
            //这个调用的时候，会实例化一个新的对象，因为也没有赋值给别的变量，并没有什么副作用！
            //因为这个话题，我还研究了 Object.apply 的用法，非常有意思，我会在别的地方列出来。
            constructor:function(superClass,width){
                superClass(9);
                this.width = width;
            },
            swim:function(){
                l('swimming');
            }
        });

        var f = new Fish(100);

        l(f)
        //l(f.age)
        //l(f.width)
        //l(f.constructor===Fish)

        //这个案例非常有趣！！是对通用继承的优秀封装！
        //唯一的缺憾就是：
        //Fish 是对 extend中的 fn的引用，也就是log出来的时候，函数的name却还是fn。
        //这个不算是问题啦~~
        //
        //接下来我们来试着用另外的方法来解决这个问题
        
        //此案例原型链共有节点 3+1（后一个是null）
    }


    /* 
     * 研究案例3_2: 上例变化 【失败】
     */
    bee.caseP3_2 = function(){
        
        /*var Animal = function(age){
            this.age = age;
        }

        Animal.prototype.run = function(){
            l('run');
        }

        Function.prototype.extend = function (parentClass,options){
            var that = this;

            l('== 这里会报错，因为this不能被改变 ==')
            this = function(){
                if(!(this instanceof that)){throw new Error('missing new');}
                var args = Array.prototype.slice.call(arguments,0);
                args.unshift(parentClass.bind(this));
                options.constructor.apply(this,args);
            };
            this.prototype = Object.create(parentClass.prototype);
            this.prototype.constructor = this;
            
            for(k in options){
                if(k!=='constructor' && typeof options[k]==='function'){
                    this.prototype[k] = options[k];
                }
            }
        }

        var Fish = function Fish(){};
        Fish.extend(Animal,{
            constructor:function(superClass,width){
                superClass(9);
                this.width = width;
            },
            swim:function(){
                l('swimming');
            }
        });

        var f = new Fish(100);

        l(f)
        l(f.age)
        l(f.width)
        l(f.constructor===Fish)*/

        //这个案例视图在Function的原型上啦扩展extend的方法，其实是不可行的。
        //是因为我不了解this不可写这个特性。
        //见下：
    }


    /* 
     * 研究案例3_3: 不可改变的this
     */
    bee.caseP3_3 = function(){
        /*function a(){
            function b(){
                function c(){
                    this=1;
                }
            }
        }*/

        //这里改变this的引用就会出错。（在this上添加属性进行扩展是可以的）
        //而且这个错误还不是运行时的，行为同语法错误，哪怕外层函数都还没有被调用，就会被报错。
        //所以这里需要把代码注释起来。
    }


    /* 
     * 研究案例4: es6 标准继承
     */
    bee.caseP4 = function(){

        class Animal {
          constructor(age) {
            this.age = age;
          }  
          run() {
            l('run')
          }
        }

        class Fish extends Animal {
          constructor(age,width) {
            super(3);
            this.age = age;
            this.width = width;
          } 
          swim(){
            l('swim')
          }
        }

        var f = new Fish(9,100);
        l(f);

        //比较案例3，发现log得到的结构是完全一样的。差异很细微。
    }




    /**************************************************************
    * 第二节 构造函数 
    ***************************************************************/




	return bee;
})(bee || {});









/*
function extend(Fun1,Fun2){
	Fun1 = function(){
		var args = Array.prototype.slice.call(arguments,0);
    Fun2.apply(this,args);
	};
	Fun1.prototype = Object.create(Fun2.prototype);
	Fun1.prototype.constructor = Fun1;
	Fun1.prototype.parent = Fun2;
	return Fun1;
}
function Animal(height,weight){
	this.height = height;
	this.weight = weight;
}
Animal.prototype.run = function(){
	l('running!');
}
var Fish;
var Fish = extend(Fish,Animal,fun);
var f = new Fish(100,200);
l(f.height)
l(f.weight)
f.run()
l(f.constructor)
*/




/*function defclass(prototype) {
    var constructor = prototype.constructor;
    constructor.prototype = prototype;
    return constructor;
}

function extend(constructor, keys) {
    var prototype = Object.create(constructor.prototype);
    for (var key in keys) prototype[key] = keys[key];
    return defclass(prototype);
}

var BaseClass = defclass({
    constructor: function (name) {
        this.name = name;
    },
    doThing: function () {
        console.log(this.name + " BaseClass doThing");
    },
    reportThing: function () {
        console.log(this.name + " BaseClass reportThing");
    }
});

var SubClass = extend(BaseClass, {
    constructor: function (name) {
        BaseClass.call(this, name);
    },
    doThing: function () {
        console.log(this.name + " SubClass replacement doThing");
    },
    extraThing: function () {
        console.log(this.name + " SubClass extraThing");
    }
});



var x =   new BaseClass('xm')
l(x)
x.doThing()*/




/*var King = function(age){
    this.age = age;
}
King.prototype.run =function () {
    console.log("run");
}


l(new King(4));




function defClass(options) {
    var fn = options.constructor;
    fn.prototype = options;
    return fn;
}

var Animal = defClass({
    constructor: function(age) {
        this.age = age;
    },
    run: function () {
        console.log("run");
    }
});

var a = new Animal(4);
l(a)*/


