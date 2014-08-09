# Aardvark

Aardvark was developed back in 2005 for a live support application. It's purpose was to provide a cross-browser method to transfer data asynchronously between the browser and the webserver in a time before the XMLHttpRequest was fully adopted.

For historical reference it's now available on GitHub :)

Essentially it worked by creating a new Image() object and hooking onto it's onload event. The image had a src of the file which would process the query sent to it and return the data via a cookie. A JavaScript version of PHP's serialize() and unserialize() was developed for data interchange, but was never perfected as soon after release JSON gained traction and was an obvious better solution.

Below is the documentation from back then...

## What is Aardvark?

Aardvark is a lightweight Ajax engine that is capable of send and receiving variables.

At the moment Aardvark supports transfer between JavaScript and PHP.

Variables sent by Aardvark maintain their data type and structure, so you can transfer multi-dimensional arrays, strings, integers, booleans and null values between the client and server easily without disrupting the GUI.

## Is Aardvark Limited To The Latest Generation Of Browsers?

Not at all! Aardvark does not rely on the XMLHttpRequest JavaScript object which means you are not limited to the latest generation of browsers.

## How Easy Is Aardvark To Use?

Very easy, Its as simple as including the Aardvark class, creating a new instance of Aardvark, adding the variable, and sending it!

.. Yes, thats only four lines of code.

## Why Don't You Use WDDX?

At the moment, Aardvark only supports transfer of variables between Javascript and PHP. By using WDDX, variables are translated into XML which is much larger in size than PHP's serialize function. Therefore serialize() and unserialize() are used to save bandwidth consumption and to make Aardvark as lightweight as possible.

## Example Usage

    <script type="text/javascript" language="javascript" id="aardvark" src="aardvark.js">
	<script type="text/javascript" language="javascript">
	<!--
		// Include the Aardvark class above.
	
		// Create an object from the Aardvark class. Make sure the objects name
		// is passed into the class so that variables can be assigned to the
		// right object
		var Connection = new Aardvark('Connection');
	
		// Function that starts the asnchronous variable transfer
		function request() {
	
			document.getElementById('response').innerHTML = 'Getting MD5 hash';
		
			// Define the variables you wish to send
			var query = document.getElementById('query').value;
	
			// Send the variables across to the server. When a response is received,
			// fire window.passback() function. 'variables' is an array of the
			// variables received.
			Connection.add('query', query);
			Connection.send('md5.php', 'passback(variables)');
	
		}
	
		// Function that is fired when new data is received
		function passback(variables) {
			document.getElementById('response').innerHTML = Connection.vars['md5'];
		}
	
	//-->
	</script>

    <input type="text" name="query" id="query" /> <a href="javascript:request();">MD5 it!</a>
    <div id="response"></div>
