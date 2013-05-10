/**
 * references :
 * ASN.1 :http://en.wikipedia.org/wiki/Abstract_Syntax_Notation_One
 * LDAP RFC complete ASN.1 definition http://www.ietf.org/rfc/rfc2251.txt
 * node.js lib 'asn1' : https://github.com/mcavage/node-asn1
 */
var net = require('net')
  , asn1 = require('asn1')
  , fs = require('fs')
  ;

var BerReader = asn1.BerReader;

var srv = net.createServer(function (c) {

  c.on('end', function() {
  	console.log('client terminated connection');
  });
  
  c.on('data', function(chunk) {
  	var op = chunk.toString('hex', 5, 6);

  	console.log('op is ' + op);
  	switch(op) {
  	  case '50' :
  	    //don't care
  	    break;
  	  case '42' : //unbind request
  	    //don't care
  	    break;
  	  case '60' : //bind request
  	    c.write('300c02010161070a010004000400', 'hex');
  	    break;
  	  case '63' : //search request
  	    //no need to parse request, just response with what we want!
  	    var w = new asn1.BerWriter();
		w.startSequence();
		w.writeInt(2); //messageID
		  w.startSequence(0x64);//searchResEntry
		    w.writeString('cn=mySupply ApS (funktionscertifikat)+serialNumber=CVR:25894375-FID:1333439025922,o=MYSUPPLY ApS // CVR:25894375,c=DK');
		      w.startSequence(); 
		        w.startSequence();
		        w.writeString('objectClass');
		        w.startSequence(0x31);
		          w.writeString('top');
		          w.writeString('uniquelyIdentifiedUser');
		          w.writeString('organizationalPerson');
		          w.writeString('person');
		          w.writeString('entrustUser');
		          w.writeString('pkiUser');
		        w.endSequence();
		        w.endSequence();
		        w.startSequence();
		          w.writeString('serialNumber');
		          w.startSequence(0x31);
		            w.writeString('CVR:25894375-FID:1333439025922');
		          w.endSequence();
		        w.endSequence();
		        w.startSequence();
		          w.writeString('sn');
		          w.startSequence(0x31);w.writeString('(funktionscertifikat)');w.endSequence();
		        w.endSequence();
		        w.startSequence();
		          w.writeString('cn');
		          w.startSequence(0x31);w.writeString('mySupply ApS (funktionscertifikat)');w.endSequence();
		        w.endSequence();
		        w.startSequence();
		          w.writeString('userCertificate;binary');
		            var cer = fs.readFileSync('/tmp/my.cer');
		            w.startSequence(0x31);w.writeBuffer(cer, 0x04);w.endSequence();
		        w.endSequence();
		      w.endSequence(); 
		  w.endSequence();
		w.endSequence();
		c.write(w.buffer);

		var ww = new asn1.BerWriter();
		ww.startSequence();
		  ww.writeInt(2);// messageID
		  ww.startSequence(0x65);//searchResDone
		    ww.writeInt(0, 0x0a);
		    ww.writeString('');
		    ww.writeString('');
		  ww.endSequence();
		ww.endSequence();
		c.write(ww.buffer);
  	    break;

  	}
  });
});

srv.listen(1389);