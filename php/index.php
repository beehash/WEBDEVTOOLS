<?php
ob_end_clean();//清除缓冲区,避免乱码
header("Content-Type: application/vnd.ms-excel; charset=utf-8");  
header("Pragma:no-cache");
header("Expires:0");
header("Content-Type: text/html; charset=utf-8");  
date_default_timezone_set("PRC");
/*读取excel文件，并进行相应处理*/
include_once './tools.php';

$uname=$_REQUEST['uname'];
$upfile = $_FILES['upfile'];
$path = $_FILES["upfile"]['tmp_name'];


$file_name = $path;
$sheet = $_REQUEST['sheet'];
$start_row = intval($_REQUEST['start_row']);
$end_row = intval($_REQUEST['end_row']);
$column = $_REQUEST['column'];

$sheet = $sheet ? $sheet : 3;
$start_row = $start_row ? $start_row : 11;
$end_row = $end_row ? $end_row : 18;
$column = $column ? $column : 'AH';

$tools = new Tools();

$excelDatas = $tools->getAllDatas($file_name, $sheet, $start_row, $end_row);
$excel_keys = $tools->getColumnsData($file_name, $column, $start_row, $sheet, $end_row);
$tools->set_php_file('excel_datas.php', json_encode($excelDatas));

if (count($excel_keys)<=0){
  die('{"code": -2, "msg": "请求错误"}');
}

$excel_keys = json_encode($excel_keys);
echo '{"code": 2, "msg": "请求成功", "excelKeys": '.$excel_keys.'}'


// $rows = count($excel_keys);
// $base_url = 'https://coupon.rakuten.co.jp/getCoupon?getkey=';

// $online_coupon_list = [];
// for($i=0;$i<$rows; $i++){
//   $url_item = $base_url.''.$excel_keys[$i];
//   $online_coupon_item = $tools->sendGet($url_item);
//   // $online_coupon_item_r = $tools->onlineCouponValue($online_coupon_item);
  
//   $online_coupon_list[] = $online_coupon_item;
// }
// $tools->onlineCouponValue($online_coupon_list[0]);
// for($i=0; $i<$online_coupon_list; $i++) {
//   $online_coupon_list[$i] = $tools->onlineCouponValue($online_coupon_list[$i]);
// }

// var_dump($online_coupon_list);
?>