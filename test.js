$(document).ready(function(){
				// build a variable to target the #extend div
				var menu = $('#extend')
				// bind a click function to the call to action fucntion
				$('#ctaUP').click(function(event){
					event.preventDefault();
					// if the banner is extended, retract
					menu.slideUp(400);
					$('#ctaUP').attr("style", "display: none;");
					$('#cta').attr("style", "display: visible;");
					//$('#banner').attr("style", "height: inhereit");
				});

				//else extend the banner 
				$('#cta').click(function(event){
					event.preventDefault();
					menu.slideDown(400);
					$('#ctaUP').attr("style", "display: visible;");
					$('#cta').attr("style", "display: none;");
					//$('#banner').attr("style", "height: 200px;");
				});
			});