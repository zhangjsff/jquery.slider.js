/**
 * Created by Jiansong  on 13-11-27. ALL HTML5 support
 */
$.fn.slider = $.fn.Jslider = function(opt){

    var _this = $(this); //定义全局this指针
    //初始话之前，删除已经初始的slider
    _this.append(_this.find('.ship').html());
    _this.find('.ship').remove();

    var s = $.extend({
        debug          : false ,
        autoPlay       : false,
        during         : 3000,
        instancePlay   :'',
        id             : this.attr('id')                                                                 ,  //获取ID
        isNextPrevious : !(this.attr('set-next-previous') == 'false')                                        ,   // 设置是否加载前一页后一页
        isPager        : this.attr('set-pager') == 'true'                                                ,   //设置是否加载 分页状态显示栏
        isScroll       : this.attr('set-scrollbar') == 'true'                                            , //检查是否设置滚动条
        isVertical     : this.attr('is-vertical'),
        pagerType      : 'normal'                                                                         ,  //normal 正常的翻页，thumb缩略图翻页
        model          : 'product-slider'                                                                 ,   //根据要求，本插件提供多种模式，包括缩略图的焦点图(thumb-slider)，右侧活动小方格(product-slider)
        length         : this.find('.item').length                                                       ,    // 获取元素的数量
        unitWidth      :    (parseInt(this.find('.item').eq(0).css('width')) || 0) +                                            //获取单个元素的宽度
                            (parseInt(this.find('.item').eq(0).css('margin-right')) || 0)  +
                            (parseInt(this.find('.item').eq(0).css('margin-left')) || 0)  +
                            (parseInt(this.find('.item').eq(0).css('padding-left')) || 0) +
                            (parseInt(this.find('.item').eq(0).css('padding-right')) || 0)  +
                            (parseInt(this.find('.item').eq(0).css('border-left-width'))*2 || 0)  ,
        unitHeight     :    (parseInt(this.find('.item').eq(0).css('height')) || 0) +
                            (parseInt(this.find('.item').eq(0).css('margin-top')) || 0)  +
                            (parseInt(this.find('.item').eq(0).css('margin-bottom')) || 0)  +
                            (parseInt(this.find('.item').eq(0).css('padding-top')) || 0) +
                            (parseInt(this.find('.item').eq(0).css('padding-bottom')) || 0)  +
                            (parseInt(this.find('.item').eq(0).css('border-left-top'))*2 || 0)  ,               //获取单个元素的宽度                                                                    , //获取单个元素的高度
        items          : _this.find('.item')                                                               ,    //获取所有元素
        speed          : this.attr('set-speed') !== undefined ? this.attr('set-speed') : '0.3s'          ,    //设定动画速度
        showNum        : parseInt(this.attr('set-show-num'))  || 1                                 ,    //获取每次显示的个数，默认为1
        range          : 2                                                                              ,        //每次点击next previous的距离1个item或者多个items
        next           : '',
        previous       : '',
        pagers         : '',
        thumb          :'number'                                                                   ,  //页面的缩略图的样式，可以空，数字或者图片('',number,img)
        ship           : $('<div class="ship"></div>'),
        currentNum     : 0,
        startNum       : 0,
        compatible     : false                                                                    ,   //是否兼容非HTML5浏览器
        scroll         : '',                                                                           //添加滚动条时，对应的容器
        scrollBar      : '',                                                                           //滚动条中，可拖动的区域的容器
        scrollPos      : 0,                                                                            //滚动条可拖动区域的位置，自定义，为初始位置
        scrollWidth    : 0,                                                                            //
        scrollbarWidth : 0,                                                                            //可拖动的按钮的宽度 ， 百分数
        afterInit      :function(){},                                                                 //自定义定义初始化之后的函数
        afterPageClick :function(){},                                                                 //自定义点击页码之后的函数
        beforeChange   :function(){}                                                                  //自定义切换触发器
    },opt)







    var createLayOut = function(){

        //初始化边框
        var items = _this.find('.item')
        s.currentNum = s.startNum;
        s.ship.append(items);
        _this.append(s.ship)
        s.ship.css({'width': s.length * s.unitWidth, 'overflow':'hidden',marginLeft:0}) //承载左右移动块的宽度 = 物件数量 * 单个物件的宽度
        _this.css({width: (s.showNum * s.unitWidth) + 'px',overflow:'hidden'})    //slider显示宽度 = 显示物件的数量 * 单个物件的宽度

        //如果设置前后翻页，添加前后翻页代码
        if(s.isNextPrevious){


            //检查获取或生成前后翻页的按钮，检查是否有手动设定的前后翻页按钮 //按钮规则为，class="for+[sliderID]"
            if($('.for'+ s.id).length > 0){

                s.previous = $('.for'+ s.id).find('.previous')
                s.next = $('.for'+ s.id).find('.next')

                if(s.startNum+ s.showNum >= s.length ){
                    s.next.addClass('invisible')
                }else{
                    s.next.removeClass('invisible');
                }
                if(s.startNum <= 0){
                   // s.previous.addClass('invisible')
                }else{
                    s.previous.removeClass('invisible');
                }

            }else{

                s.previous = $('<div class="slider-previous previous"> < </div>')
                s.next = $('<div class="slider-next next"> > </div>')

                if(s.startNum >= s.length - 1){
                    s.next.addClass('invisible')
                }else{
                    s.next.removeClass('invisible');
                }
                if(s.startNum <= 0){
                    //s.previous.addClass('invisible');
                }else{
                    s.previous.removeClass('invisible');
                }
                var tmp = $('<div class="for'+ s.id+'"></div>')
                tmp.append(s.previous)
                tmp.append(s.next)
                _this.append(tmp);
            }


        }

        //如果设置页码，添加页码控件
        if(s.isPager){

            var pageNum = Math.ceil((s.length - s.showNum) / s.range + 1)

            var pager = $('<div class="slider-pagination" id="slider-pagination-for-'+s.id+'"><ul></ul></div>')

            for(var i = 0; i < pageNum; i++ ){

                if(s.thumb == 'number'){                                 //当设定为数字的时候，页码按钮添加数字
                    pager.find('ul').append('<li class="'+(i == s.currentNum ? 'active':'') +'" data-pagenum="'+i+'">'+(i+1)+'</li>')
                }else if(s.thumb == 'img'){                             //当设定为图片的时候页码按钮为缩略图，item标签需要添加缩略图路径(data-thumb)
                    pager.find('ul').append('<li class="'+(i == s.currentNum ? 'active':'') +'" data-pagenum="'+i+'"><img src="'+ s.items.eq(i).attr('data-thumb')+'" /></li>')
                }else{                                                  //不填充任何内容
                    pager.find('ul').append('<li class="'+(i == s.currentNum ? 'active':'') +'" data-pagenum="'+i+'"></li>')
                }

            }

            s.pagers = pager.find('li')

            _this.after(pager)
        }

        //如果设置滚筒条，添加滚动条控件 (暂不支持竖列显示)
        if(s.isScroll){



            s.scroll = $('<div class="slider-scroll"></div>')
            s.scrollBar = $('<div class="slider-scroll-bar" ></div> ')
            s.scroll.append(s.scrollBar)


            //计算scrollbar按钮的宽度
            s.scrollbarWidth = (s.showNum / s.length) * 100;
            s.scrollBar.css('width', s.scrollbarWidth+'%')

            _this.append(s.scroll);

        }

        //如果是竖向排列的话，修改unitWith为unitHeight ,        并修改ship快读为unitWidth高度为综合高度
         if(s.isVertical == true){

             s.ship.width(s.unitWidth);
             s.ship.css({height: s.length* s.unitHeight,width: s.unitWidth})
             _this.css({height:s.showNum * s.unitHeight,width: s.unitWidth})
             s.unitWidth = s.unitHeight;
         }

        //定位开始元素位置 startNum
        var targetPos = s.startNum * s.unitWidth
        move(-targetPos)

    }

    //初始化样式
    function initStyle(){
        s.ship.css('transition','all '+ s.speed +' ease-out')
    }






    //向后翻页
    function next()
    {

        var max = (s.length - s.showNum)                    //获取可移动的最大个数
        max = max <= 0 ? 0: max                             //检测如果可移动的最大个数为0或下雨0 设定可移动的最大个数为0


        s.currentNum = s.currentNum + s.range               //计算点击后目标状态

        if(s.currentNum > max){                           //当达到最大位置的时候
            s.currentNum = 0;
            //changeNextPrevious(s.next,'remove')
        }

        if(s.currentNum > 0){                              //如果当前位置大于0，则显示previous按钮
           // changeNextPrevious(s.previous,'add')
        }

        var targetPos =   s.currentNum * s.unitWidth;                //计算目标位置
        move(-targetPos)

        if(s.isScroll){
            var percentFar = s.currentNum  / (s.length - s.showNum);
            var scrollPos = s.scrollPos  = (s.scroll.width() - s.scrollBar.width()) * percentFar;

            moveScroll(scrollPos)
        }
    }

    //向前翻页
    function previous(){

        var max =  s.length - s.showNum          ;           //获取可移动的最大个数

        s.currentNum = s.currentNum - s.range;

        if(s.currentNum < 0){
            s.currentNum = max;
           // changeNextPrevious(s.previous,'remove')
        }

        if(s.currentNum < max){                            //当前位置小于最大移动范围的时候，显示next按钮
           // changeNextPrevious(s.next,'add')
        }

        var targetPos = s.currentNum * s.unitWidth                   //计算目标位置s
        move(-targetPos)

        if(s.isScroll){
            var percentFar = s.currentNum  / (s.length - s.showNum)
            var scrollPos = s.scrollPos  = (s.scroll.width() - s.scrollBar.width()) * percentFar


            moveScroll(scrollPos)
        }
    }

    //点击页码（缩略图）的时候
    function pageClick(){

        var max = (s.length - s.showNum)                    //获取可移动的最大个数
        max = max <= 0 ? 0: max                             //检测如果可移动的最大个数为0或下雨0 设定可移动的最大个数为0

        s.currentNum = parseInt($(this).attr('data-pagenum')) * s.range


        if(s.currentNum <= 0){                                //检查是否为最小值
            changeNextPrevious(s.previous,'remove')
            s.currentNum = 0
        }else{
            changeNextPrevious(s.previous,'add')
        }
        if(s.currentNum >= max){                            //检查是否为最大值
            changeNextPrevious(s.next,'remove')
            s.currentNum = max
        }else{
            changeNextPrevious(s.next,'add')
        }

        s.pagers.removeClass('active')
        $(this).addClass('active')

        var targetPos = s.currentNum * s.unitWidth
        s.afterPageClick()
        move(-targetPos)

    }

    //添加或者隐藏前一页/后一页按钮
    function changeNextPrevious(target,action){
        if(s.isNextPrevious){
            if(action == 'remove'){
                target.addClass('invisible')
            }else{
                target.removeClass('invisible')
            }
        }
    }
    //移动ship
    function move(targetPos){

        //执行自定义触发器
        s.beforeChange();
        //同步缩略图、页码状态
        if(s.isPager){
            s.pagers.removeClass('active')
            s.pagers.eq(s.currentNum ).addClass('active')
        }
        var speed = parseFloat(s.speed) * 1000;

        //设置移动方向
        var direction = 'margin-left';
        if(s.isVertical == true){direction = 'margin-top'}

        //检查是否允许支持低版本浏览器动画
        if(s.compatible){
            if(direction = 'margin-left'){direction = 'marginLeft'}
            s.ship.animate({marginLeft:targetPos},speed)
        }else{
            s.ship.css(direction,targetPos)
        }
    }

    //移动滚动条
    function scrollChange(e){

        var scrollbarWidth = s.scroll.width() * (s.scrollbarWidth / 100)
        var max =s.scroll.width() - scrollbarWidth;

        $(this).mousemove(function(event){

            var currentPos = s.scrollPos +  (event.pageX- e.pageX)    //计算鼠标移动的距离

            if(currentPos >= max){                                         //设定最大移动范围

                currentPos = max
                s.currentNum = s.length - s.showNum
                //s.next.addClass('hidden')
                move(-s.currentNum * s.unitWidth)

            }else if(currentPos <= 0){
                currentPos = 0
                s.currentNum = 0
                move(-s.currentNum * s.unitWidth)
                //s.previous.addClass('hidden')
            }else{

                var tmp  =  currentPos / ((s.scroll.width() - s.scrollBar.width())  / Math.floor(s.length - s.showNum))                                          //计算当前的currentNum值


                var targetPos = currentPos / ((s.scroll.width() - s.scrollBar.width())) * ((s.length - s.showNum) * s.unitWidth)
                s.currentNum = Math.floor(tmp)
                s.next.removeClass('hidden')
                s.previous.removeClass('hidden')
                move(-targetPos)
            }



            moveScroll(currentPos)

        })

    }

    function moveScroll(targetPos){

        s.scrollBar.css('margin-left',targetPos)

    }






    //绑定所有的事件
    function bindEvent()
    {
        if(s.isNextPrevious){    //绑定向前向后翻页
            s.previous.click(previous)
            s.next.click(next)
        }

        if(s.isPager){              //绑定页码翻页
            s.pagers.click(pageClick)
        }

        if(s.isScroll){
            s.scrollBar.mousedown(scrollChange)
            s.scrollBar.mouseup(function(){

                s.scrollPos = parseFloat(s.scrollBar.css('margin-left'))
                $(this).off('mousemove')
            })

            s.scrollBar.mouseleave(function(){

                s.scrollPos = parseFloat(s.scrollBar.css('margin-left'))
                $(this).off('mousemove')
            })
        }

        if(s.autoPlay){
            startPlay();
            _this.mouseover(stopPlay)
            _this.mouseleave(startPlay)
        }

    }

    function startPlay(){
        s.instancePlay = setInterval(function(){
            next();
        }, s.during)
    }

    function stopPlay(){
        clearInterval(s.instancePlay);
    }

    function unbindEvent()
    {
        if(s.isNextPrevious){
            s.previous.unbind();
            s.next.unbind();
        }
    }




    //初始化 Init
    (function(){

        createLayOut()
        unbindEvent()
        bindEvent()
        initStyle()

        s.afterInit();
    })()


    if(s.debug){
        console.log('unitWidth', s.unitWidth);
    }

    return this;
}