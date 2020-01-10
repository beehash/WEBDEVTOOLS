define('message', function(){
  /**
   * elements node
   */
  var elements = {
    rootpop: null,
    close: null,
    confirm: null,
   cancel: null,
  };
  
  // elements style
  var popStyles = {
    mask: [
      'position:absolute',
      "top:0", 'left:0',
      'bottom:0',
      'right:0',
      'background-color:rgba(0,0,0,.5)',
    ],
    container: [
      'position:absolute',
      'top:50%',
      'left:50%',
      'width:300px',
      'background-color:#ffffff',
      'border-radius:8px',
      'transform:translate(-50%,-50%)',
    ],
    title: [
      'width:98%',
      'height:20px',
      'line-height:20px',
      'padding-right:15px',
    ],
    content: [
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'width:100%',
      'min-height:60px',
      'max-height:450px',
      'line-height:28px',
      'font-size:14px',
    ],
    btnsbox: [
      'width:90%',
      'margin:auto',
      'margin-top:0',
      'margin-bottom:15px',
      'text-align:center',
    ],
    btns:  [
      'width:80px',
      'height:32px',
      'line-height:28px;',
    ],
    margR15: 'margin-right:15px',
    right: 'float:right',
    contentDetail: [
      'width:80%',
      'padding-top:20px',
      'padding-bottom:20px',
      'color:#666666',
      'text-align:center',
      'font-size:14px',
    ]
  }
  
  /**
  * 创建弹窗组件
  * @params options{
  *   children 子组件
  *   popText 弹窗文字
  *   template 模板
  * }
  */
  var components = {
    /**
    * mask组件
    * @param {children} 子元素
    */
    maskComponent: function (children) {
      var maskStyle = popStyles.mask;
      maskStyle = maskStyle.join(';');
      var maskTpl = '<div style='+ maskStyle + '>'+ children +'</div>';
      return maskTpl;
    },
    /**
    * 弹窗内容盒子
    * @param {children} 子元素节点
    */
    containerComponent: function (children) {
      var containerStyle = popStyles.container;
      containerStyle = containerStyle.join(';');
      var containerTemplate = '<div style=' + containerStyle + '>' + children +'</div>';
      return containerTemplate;
    },
    /**
    * 弹窗头部组件
    */
    popTitleComponent: function () {
      var title = popStyles.title;
      var close = popStyles.right;
      title = title.join(';');
      var popTitleTemplate = "<div style="+ title + "><span style=" + close + " id='close'>x</span></div>";
      return popTitleTemplate;
    },
    /**
    * 弹窗文字提示组件
    * @param {popText} 弹窗文字提示
    */
    popContentComponent: function (popText) {
      var contentStyle = popStyles.content;
      contentStyle = contentStyle.join(';');
      var contentDetailStyle = popStyles.contentDetail;
      contentDetailStyle = contentDetailStyle.join(';');
      var popContentTemplate = '<div style=' + contentStyle + '> <div style='+ contentDetailStyle + '>' +popText+ '</div></div>';
      return popContentTemplate;
    },
    /**
    * 弹窗按钮组件
    */
    popOptionsComponent: function () {
      var popOptionsStyle = [
        'width:90%',
        'margin:auto',
        'margin-top:0',
        'margin-bottom:15px',
        'text-align:center',
      ];
      var btnStyle = [
        'width:80px',
        'height:32px',
        'line-height:28px;',
        ];
      var margR15 = 'margin-right:15px';
      popOptionsStyle = popOptionsStyle.join(';');
      btnStyle = btnStyle.join(';');
      var btnOptionsTemplate = "<div style="+ popOptionsStyle +"><button style=" + btnStyle + margR15 + " id='confirm'> 确认</button><button style=" + btnStyle + " id='cancel'>取消</button></div>";
      return btnOptionsTemplate;
    },
  } 
  /**
   * @description创建弹窗 
   * @param {type} string 弹窗类型： alert , comfirm
   * @param {popText} string 弹窗文字
   * @param {showClose} boolean 是否展示关闭按钮
   */
  var createPopTemplate = function (options) {
    var popTitle = components.popTitleComponent();
    var popContent = components.popContentComponent(options.popText);
    var popOptions = components.popOptionsComponent();
    popTitle = options.showClose ? popTitle : '';
    popOptions = options.type !== 'alert' ? popOptions : '';
    var containerChildren  = popTitle + popContent + popOptions;
    var container = components.containerComponent(containerChildren);
    var integerPop = components.maskComponent(container);
    var poproot = document.createElement('div');
    poproot.id = 'poproot';
    document.body.appendChild(poproot);
    poproot.innerHTML = integerPop;
  };
  
  /**
   * @description 弹窗初始化
   * @param {Object} 传入的参数
   */
  var _init = function (options) {
    createPopTemplate(options);
    elements.rootpop = poproot;
    elements.close = document.getElementById('close');
    elements.comfirm = document.getElementById('confirm');
    elements.cancel = document.getElementById('cancel');
    elements.close && handEventListener(elements.close, 'click', close, 'add');
    elements.comfirm && handEventListener(elements.comfirm, 'click', close, 'add');
    elements.cancel && handEventListener(elements.cancel, 'click', close, 'add');
  }
  
  /**
   * 添加时间绑定参数
   * @param {element} 元素
   * @param {type} 监听的事件类型
   * @param {func} 函数
   * @param {listenType} 监听类型 add / remove
   */
  var handEventListener = function (element, type, func, listenType) {
    if (listenType === 'add') {
      element.addEventListener(type, func);
    } else {
      element.removeEventListener(type, func);
    }
  };
  /**
   * 关闭弹窗
   * 移除事件，移除元素
   */
  var close = function () {
    document.body.removeChild(elements.rootpop);
    elements.close && handEventListener(elements.close, 'click', close, 'remove');
    elements.comfirm && handEventListener(elements.comfirm, 'click', close, 'remove');
    elements.cancel &&handEventListener(elements.cancel, 'click', close, 'remove');
  }
  
  /**
   * 对外暴露的方法，属性
   */
  return {
    alert: function (options) {
      options = {
        type: options.type || 'alert',
        popText: options.popText || '请输入文字',
        showClose: options.showClose || true,
      }
      _init(options);
      setTimeout(function (){
        close();
      }, 1000);
    },
    close: function () {
      close();
    }
  }
});
