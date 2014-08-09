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


	// Work with the variables, which can be accessed directly from the object
	// or by using the returned array from the receive() Aardvark method.
	// Note you CANNOT output anything.. so this means you cant use echo or
	// print command etc. There is no point any way, as the user will not be able
	// to see it, as Aardvark only transfers variables.

	// Treat the incoming variables as youu would any other external variables,
	// this means sanitising them e.g. using addslashes() with database queries

	// Create MD5 hash
	$hash = md5($connection->vars['query']);

	// Add variables to the output buffer
	$connection->add('md5', $hash);

	// Send the variables across to the client
	$connection->send();

?>