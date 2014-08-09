	//=======================================================================

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
	// The Aardvark class allows variables to be transferred between client and
	// server asynchronously using the XMLHttpRequest object, or the fallback method
	// if the XMLHttpRequest object is not supported.

	// $Id: aardvark.php,v 1.1 2005/05/26 08:28:59 mikebird Exp $

	function Aardvark(object) {

		// Define the global variables this class uses

		// We need to know which object to assign the received variables to
		this.object = object;

		// This is the object for the XMLHttpRequest class
		this.xmlhttp = new Object();

		// Macs dont like images using the Image() class, so we
		// need to detect if the browser is a mac and act accoringly
		this.mac = navigator.platform.indexOf('Mac');

		// MS IE doesnt like image event handlers
		this.msie = navigator.userAgent.indexOf("MSIE");

		// The iamge object for sending our data
		this.image = new Image();

		// Boolean whether to use the fallback method instead of XMLHttpRequest
		this.fallback = false;

		// The URL that the HTTP request will be sent to
		this.url = '';

		// An array of variables which can be added to using the add() method and
		// are sent across when the send() method is called
		this.variables = new Array();

		// An array of received variables
		this.vars = new Array();

		// This is the hostname of the web page the class has been called from
		this.connect_host = '';

		// This is the hostname of the web page the class is located at
		this.install_host = '';

		// Boolean if the XMLHttpRequest object has been defined.
		this.initiated = false;

		// Boolean if the url has already been built
		this.url_built = false;

		// Contains the function that will be executed when a response has been
		// received from the server
		this.response = '';

		// Data garbage collection.. the default is to reset the variable output
		// buffer after sending the request, however you may want to add variables
		// to the buffer, send a request then add more and send another request
		// in which case this should be set to 'append' which can be done
		// via the gc arguement in the send() function or by setting it directly
		this.gc = 'reset';


		// XMLHttpRequest can't sent HTTP requests to remote hosts, so check that
		// the URL is not remote.
		this.validateurl = function()
		{
			// Get the url of the request
			this.connect_host = this.url;

			// Get the url of the current page
			this.install_host = document.location.toString();

			// Use regular expressions to filer out the host names
			this.connect_host = this.connect_host.replace(/(.*?)\/\/(.*?)\/(.*)/i, "$1//$2");
			this.install_host = this.install_host.replace(/(.*?)\/\/(.*?)\/(.*)/i, "$1//$2");
			this.connect_host = this.connect_host.replace(/(.*?)\/\/(.*?)/i, "$2");
			this.install_host = this.install_host.replace(/(.*?)\/\/(.*?)/i, "$2");

			// If the host we are connecting to is not the same as the one
			// we are connecting from, dont use the XMLHttpRequest object
			if (this.connect_host !== this.install_host) {
				// Make sure the fallback method is used
				this.fallback = true;
			}

		}

		// Serialize data so that they are converted back to the correct
		// variable type at the other end - an array, integer or string
		// --
		// [required] data:	  The data that needs to be serialized
		// --
		this.serialize = function(data)
		{
			var i;
			var string = '';
			var count = 0;
			if (typeof(data) == 'object' && data.constructor == Array) {
				for (i in data) {
					count++;
					string += this.serialize(i) + this.serialize(data[i]);
				}
				string = 'a:'+count+':{'+string+'}';
				return string;
			} else if (typeof(data) == 'string') {
				return 's:'+data.length+':"'+data+'";';
			} else if (typeof(data) == 'number') {
				if (Math.round(data) == data) {
					return 'i:'+data+';';
				} else {
					return 'd:'+data+';';
				}
			} else if (typeof(data) == 'boolean') {
				if (data == true) {
					return 'b:1;';
				} else {
					return 'b:0;';
				}
			} else {
				return 'N;';
			}
		}

		// Unserialize data that has been received so that it is converted
		// back to the correct variable type - an array, integer or string
		// --
		// [required] data:	  The data that needs to be unserialized
		// --
		this.unserialize = function(data)
		{
			var regex = new RegExp();
			var match;
			var regex2 = new RegExp();
			var match2;
			var regex3 = new RegExp();
			var match3;
			var a = new Array();
			if (data.substring(0, 1) == 'a') {
				regex = new RegExp(/a\:([^\:]*)\:\{(.*)\}/);
				if (match = regex.exec(data)) {
					var open = 0;
					var close = 0;
					var skip = false;
					var okdata = '';
					var s = 0;
					for (var i = 0; i < match[0].length; i++) {
						if (match[0].charAt(i) == '{') {
							open++;
						} else if (match[0].charAt(i) == '}') {
							close++;
							if ((open - close) == 0) {
								okdata = match[2].substring(s, (i+1));
								i = match[0].length;
							}
						}
						if (close > open) {
							s = i;
						}
					}
					if (!skip && okdata !== '') {
						regex2 = new RegExp(/([^;]*);(.*)/);
						while (match2 = regex2.exec(okdata)) {
							if (match2[2].substring(0, 1) == 'a') {
								a[this.unserialize(okdata)] = new Array();
							}
							a[this.unserialize(okdata)] = this.unserialize(match2[2]);
							regex3 = new RegExp(/([^;]*);(.*)/);
							if (match3 = regex3.exec(okdata)) {
								okdata = match3[2];
								if (okdata.substring(0, 1) == 'a') {
									open = 0;
									close = 0;
									var start = 0;
									for (i = 0; i < okdata.length; i++) {
										if (okdata.charAt(i) == '{') {
											open++;
										} else if (okdata.charAt(i) == '}') {
											close++;
											if ((open - close) == 0) {
												start = i+1;
												i = okdata.length;
											}
										}
									}
									okdata = okdata.substring(start, okdata.length);
								}
							} else {
								regex3 = new RegExp(/([^;]*);([^;]*);(.*)/);
								if (match3 = regex3.exec(okdata)) {
									okdata = match3[3];
								} else {
									okdata = '';
								}
							}
						}
						return a;
					} else {
						return false;
					}
				}
			} else if (data.substring(0, 1) == 'i') {
				regex = new RegExp(/i\:([^;]*);/);
				if (match = regex.exec(data)) {
					return Number(match[1]);
				}
			} else if (data.substring(0, 1) == 'n') {
				regex = new RegExp(/n\:([^;]*);/);
				if (match = regex.exec(data)) {
					return Number(match[1]);
				}
			} else if (data.substring(0, 1) == 's') {
				regex = new RegExp(/s\:([^\:]*)\:"([^\"]*)";/);
				if (match = regex.exec(data)) {
					if (Number(match[1]) == match[2].length) {
						return unescape(match[2].replace(/\+/g, ' '));
					}
				}
			} else if (data.substring(0, 1) == 'b') {
				if (data.substring(0, 3) == 'b:1') {
					return true;
				} else if (data.substring(0, 3) == 'b:0') {
					return false;
				}
			} else {
				return null;
			}
		}

		// Add variables to the array, so that they can be sent when the
		// 'send' method is called.
		// --
		// [required] variable:  The variable name
		//
		// [required] data:	  The data that the variable contains
		// --
		this.add = function(variable, data)
		{
			// JavaScript arrays are 0 index, so the length
			// of the array will be (index + 1). This is useful
			// as we will need to refer to the new array value
			// that is about to be created
			var i = this.variables.length;

			// Push the array (adds a new value to the array)
			this.variables.push(Array());

			// Add two array values within this array that will hold
			// the variable info
			this.variables[i].push('variable');
			this.variables[i].push('data');

			// Assign the variable info to the array
			this.variables[i]['variable'] = escape(variable);
			this.variables[i]['data'] = this.serialize(data);
		}

		// Make a string of ascii numbers so that the data can be transferred
		// over a http request
		// --
		// [required] data:	  The data that needs to be encoded
		// --
		this.encode = function(data) {
			chr = 0;
			var enc = '';
			for (var i = 0; i < data.length; ++i) {
				chr = data.charCodeAt(i);
				enc += '_'+chr;
			}
			return enc;
		}

		// Build the URL using the variables stored by the 'add()' function
		// --
		// [required] url:	   The address that the variables will be built onto
		// --
		this.build = function(url)
		{
			// Only build the url if it has not been built before - we don't
			// want any duplicate values
			if (!this.url_built) {
				// If there are values in the variable output buffer
				if (this.variables.length > 0) {
					// Loop through them
					for (var i = 0; i < this.variables.length; i++) {
						if (url.indexOf('?') > -1) {
							// If the URL already has variables in it then add to them
							url += '&aardvark_'+this.variables[i]['variable']+'='+this.encode(this.variables[i]['data']);
						} else {
							// If the URL has no variables in it, start the string off
							url += '?aardvark_'+this.variables[i]['variable']+'='+this.encode(this.variables[i]['data']);
						}
					}
				}
				// Make the built URL accessable globally
				this.url = url;
				// Set the flag to indicate we have just built the URL
				this.url_built = true;
			}
		}

		// Garbage collection
		this.garbage = function()
		{
			// Find what type of garbage collection we need to do
			switch (this.gc) {
			// Append the variable output buffer
			case 'append':
				// Leave this.variables alone
				break;
			// Reset the variable output buffer
			case 'reset':
			default:
				// Reset the array
				this.variables = new Array();
				break;
			}
		}

		// Send the request to the server
		// --
		// [required] url:	   The address that the request will be sent to
		//
		// [optional] response:  The javascript function that will be invoked when the request
		//					   completes and incoming variables all sorted out nicely
		//
		// [optional] gc:		Garbage collection..
		//					   'reset':  Resets the variable output buffer
		//					   'append': Keeps the current varible output buffer and
		//								 appends new variables to the end of it
		// --
		this.send = function(url, response, gc)
		{
			// Make the response parameter global
			this.response = response;
			// Check to see if we need to override the garbage collection
			if (gc !== '') {
				this.gc = gc;
			}
			// Build the URL from the variable output buffer (this.variables array)
			this.build(url);
			// Check to see if the URL we are requesting is on the same domain as this file.
			// If not, we cant use XMLHttpRequest
			this.validateurl();
			// The data has now nicely been formatted into a URL, so lets deal with the garbage
			this.garbage();
			// IE Support for XMLHttpRequest Object
			if (window.ActiveXObject && !window.XMLHttpRequest) {
				window.XMLHttpRequest = function() {
					var msxhr = new Array('Msxml2.XMLHTTP.5.0', 'Msxml2.XMLHTTP.4.0', 'Msxml2.XMLHTTP.3.0', 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP');
					for (var i = 0; i < msxhr.length; i++) {
						try {
							return new ActiveXObject(msxhr[i]);
						} catch (e) {
						}
					}
					return null;
				};
			}
			// If we are still having problems then go to the fallback method
			if (!window.XMLHttpRequest) {
				this.fallback = true;
			}
			// If we dont need to use the fallback method and its not an SSL connection, then
			// use the XMLHttpRequest object
			if (!this.fallback && this.url.substring(0, 5) !== 'https') {
				// Define the XMLHttpRequest object
				this.xmlhttp = new XMLHttpRequest();
				// We need to know when the request has completed, so invoke this
				// function when the request's state changes
				this.xmlhttp.onreadystatechange = function()
				{
					// Define the content variable
					var content = '';
					// Define the headers array
					var headers = new Array();
					// Define the loop index
					var i = 0;
					// Catch exceptions
					try {
						// If the request's state is 4 (completed)..
						if (eval(object+".xmlhttp.readyState") == 4) {
							// If the HTTP request returned a 200 OK response then continue
							if (eval(object+".xmlhttp.status") == 200) {
								// IE doesnt lump all the Set-Cookie's into one header so we need
								// to pick them out
								if (this.msie > -1) {
									// Get the headers
									headers = eval(object+".xmlhttp.getAllResponseHeaders()");
									if (typeof(headers) == 'undefined') {
										// No incoming variables, invoke the resonse function
										if (this.response !== '') {
											eval(this.response);
										}
									} else {
										// Split up the headers so they are separate
										headers = headers.split("\n");
										// Loop through them
										for (i = 0; i < headers.length; i++) {
											// If its a Set-Cookie header then thats good..
											if (headers[i].substring(0, 11) == 'Set-Cookie:') {
												headers[i] = headers[i].substring(11, headers[i].length)
												// We dont need the expiry date or path, so split it up
												headers[i] = headers[i].split("; ");
												// The first bit contains the name and data
												if (headers[i][0].substring(0, 1) == ' ') {
													content += headers[i][0].substring(1, headers[i][0].length) + '; ';
												} else {
													content += headers[i][0] + '; ';
												}
											}
										}
									}
								} else {
									// All other browers make it simple for us..
									if (eval(object+".xmlhttp.getAllResponseHeaders()").indexOf('Set-Cookie') > -1) {
										headers = eval(object+".xmlhttp.getResponseHeader('Set-Cookie')");
										if (typeof(headers) == 'undefined') {
											// No incoming variables, invoke the resonse function
											if (this.response !== '') {
												eval(this.response);
											}
										} else {
											// Split up the header into each cookie
											headers = headers.split("path=/");
											// Loop through the cookies
											for (i = 0; i < headers.length; i++) {
												// We dont need the expiry date or path, so split it up
												headers[i] = headers[i].split("; ");
												// The first bit contains the name and data
												if (headers[i][0] !== '') {
													// Safari separates its cookies with a comma
													if (headers[i][0].substring(0, 2) == ', ') {
														content += headers[i][0].substring(2, headers[i][0].length) + '; ';
													// Other browsers (FireFox etc) with a line break
													} else if (headers[i][0].substring(0, 1) == "\n") {
														content += headers[i][0].substring(1, headers[i][0].length) + '; ';
													} else {
														content += headers[i][0] + '; ';
													}
												}
											}
										}
									} else {
										// No incoming variables, invoke the resonse function
										if (this.response !== '') {
											eval(this.response);
										}
									}
								}
								// Change them into an easier to deal with format identical to
								// the format returned with the js document.cookie
								content = content.replace(/, /gm, "; ");
								content = content.replace(/\n/gm, "; ");
								// Parse the contents
								eval(object+".parse('"+content+"')");
							}
						// If the request's state is 0 (undefined)..
						} else if (eval(object+".xmlhttp.readyState") == 0) {
							// Change to the fallback method
							eval(object+".fallback = true");
							// Try again
							eval(object+".send("+object+".url, '"+response+"', '"+gc+"')");
						}
					} catch(e) {
						// An error occured, return false
						alert("Aardvark encountered a problem\n\n"+e);
						return false;
					}
				};
				// Set the XMLHttpRequest to make a GET request to this.url is asynchronous mode
				this.xmlhttp.open("GET", this.url, true);
				// Send the request
				this.xmlhttp.send(null);
			// The fallback method if we can't use XMLHttpRequest
			} else {
				// If the browser is a mac, we can't use the Image() object
				if (navigator.platform.indexOf('Mac') > -1) {
					// Set the div to include the image, forcing the browser to send the request
					document.getElementById('aardvark_div_'+object).innerHTML = '<img alt="Aardvark" id="aardvark_img_'+this.object+'" width="0" height="0" src="'+this.url+'" />';
					// make it avaiable globally
					this.image = document.getElementById('aardvark_img_'+object);
				} else {
					// Set this.image to a new image
					this.image = new Image();
					// Send it to the request url
					this.image.src = this.url;
				}
				// We know the image is going to produce errors because no image is actually returned
				// Allow the browser time to deal with the cookies in the response then parse them
				if (this.msie > -1) {
					setTimeout(object+".parse(document.cookie)", 1500);
				} else {
					this.image.onerror = setTimeout(object+".parse(document.cookie)", 1200);
				}
			}

		}

		this.parse = function(content)
		{
			// Allow for new URL's
			this.url_built = false;
			// Define the input buffer containing incoming variables
			var variables = new Array();
			// Split up the contents of the HTTP response into nice chunks of variables
			content = content.split("; ");
			// Define the arr index
			var arr = 0;
			// The number of variables we have
			var clen = content.length;
			// Used to store the variable name and data of the current variable in the loop
			var rcontent = '';
			// Define the loop index
			var i = 0;
			// Define the variable that stores the incoming variable name
			var varname = '';
			// Define the variable that stores the incoming variable data
			var vardata = '';
			// Loop through the incoming variables
			for (i = 0; i < clen; i++) {
				// Split the variable we are working with into two bits, the name and the data
				rcontent = content[i].split('=');
				// If the name starts with aardvark_ then it belongs to us
				if (rcontent[0].substring(0, 9) == 'aardvark_') {
					// Make sure the name is not nothing
					if (rcontent[0].substring(9, rcontent[0].length) !== '') {
						// Put the variable name and data into two local variables so that code is cleaner
						varname = unescape(rcontent[0].substring(9, rcontent[0].length));
						vardata = this.unserialize(unescape(rcontent[1]));
						// Assign the data to the 'incoming variable' array
						this.vars[varname] = vardata;
						// We also want to send an array of the variables we have just received from
						// the request to the function that will be invoked as that function may
						// not know what variables it is getting
						arr = variables.length;
						variables[arr] = new Array();
						variables[arr]['variable'] = this.object+'.'+varname;
						variables[arr]['data'] = vardata;
						// We're done with the cookie, remove it
						document.cookie = rcontent[0]+'=; expires=01/01/1970 00:00:00; path=/;';
					}
				}
			}
			// All incoming variables dealt with, invoke the resonse function
			if (this.response !== '') {
				eval(this.response);
			}
		}

		// Mac's cant use the Image() object, so write the image onto the page instead inside this div
		if (navigator.platform.indexOf('Mac') > -1) {
			document.write('<div id="aardvark_div_'+this.object+'"></div>');
			document.getElementById('aardvark_div_'+object).style.display = 'none';
		}

	}

	//=======================================================================
