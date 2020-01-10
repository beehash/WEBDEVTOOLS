<?php
header("Content-Type: text/html; charset=utf-8");  
include_once './tools.php';

$column_key = $_REQUEST['columnKey'];
$tools = new Tools();

$base_url = 'https://coupon.rakuten.co.jp/getCoupon?getkey=';
$url = $base_url.''.$column_key;
$log_url  = 'https://aps1.travel.rakuten.co.jp/portal/my/prv_page.first?f_tab=1';

$online_coupon_html = $tools->send_user_get($url);

$online_datas = $tools->onlineCouponValue($online_coupon_html);
$excel_datas = $tools->get_php_file('excel_datas.php');
$excel_datas = json_decode($excel_datas, true);


$rows = count($excel_datas);
for($i =0; $i< $rows; $i++){
  if($excel_datas[$i]['AH'] === $column_key) {
    $excel_data_item = $excel_datas[$i];
  }
}

if(!isset($excel_data_item) || empty($excel_data_item)) {
  return '{"code": -2, "msg": "表格中没有匹配的值！"}';
}

// var_dump($excel_data_item, $online_datas);
$flag = true;
$unmatchd_list = array();
foreach ($online_datas as $key => $value) {
  if($key === 'G' || $key === 'I' || $key === 'K' || $key === 'N') {
    $online_datas[$key] = strtotime($online_datas[$key]);
    $excel_data_item[$key] = strtotime($excel_data_item[$key]);
  }
  if ( $online_datas[$key] !== $excel_data_item[$key]){
    $flag = false;
    $unmatchd_list[] = array('cell' => $key.''.$excel_data_item['row'], 'couponKey' => $column_key);
  }
}

if ($flag) {
  echo '{"code": 3, "msg": "没有不匹配的值"}';
  return;
}

$unmatchd_list = json_encode($unmatchd_list);
echo '{"code": 2,"msg": "有不匹配的值！", "excel": '.$unmatchd_list.'}';
?>