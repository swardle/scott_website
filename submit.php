
<!-- send e-mail after submitted form -->
<?PHP
	$to = "swardle@gmail.com"; #set addres to send for to 
	$subject = "Message from Scott's Website"; #set the subject line 
	$headers = "From: FormMailer@swardle.com" . "\r\n" .				
				"Reply-To: FormMailer@swardle.com" . "\r\n"; #set the from address 
	$forward = 1; # redirect? 1 : yes || 0 : no 
	$location = "thanks.html"; #set page to redirect to, if 1 is above 

	date_default_timezone_set('America/Los_Angeles');
	$date = date("Y/m/d"); 
	$time = date("h:i:sa"); 

	$msg = "Message from Portfolio site.  Submitted on $date at $time.\n\n"; 
	
	$ispost = false;
	foreach ($_POST as $key => $value) { 
	    $msg .= ucfirst ($key) ." : ". $value . "\n";
	    $ispost = true;
	}

	if(!$ispost)
	{
	    die("not a post");		
	}

	mail($to, $subject, $msg, $headers, " -fFormMailer@swardle.com"); 

	if ($forward == 1) { 
	   # header ("Location:$location"); 

	   echo ('<script type="text/javascript">location.href = "' . $location . '"</script>'); 
	} 
	else { 
	   echo ("Thank you for submitting our form. I will get back to you as soon as possible."); 
	}

	// connect to the server 
	$servername = "localhost";
	$username = "swardlec_seiko";
	$password = "6BQFf.CTRBv4";
	$database = "swardlec_scott_contact";

	// Create connection
	$conn = new mysqli($servername, $username, $password, $database);

	// Check connection
	if ($conn->connect_error) {
	    die("Connection failed: " . $conn->connect_error);
	} 

// Create Insert Function and Thank You Page
	$name    = $conn->real_escape_string($_POST['name']);
	$email   = $conn->real_escape_string($_POST['email']);
	$subject    = $conn->real_escape_string($_POST['subject']);
	$message = $conn->real_escape_string($_POST['message']);
// this will insert to "contact" <-(table name)
	$query   = "INSERT into contact (name,email,subject,message) VALUES('" . $name . "','" . $email . "','" . $subject . "','" . $message . "')";
	$success = $conn->query($query);

	 
	if (!$success) {
	    die("Couldn't enter data: ".$conn->error);
	}
	 
	echo "Thank You For Contacting Us <br>";
	 
	$conn->close();



?>











