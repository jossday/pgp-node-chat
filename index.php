<?php
$user = "utycbbmayu9hqsye";
$pass ="zFTpYgkH7QxVGVDPcpV";
$bdd = new PDO('mysql:host=bjqsrlc1o-mysql.services.clever-cloud.com;dbname=bjqsrlc1o', $user, $pass);
session_start();
echo '<link rel="stylesheet" type="text/css" href="../styles/messaging.css">';
if((isset($_SESSION['login'])) && ($_SESSION['login'] != "")){
  $logId = $_SESSION['logId'];
  $req = $bdd->prepare("SELECT * FROM users WHERE id=".$logId."");
  $req->execute();
  $req->setFetchMode(PDO::FETCH_OBJ);
  while($data = $req->fetch()){
    if($data->token == ""){
      $token = random(60);
      $req = $bdd->prepare("UPDATE users SET token='".$token."' WHERE id=".$logId."");
      $req->execute();
    }
    else{
      $token = $data->token;
    }
  }
  echo'
  <div id="container">
    <div id="online">
    </div>
  </div>';
}
else{
  header('Location: ../index.php');
}
?>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
  <script src="http://localhost:1337/socket.io/socket.io.js"></script>
  <script src="js/client.js"></script>
  <script>
    startTchat(<?php echo $logId; ?>, "<?php echo $token; ?>");
  </script>
</body>
</html>
