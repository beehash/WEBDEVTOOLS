define('tools', ['jquery'], function($) {
  var changefile = function (fileInput, func) {
    var thefile = fileInput.files[0];
    var filename = thefile.name;
    var index = filename.lastIndexOf('.') + 1;
    var filetype = filename.slice(index).toLowerCase();
    var filesize = thefile.size;
    
    var formdatas = new FormData();
    formdatas.append('upfile', thefile);
    formdatas.append('uname', filename);

    $('.form-box1 .form-control').each(function(index, item){
      var key = $(item).attr('name');
      var val = $(item).val();
      formdatas.append(key, val);
    });
    
    if(filetype !== 'xls' && filetype !== 'xlsx') {
      func(filename, {code: -1, msg: '上传文件类型错误！请上传xls，xlsx类型的文件'});
      return;
    }
    if (filesize > 1024*1024*6) {
      func(filename, {code: -1, msg: '上传文件大小不能大于6M'});
      return;
    }
    requestUpload(formdatas, filename, function (filename, res) {
      func(filename, res);
    });
  }

  var requestUpload = function (data,filename, func) {
    filesRequest({
      url: './php/index.php',
      data: data,
      method: 'post',
      success: function (res) {
        func(filename, res);
      }
    });
  }


  var filesRequest = function (params) {
    $.ajax({
      url: params.url,
      data: params.data,
      method: params.method || 'get',
      contentType: false,
      processData: false,
      dataType: 'json',
      success: function (data) {
        params.success(data);
      },
      error: function (err) {
        console.log(err);
      }
    });
  }
  var setCookie = function(key,value, expiredays){
    var Days = expiredays || 1;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = key + '=' + value + ';expires=' + exp.toGMTString()+';path=/;domain=.senior.com';
  }
  // 文件上传
  var upload = function (func) {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name='uploadfile';
    fileInput.click();
    
    fileInput.onchange = function(e) {
      $("#load").show();
      changefile(this, func);
    };
  }

  var confirm = function (params){
    params.success= confirmResp;
    tools.request(params);
  };

  var request = function (params, func) {
    $.ajax({
      url: params.url,
      data: params.data,
      type: params.method || 'get',
      success: function (data) {
        func(data);
      },
      error: function (err) {
        console.log(err);
      }
    });
  }

  return {
    request,
    upload,
    setCookie,
  }
});