<?php


$certPassword = filter_input(INPUT_GET, 'certPassword', FILTER_SANITIZE_STRING);
$certPfxName = filter_input(INPUT_GET, 'certPfxName', FILTER_SANITIZE_STRING);

$fileName = ($_FILES["PATHCERTIFICADO"]["name"]);

$arquivo_nome = explode(".", $_FILES['PATHCERTIFICADO']['name'])[0];
$arquivo_nome_e_extensao = $arquivo_nome . ".pfx";

//file upload path
if(!file_exists("certs/")){
    mkdir("certs/");
}
$targetDir = "certs/";
$targetFilePath = $targetDir . $fileName;

//allow certain file formats
$fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);
$allowTypes = array('pfx');

if (in_array($fileType, $allowTypes)) {
    //upload file to server
    if (move_uploaded_file($_FILES["PATHCERTIFICADO"]["tmp_name"], $targetFilePath)) {

    } else {
        echo json_encode(
            array(
                'xMotivo' => 'Por favor, escolha um arquivo pfx. Clique para carregar outro.',
                'cStat' => 0
            ), JSON_UNESCAPED_UNICODE
        );
        exit;
    }
} else {
    echo json_encode(
        array(
            'xMotivo' => 'Algum problema ocorreu, por favor, tente novamente.',
            'cStat' => 0
        ), JSON_UNESCAPED_UNICODE
    );
    exit;
}


require_once "vendor/autoload.php";

try {
    if(false === ($pfx = file_get_contents('certs/'.$certPfxName)));
} catch (\Exception $e) {
    //aqui você trata possíveis exceptions da assinatura
    echo json_encode(
        array(
            'xMotivo' => 'Certificado não encontrado ou inválido!',
            'cStat' => 0
        ), JSON_UNESCAPED_UNICODE
    );
    exit;
}


try {
    $cert = NFePHP\Common\Certificate::readPfx($pfx, "$certPassword");
} catch (\Exception $e) {
    //aqui você trata possíveis exceptions da assinatura
    echo json_encode(
        array(
            'xMotivo' => 'Certificado e/ou senha inválido(s)!',
            'cStat' => 0
        ), JSON_UNESCAPED_UNICODE
    );
    exit;
}

if ($cert->isExpired()) {

    echo json_encode(
        array(
            'xMotivo' => 'Certificado VENCIDO! Não é possivel mais usa-lo',
            'cStat' => 0
        ), JSON_UNESCAPED_UNICODE
    );
    exit;
} else {
    $validTo = $cert->getValidTo();

    echo json_encode(
        array(
            'xMotivo' => 'Certificado Válido, até '.$validTo->format('d/m/Y'),
            'data_certificado' => $validTo->format('Y-m-d'),
            'nome_certificado' => $arquivo_nome_e_extensao,
            'cStat' => 1
        ), JSON_UNESCAPED_UNICODE
    );
}