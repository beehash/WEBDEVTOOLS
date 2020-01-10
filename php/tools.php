<?php
/*读取excel文件，并进行相应处理*/
$server_path = $_SERVER['HTTP_HOST'];
require_once '../resource/Classes/PHPExcel/IOFactory.php';

class Tools
{
  public function sendPost($url, $data=array()){
    $postdata = json_encode($data);
    $exp = time() + 7*24*60*60*1000;
    $cookie = trim(file_get_contents('cookie.txt'));
    $options = array(
      'http' => array(
        'method' => 'POST',
        'header' => 'Content-type:application/x-www-form-urlencoded\r\n'.
                    'Cookie:'.$cookie.'\r\n',
        'content' => $postdata,
        'timeout' => 30 * 60 // 超时时间（单位:s）
      )
    );
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    return $result;
  }

  public function sendGet($url, $context=null){
      $result = file_get_contents($url, false, $context);
      return $result;
  }
  
  public function send_user_get($url){
    $cookie = trim(file_get_contents('cookie.txt'));
    $ch = curl_init();
    //设置选项，包括URL
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_COOKIE, $cookie);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    //执行并获取HTML文档内容
    $output = curl_exec($ch);
    //释放curl句柄
    curl_close($ch);

    return $output;
  }

  public function getSheetsData($fileName, $sheet){
    $inputFileType = PHPExcel_IOFactory::identify($fileName);
    $objReader = PHPExcel_IOFactory::createReader($inputFileType);
    $objReader->setReadDataOnly(true);
    $objPHPExcel = $objReader->load($fileName);
    // $objPHPExcel->setActiveSheetIndex($sheet);
    // $activeSheetObj = $objPHPExcel->getActiveSheet();
    $activeSheetObj = $objPHPExcel->getSheetByName($sheet);

    return $activeSheetObj;
  }


  public function getColumnsData($fileName, $column, $start_row, $sheet, $end_row){
    $result = array();

    $sheet_obj = $this->getSheetsData($fileName, $sheet);

    // $rowCount = $sheet_obj->getHighestRow();
    $columnCount = $sheet_obj->getHighestColumn();

    for ($row = $start_row; $row <= $end_row; $row++) {
      $v = $sheet_obj->getCell($column.$row)->getCalculatedValue();
      if ($v) {
        $result[] = $v;
      }
    }
    return $result;
  }

  public function getAllDatas($fileName, $sheet, $start_row, $end_row){
    $sheet_obj = $this->getSheetsData($fileName, $sheet);
    $dataArr = array();
    $result = array();

    //$rowCount = $sheet_obj->getHighestRow();
    $columnCount = $sheet_obj->getHighestColumn();
    $end_index = PHPExcel_Cell::columnIndexFromString($columnCount);
  
    for ($row = $start_row; $row < $end_row; $row++) {
      $flag = false;
      for ($column = 0; $column < $end_index; $column++) {
        $col = PHPExcel_Cell::stringFromColumnIndex($column);
        // getCalculatedValue getFormattedValue getHyperlink  getOldCalculatedValue  getDataValidation getCoordinate

        if ($col === 'F' || $col === 'T' || $col === 'V' || $col === 'AH' ||
          $col === 'G' || $col === 'I' || $col === 'K' || $col === 'N') {
          $v = $sheet_obj->getCell($col.$row)->getCalculatedValue();
          if ($col === 'G' || $col === 'I') {
            $v = $v ? gmdate("Y-m-d H:i", PHPExcel_Shared_Date::ExcelToPHP($v)) : null;
          }
          if ($col === 'K' || $col === 'N') {
            $v = $v ? gmdate("Y-m-d", PHPExcel_Shared_Date::ExcelToPHP($v)) : null;
          }
          if($col === 'T' || $col === 'V') {
            $v = number_format($v);
          }
          if ($v) {
              $flag = true;
          }
          $dataArr[$col] = $v;
          $dataArr['row'] = $row;
        }
      }
      
      if ($flag) {
          $result[] = $dataArr;
      }

      $dataArr = null;
    }
    return $result;
  }

  private function onlineValueFilter(){
    $result = array(
      'c_name' => array(
        'reg' => '/<p\s*id=\"cpn-name\">[\n\r]?<span\s*class=\"pcRcp-lrgtxt\"\s*>([^<>]*)<\/span>[\n\r]?<\/p>/',
        'reg_r' => '$1',
      ),
      'c_price' => array(
        'reg' => '/<p\s*id="cpn-price"\s*class="riMaT10"\s*>[\n\r]?<span>([^<>]*)<\/span>[^<>]*<\/p>/',
        'reg_r' => '$1',
      ),
      'c_det' => array(
        'reg' => '/<p\s*class="pcRcp-smltxt\s*cpn-det"\s*>([^<>～]*)～([^<>]*)<\/p>/',
        'reg_r' => '$1-$2',
      ),
      'c_det2' =>array(
        'reg' => '/<li>([^<>]*)チェックイン～([^<>]*)チェックアウト[^<>]*<\/li>/',
        'reg_r' => '$1-$2',
      ),
    );

    return $result;
  }

  public function onlineCouponValue($html){
    $prce_filter = $this->onlineValueFilter();

    $c_name = $this -> preg_online_match($prce_filter['c_name'], $html);
    $c_price = $this -> preg_online_match($prce_filter['c_price'], $html);
    $c_det = $this -> preg_online_match($prce_filter['c_det'], $html);
    $c_det2 = $this -> preg_online_match($prce_filter['c_det2'], $html);
    $c_det = explode('-', $c_det);
    $c_det2 = explode('-', $c_det2);

    $replace_list = array();
    $replace_list['F'] = $c_name;
    $replace_list['T'] = $c_price;
    $replace_list['G'] = array_key_exists(0, $c_det) ? $c_det[0] : '';
    $replace_list['I'] = array_key_exists(1, $c_det) ? $c_det[1] : '';
    $replace_list['K'] = array_key_exists(0, $c_det2) ? $c_det2[0] : '';
    $replace_list['N'] = array_key_exists(1, $c_det2) ? $c_det2[1] : '';

    return $replace_list;
  }
    
  private function preg_online_match($regs, $html){
    $reg = $regs['reg'];
    $reg_r = $regs['reg_r'];
    
    preg_match_all($reg, $html, $m_r);

    if (empty($m_r[0])) {
      return '';
    }
    
    $m_r_c = is_string($m_r[0]) ? $m_r[0] : $m_r[0][0];
    $result = preg_replace($reg, $reg_r, $m_r_c);

    return $result;
  }

  public function set_php_file($filename, $content)
  {
    $fp = fopen($filename, "w");
    fwrite($fp, "<?php exit();?>" . $content);
    fclose($fp);
  }

  public function get_php_file($filename)
  {
    return trim(substr(file_get_contents($filename), 15));
  }
}
