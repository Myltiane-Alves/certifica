<?php

/*
 * Author: Rodrigo Amorim de Moura
 * Data: 07/02/2018
 * Email: ram.amorim@gmail.com
 */

//Iniciando a sessão:
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
  
  }
  //Obtendo o id da sessão iniciada:
  $idSession = session_id();

  $idempresa = $_SESSION['IDLoja'];
  $IDUser = $_SESSION['IDUsuario']; 

  if (isset($_SESSION['IDLoja'])) {

    require_once 'php/conexoes/config.php';
	
	date_default_timezone_set('America/Sao_Paulo');

	$ipaddress = '';
    if (isset($_SERVER['HTTP_CLIENT_IP'])){
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    }else if(isset($_SERVER['HTTP_X_FORWARDED_FOR'])){
        $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    }else if(isset($_SERVER['HTTP_X_FORWARDED'])){
        $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
    }else if(isset($_SERVER['HTTP_FORWARDED_FOR'])){
        $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
    }else if(isset($_SERVER['HTTP_FORWARDED'])){
        $ipaddress = $_SERVER['HTTP_FORWARDED'];
    }else if(isset($_SERVER['REMOTE_ADDR'])){
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    }else{
        $ipaddress = 'UNKNOWN';
    }

    $dataatual = date('d/m/Y');

    $Create = new Create();
    $read = new Read();

    $Dados = filter_input_array(INPUT_POST, FILTER_DEFAULT);

    if (isset($_FILES['PATHCERTIFICADO']) && $_FILES['PATHCERTIFICADO'] != '' && $_FILES['PATHCERTIFICADO']['size'] > 0) {
        $destino_certificado = "../spednfe/certs/";
        $arquivo_temp = $_FILES['PATHCERTIFICADO']['tmp_name'];
        $arquivo_nome = explode(".", $_FILES['PATHCERTIFICADO']['name'])[0];
        $arquivo_nome_e_extensao = $arquivo_nome . ".pfx";
        $Dados['PATHCERTIFICADO'] = "$destino_certificado" . "$arquivo_nome_e_extensao";
    move_uploaded_file($arquivo_temp, $destino_certificado . $arquivo_nome_e_extensao);

        //seleciona o certificado
        $pfx = @file_get_contents("spednfe/certs/$arquivo_nome_e_extensao");
        $str64Encode = base64_encode($pfx);
        $Dados['TXTDadosPFX'] = $str64Encode;

    } else {
        //$Dados['PATHCERTIFICADO'] = $PATHCERTIFICADO'];
        unset($Dados['PATHCERTIFICADO']);
        unset($Dados['TXTDadosPFX']);
    }

    $Dados['IDEmpresa'] = (int) $Dados['IDEmpresa'];
    $Dados['DTUltAlteracao'] = Date("Y-m-d H:i:s");
    $Dados['TPFORMAEMISSAO'] = "teNormal";
    $Dados['ObsInfoAdPadrao'] = ";".$Dados['ObsInfoAdPadrao'].";";
    $Dados['TPVERSAOMODFISCAL'] = "ve400";
    $Dados['TPEMISSAO'] = "libCapicom";
    $Dados['TPAMBIENTE'] = "Produção";
    $Dados['NUCERTIFICADO'] = "1";
    $Dados['STVencida'] = "False";

    $Dados['NULOTEPROD'] = 1;
    $Dados['NULOTEPRODNFC'] = 1;
    $Dados['NULOTHOMNFC'] = 0;
    $Dados['NUULTNFPROD'] = (int) $Dados['NUULTNFPROD'];
    $Dados['NUULTNFCPROD'] = (int) $Dados['NUULTNFCPROD'];
    $Dados['NUULTNFSEPROD'] = (int) $Dados['NUULTNFSEPROD'];
    $Dados['NULOTHOM'] = 0;
    $Dados['NUULTNFHOM'] = 0;
    $Dados['NUULTNFCHOM'] = 0;
    $Dados['NUULTNFSEHOM'] = 0;

	if($Dados['DSCRT'] == 'crtSimplesNacional'){
		$Dados['STOpSimples'] = "True";
	}else{
		$Dados['STOpSimples'] = "False";
	}
	
    unset($Dados['resulmodalcertificado']);
    unset($Dados['empresa']);
    unset($Dados['tCert']);

    $Create->ExeCreate('tbconfiguracao', $Dados);

    $sql = $con->prepare("UPDATE tbloja SET TipoNota='{$Dados['TPMODELODOCFISCAL']}' WHERE IDLoja={$idempresa}");
    $sql->execute();

} else {
    header("location:index.php");
}
?>