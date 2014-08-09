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
	// This file allows us to use Aardvark to send and receive variables to and from the client.

	// $Id: aardvark.php,v 1.4 2005/05/04 18:57:16 mikebird Exp $

	class Aardvark {

		var $variables_send = array();
		var $variables_receive = array();
		var $vars = array();

		// Add a variable to the output buffer
		function add($variable, $data)
		{
			// increase the variable output buffer array to include them
			if (substr(serialize($data), 0, 1) == 's') {
				$data = serialize(urlencode($data));
			} else {
				$data = serialize($data);
			}
			array_push($this->variables_send, array('variable' => $variable, 'data' => $data));
		}

		// Send the response
		function send()
		{
			// Make sure the pages are not cached
			header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
			header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
			header("Cache-Control: no-store, no-cache, must-revalidate");
			header("Cache-Control: post-check=0, pre-check=0", false);
			header("Pragma: no-cache");
			// IE wants a privacy policy.. so send it one that will make it accept our cookies
			header('P3P: CP="NOI ADM DEV PSAi COM NAV OUR OTRo STP IND DEM"');
			// 60 seconds in the future is sufficient time for the browser to receive the cookie
			// and deal with it
			$time = time() + 60;
			// Loop through the variable output buffer
			foreach ($this->variables_send as $key => $val) {
				// Send the variables across in the form of cookies
				setcookie('aardvark_'.$this->variables_send[$key]['variable'], $this->variables_send[$key]['data'], $time, '/');
			}
			// XMLHttpRequest fails if it doesnt receive any 'body' content so send some of
			// that as well as the headers.
			echo('<!-- done -->');
		}

		function decode($data)
		{
			$dec = '';
			$enc = explode('_', $data);
			foreach ($enc as $key => $val) {
				if ($val !== '') {
					$dec .= chr($val);
				}
			}
			return trim($dec);
		}

		// Grab incoming variables and sort them out into easy to read global variables
		function receive()
		{
			// Define the received variables array
			$this->variables_receive = array();
			foreach ($_GET as $key => $val) {
				if (substr($key, 0, 9) == 'aardvark_') {
					$variable = addslashes(substr($key, 9));
					// Double check to make sure magic quotes are off
					if (get_magic_quotes_gpc()) {
						$data = unserialize($this->decode(stripslashes($val)));
					} else {
						$data = unserialize($this->decode($val));
					}
					array_push($this->variables_receive, array('variable' => $variable));
					array_push($this->variables_receive, array('data' => $data));
					$this->vars[$variable] = $data;
				}
			}
			return $this->variables_receive;
		}

	}

?>