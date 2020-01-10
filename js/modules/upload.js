define('uploadfile', ['jquery', 'message', 'service'], function($, message, service) {
  // upload request
  var requestUpload = function (data,filename, func) {
    service.filesRequest({
      url: '../../php/index.php',
      data: data,
      method: 'post',
      success: function (res) {
        func(filename, res);
      }
    });
  }
  
  //when change file
  var changefile = function (fileInput, func) {
    var thefile = fileInput.files[0];
    var filename = thefile.name;
    var index = filename.lastIndexOf('.') + 1;
    var filetype = filename.slice(index).toLowerCase();
    var filesize = thefile.size;
    
    var formdatas = new FormData();
    formdatas.append('upfile', thefile);
    formdatas.append('uname', filename);

    
    if(filetype !== 'xls' && filetype !== 'xlsx') {
      func({code: -1, msg: '上传文件类型错误！请上传xls，xlsx类型的文件'});
      return;
    }
    if (filesize > 1024*1024*6) {
      func({code: -1, msg: '上传文件大小不能大于6M'});
      return;
    }
    
    
    requestUpload(formdatas, filename, function (filename, res) {
      func(filename, res);
    });
  }
  
  //expose methods
  return {
    upload: function (func) {
      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.name='uploadfile';
      fileInput.click();
      
      fileInput.onchange = function(e) {
        $("#load").show();
        changefile(this, func);
      };
      
    }, // upload end
  } 
});