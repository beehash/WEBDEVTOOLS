  require.config({
  baseUrl: './js/modules/',
  paths: {
    jquery: '../jquery-3.4.1.min',
    tools: 'tools',
    message: 'message',
  },
});

// require some dependent modules
require(['jquery', 'message', 'tools'], function ($, message, tools) {
    // handle excel success data
  var handleExcelResponse = function (res) {
    var excelDatas = JSON.parse(res);
    if(excelDatas.code > 0) {
      var html = '<h3 class="title">unmatched Datas:</h3>';
      for(var n in excelDatas) {
        html +='<p class="report-line"><span>report time: '+ excelDatas[n].currentTime +'</span><span>excel locat at：line' + excelDatas[n].excel.row + '</span><span>json locat at：line' + excelDatas[n].html.index + ', name：' + excelDatas[n].html.key.join(',') + '</span></p>';
      }
      $('.filescomparehtml_area').html(html);
    }else if (excelDatas.code === -2){
      $('.filescomparehtml_area').html('<p class="centralize-text">there is no datas error</p>');
    } else if(excelDatas.code === -1) {
      $('.filescomparehtml_area').html('<p class="centralize-text">no matched rows</p>');
    }
  }
  
  
  
  $("#uploadfile").click(function () {
    tools.upload(function (filename, res) {
      $("#load").hide();
      console.log(res);
      if (res.code > 0) {
        var excelKeys = res.excelKeys;
        var columnkeysTpl = `<option value="" class="grey">there is no data</option>`;
        if(excelKeys.length > 0){
          columnkeysTpl = excelKeys.map((current)=>{
            return `<option value="${current}">${current}</option>`;
          });
          columnkeysTpl = columnkeysTpl.join('');
        }
        
        $("#columnKeys").html(columnkeysTpl);
      } else {
        // pop up some errors about upload file
        message.alert({popText: res.msg});
      }
    });
  });

  $('#confirm').click(function () {
    var onlineParams = {
      url: './php/onlineCompare.php',
      method: 'get',
      data: {},
    };
    $('.form-box2 .form-control').each(function (index, item) {
      var key = $(item).attr('name');
      var val = $(item).val();
      onlineParams.data[key] = val;
    });
    
    tools.request(onlineParams, function (res) {
      res=JSON.parse(res);
      if (res.code === 3) {
        var tipMsg = '<p class="tip-msg">all data is matched</p>';
        $('.filescomparehtml_area').html(tipMsg);
        return;
      }
      if(res.code === 2) {
        let compareTpl = res.excel.map((current, index) => {
          const compareTplItem = `
            <div class="compare-list-box">
              <ul>
                <li class="list-item">
                  unmatched cell in excel: <span class="light">${current.cell}</span><br>
                  unmatched coupon key: <span class="light">${current.couponKey}</span>
                </li>
              </ul>
            </div>
          `;
          return compareTplItem;
        });
        compareTpl = compareTpl.join('');
        $('.filescomparehtml_area').html(compareTpl);
        return;
      }
      if(res.code <0) {
        var tipMsg = '<p class="tip-msg">${res.msg}</p>';
        $('.filescomparehtml_area').html(tipMsg);
      }
    });
    
    
  });
});
