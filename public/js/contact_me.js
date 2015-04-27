$(function send_mail(sendBtn) {

    $("textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            // get values from FORM
            var name = $("input#name").val();
            var email = $("input#email").val();            
            var message = $("textarea#message").val();			
			
            var firstName = name; // For Success/Failure Message
            // Check for white space in name for Success/Fail message
            if (firstName.indexOf(' ') >= 0) {
                firstName = name.split(' ').slice(0, -1).join(' ');
            }
						
			if(name!=""&&email!=""&&message!="") {			
			
			$.ajax({
			  type: "POST",
			  url: "https://mandrillapp.com/api/1.0/messages/send.json",
			  data: {
				'key': 'l5OcqmQDtM7bZGx-3joPwg',
				'message': {
				  'from_email': 'noreply.facnot@tw.ibm.com',
				  'to': [
					  {
						'email': 'j14370@gmail.com',
						'name': 'James Lei',
						'type': 'to'
					  }
					],
				  'autotext': 'true',
				  'subject': 'Invitation request from ' + name + ' with ' + email,
				  'html': message
				}
			  }
			 }).done(function(response) {
					console.log(JSON.stringify(response)); // if you're into that sorta thing
					bootbox.alert("Thanks your submission!!",function(){
					$("input#name").empty()
					$("input#email").empty()
					$("textarea#message").empty()
			   });			   
			 });
			
			}
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });

    $("a[data-toggle=\"tab\"]").click(function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
});

/*
function sendMail(email,message) {
    var link = "mailto:pcchiu524@gmail.com"
             + "?"
             + "subject=" + escape("This is my subject")
             + "&body=" + escape(message)
    ;

    window.location.href = link;
}
*/

/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
    $('#success').html('');
});
