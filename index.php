<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>Settle Up | WePay</title>
	<link rel="shortcut icon" href="/img/favicon.ico" />
	<link rel="stylesheet" type="text/css" href="fancybox/jquery.fancybox-1.3.4.css" />
	<link rel="stylesheet" type="text/css" href="css/styles.min.css" />
	<link rel="stylesheet" type="text/css" href="css/calculator.css" />
</head>

<body>
<div id='header'>
	<img src='/img/logo.png' alt='WePay Logo' />
</div>
	
<div id='content_container'>
	<div id='calculator_container'>
		<form id='expense_form'>
		<table id='expense_table'>
			<thead>
				<tr>
					<td>What?</td>
					<td>How Much?</td>
					<td>Who Paid?</td>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class='what_cell'><input type='text' class='textbox example' value='Ski lift tickets' /></td>
					<td class='how_much_cell'><input type='text' class='textbox expense_text example' value='$250.00' /></td>
					<td class='who_cell'><input type='text' class='payer_name example' /></td>
				</tr>
				<tr>
					<td class='what_cell'><input type='text' class='textbox example' value='Ski rentals' /></td>
					<td class='how_much_cell'><input type='text' class='textbox expense_text example' value='$150.00' /></td>
					<td class='who_cell'><input type='text' class='payer_name example' /></td>
				</tr>
				<tr>
					<td class='what_cell'><input type='text' class='textbox example' value='Cabin' /></td>
					<td class='how_much_cell'><input type='text' class='textbox expense_text example' value='$1200.00' /></td>
					<td class='who_cell'><input type='text' class='payer_name example' /></td>
				</tr>
				<tr class='template'>
					<td class='what_cell'><input type='text' class='textbox' /></td>
					<td class='how_much_cell'><input type='text' class='textbox expense_text' /></td>
					<td class='who_cell'><input type='text' class='payer_name' /></td>
				</tr>
			</tbody>
			<tfoot>
				<tr>
					<td class='add_cell'><div class='add_row'>+ Add one more</div></td>
					<td id='total_cell'><div id='total_container'>$0.00</div></td>
					<td><a id='settle_debt_link' href='#settle_container' title="Want more than just a calculator? Click Settle Up and we'll show you how we can help."></a></td>
				</tr>
			</tfoot>
		</table>
		</form>
	</div>
	<div id='instructions'>
		<div id='instruction_container'>
			<h3>Instructions</h3><a id='video_instruction' href='javascript:;'>Short Video</a>
			<ol>
				<li>In each row, enter who paid for what and how much.</li>
				<li>As you enter in new expenses, the "Bill So Far" on the left will update to show who owes what.</li>
				<li>If you want more than just a calculation, click the large "Settle Up" button.</li>
				<li>From there we'll guide you through how we can help you and your friends easily pay each other.</li>
			</ol>
		</div>
	</div>
	<div id='bill_container'>
		<h3>Bill so far...</h3>
		<div id='bill'>No one owes anything!</div>
		<a href='#bill_explanation_container' id='bill_explanation_link'>Explain calculations</a>
	</div>
	<div style='clear:both'></div>
	
	<div id='bill_explanation_container' class='dialog_container'>
		<h3>Split evenly between <span class='num'></span> participants, everyone should pay $<span class='each amount'></span>.</h3>
		<div id='explanation_items'></div>
		<p id='rounding_explantaion'>Since no one can be billed fractions of a penny, we have rounded some people's bills by a penny so the totals adds up correctly.</p>
	</div>
	
	<div id="settle_container" class='dialog_container'>
		<form id='settle_form' action='/post.php' method='post'>
			<div id='contact_container'>
				<p>
					<a target='_blank' href='http://www.wepay.com'>WePay</a> allows you and your friends to bill and pay each other online. 
					All payments are handled <a target='_blank' href='https://www.wepay.com/about/security'>securely</a> through an FDIC insured account.
				</p>
				<p>We just need the information below to set up all the bills for you.</p>
				<table id='contact_table'>
				<thead>
					<tr>
						<th colspan='2'>Where and to whom should we send the bills?</th>
						<th class='me'>Me</th>
					</tr>
				</thead>
				<tbody>
					<tr class='template'>
						<td class='name'><input class='textbox' type='text' /></td>
						<td class='email'><input class='default_input textbox' type='text' /><input type='hidden' /></td>
						<td class='me'><input type='checkbox' name='owner' /></td>
					</tr>
				</tbody>
				</table>
				<input type='hidden' value='' name='group_name'></input>
				<img class='next button' src='https://www.wepay.com/button/medium/TmV4dA==.png' />
			</div>
			<div id='confirm_container'>
				<p class='template'><span class='name'></span> will be <span class='verb'></span> for <span class='amount'></span> at <span class='email'></span></p>
				
				<div class='button_container'>
					<p>To send these bills and reimbursements, click Submit.</p>
					<img class='back button' src='https://www.wepay.com/button/medium/dark/QmFjaw==.png' />
					<img class='submit button' src='https://www.wepay.com/button/medium/U3VibWl0.png' />
				</div>
			</div>
			<div id='response_container'>
				<div class='loading'><img src='img/loading.gif' alt='Loading...' /></div>
				<div class='results'>
					<div class='unknown_error'>
						<p>I'm afraid I can't give you more info since this appears to be a new error I was not expecting.</p>
					</div>
					<div class='known_error'></div>
					<div class='error'>
						<p>The error has been logged and an engineer will take a look at it shortly.</p>
						<p>In the meantime, feel free to refresh the page and try again.</p>
						<p>Please contact support@wepay.com if you have further questions.</p>
					</div>
					<div class='success'>
						<p>Bills have been successfully created and sent to the appropriate people. 
						Once those bills are paid, you can approve reimbursements for those who need to be reimbursed.</p>
					</div>
					<div class='return_user'>
						<p><a target='_blank'>Click here</a> to log in to WePay to view and manage the new bills and reimbursements.</p>
					</div>
					<div class='new_user'>
						<p><a target='_blank'>Click here</a> to claim your new WePay group so you can log in to manage the new bills and reimbursements.</p>
					</div>
				</div>
			</div>
		</form>
	</div>
</div>

<script type='text/javascript' src="js/closure.js"></script>
<script type='text/javascript' src="js/calculator.js"></script>
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-17735933-7']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>
</body>
</html>