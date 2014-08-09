<?php
	// Copyright © 2005 Michael Bird. All Rights Reserved

	// This file is part of Aardvark.

	// Aardvark is free software; you can redistribute it and/or modify
	// it under the terms of the GNU General Public License as published by
	// the Free Software Foundation; either version 2 of the License, or
	// (at your option) any later version.

	// Aardvark is distributed in the hope that it will be useful,
	// but WITHOUT ANY WARRANTY; without even the implied warranty of
	// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	// GNU General Public License for more details.

	// You should have received a copy of the GNU General Public License
	// along with Help Center Live; if not, write to the Free Software
	// Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

	// Contributors: Michael Bird

	// File Comments:
	// This file allows us to use Aardvark to send and receive variables to the client.

	// Include Aardvark
	include_once('../aardvark.php');

	// Make a new object from the Aardvark class
	$connection = new Aardvark();

	// Receive all the variables sent into the file
	$variables = $connection->receive();

	$subject = 'Inquiry';
	$to = 'test@example.com';
	$toname = 'Test';
	$from = $connection->vars['from'];
	$fromname = $connection->vars['fromname'];
	$company = $connection->vars['company'];
	$telephone = $connection->vars['telephone'];
	$mobile = $connection->vars['mobile'];
	$address = $connection->vars['address'];
	$message = $connection->vars['message'];

	function email($to, $toname, $from, $fromname, $subject, $message) {
		if ($to == '') {
			return "Recipient e-mail address was empty!";
		} else if ($toname == '') {
			return "Recipient name was empty!";
		} else if ($from == '') {
			return "Your e-mail address was empty!";
		} else if ($fromname == '') {
			return "Your name was empty!";
		} else if ($subject == '') {
			return "The subject was empty!";
		} else if ($message == '') {
			return "The message was empty!";
		} else {
			if (preg_match('/^[A-Z0-9._-]+@[A-Z0-9][A-Z0-9.-]{0,61}[A-Z0-9]\.[A-Z.]{2,6}$/i', $to) > 0) {
				if (preg_match('/^[A-Z0-9._-]+@[A-Z0-9][A-Z0-9.-]{0,61}[A-Z0-9]\.[A-Z.]{2,6}$/i', $from) > 0) {
					if (mail($toname.' <'.$to.'>', $subject, $message, 'From: '.$fromname.' <'.$from.'>')) {
						return "Success! Your message was sent.";
					} else {
						return "Error! There was a problem with the server that meant the e-mail could not be sent.";
					}
				} else {
					return "Your e-mail address was invalid!";
				}
			} else {
				return "Recipient e-mail address was invalid!";
			}
		}
		return "Error! An unknown problem occured.";
	}

	// Compile e-mail body content
	$body = 'Name: '.$fromname.'
Company Name: '.$company.'
Email: '.$from.'
';

	if ($telephone != '') {
		$body .= 'Contact Number: '.$telephone.'
';
	}

	if ($mobile != '') {
		$body .= 'Mobile Number: '.$mobile.'
';
	}

	$body .= '

Address:
'.$address.'


Message:

'.$message;

	$result = email($to, $toname, $from, $fromname, $subject, $body);

	// Add variables to the output buffer
	$connection->add('result', $result);

	// Send the variables across to the client
	$connection->send();

?>