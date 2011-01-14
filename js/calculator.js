$(document).ready(function() {
	var DEFAULT_NUM_FIELDS = 1;				//Number of rows in expense table
	var names = [];							//Names of people who owe money
	var current_text = null;				//Last .who_textbox used, for tokeninput plugin
	
	var debts = {};							//Name => Amount owed
	var num_payers = 0;
	var bill_total = 0.0;
	var bill_rounded = false;				//Whether or not we had to round the bill to make it all add up
	
	
	/*** Initialize Expense Table ***/
	init_expense_rows();
	init_expense_elements();
	init_expense_suggestions();
	
	init_instructions();
	init_debt_settler();
	
	function add_expense_row() {
		var clone = $('#expense_table .template').clone();
		clone.removeClass('template').appendTo('#expense_table tbody');
		init_autocomplete($('input.payer_name', clone));
		return clone;
	}
	
	function init_expense_rows() {
		for(var i = 0; i < DEFAULT_NUM_FIELDS; ++i) {
			var row = add_expense_row();
		}
	}
	
	function init_expense_elements() {
		$('.add_row').click(function() {
			add_expense_row();
		});
	    $('.what_cell, .how_much_cell, .who_cell').click(function() {
	        $(this).children('input[type=text]:first').focus();
	    });
		$('.token-input-list-wepay input[type=text]').live('focus', function() {
			current_text = this;
		});
		
		$('.expense_text').live('change', function(e) {
			var cost = parseMoney($(this).val());
			if (!isNaN(cost)) {
				cost = cost.toFixed(2);
				$(this).val('$' + cost);
				update_bill(this);
				$.validationEngine.closePrompt($(this).parent());
			}
			else {
				$.validationEngine.buildPrompt($(this).parent(), 'Please enter a number', 'error');
			}
		});
	}
	
	function init_expense_suggestions() {
		$('#expense_table .example').each(function() {
			$(this).attr('data-default', $(this).val());
			if ($(this).hasClass('payer_name')) {
				init_autocomplete($('input.payer_name', $(this).closest('tr')));
			}
		});
		
		$('#expense_table .example').focus(function() {
			if ($(this).val() == $(this).attr('data-default')) {
				$(this).val('').removeClass('example');
			}
		});
		$('#expense_table .example').blur(function() {
			if ($(this).val() == '') {
				$(this).val($(this).attr('data-default')).addClass('example');
			}
		});
	}
	
	function init_instructions() {
		$("#video_instruction").fancybox({
			'padding'		: 0,
			'autoScale'		: false,
			'transitionIn'	: 'none',
			'transitionOut'	: 'none',
			'width'			: 800,
			'height'		: 500,
			'href'			: 'http://vimeo.com/18776744',
			'type'			: 'swf'
		});
		
		
		$('#bill_explanation_link').click(function() {
			$('#bill_explanation_container').dialog('open');
		});
		$('#bill_explanation_container').dialog({
			'autoOpen': false,
			'modal': true,
			'width': '450px',
			'open': populate_bill_explanation,
			'close': function() {
				$('#bill_explanation_container').hide();
				$('#rounding_explantaion').hide();
			}
		});
	}
	
	function populate_bill_explanation() {
		var each = num_payers > 0 ? bill_total / num_payers : 0;
		$("#bill_explanation_container").dialog( "option", "title", 'The total for this bill is $' + bill_total.toFixed(2));
		$('#bill_explanation_container .num').text(num_payers);
		if (bill_rounded) {
			$('#bill_explanation_container .each').text(each.toFixed(2) + '*');
			$('#rounding_explantaion').show();
		}
		else {
			$('#bill_explanation_container .each').text(each.toFixed(2));
		}

		$('#bill_explanation_container #explanation_items .item').remove();
		for (var i in debts) {
			var html = '<span class="name">' + i + '</span> paid <span class="amount">$' + (each + debts[i]).toFixed(2) + '</span>'
					 + ', so $' + (each + debts[i]).toFixed(2) + ' - ' + each.toFixed(2) + ' = ';
			
			var amountClass = '';
			if (debts[i] < 0) {
				amountClass = 'negative';
			}
			else if (debts[i] > 0) {
				amountClass = 'positive';
			}
			
			html += '<span class="amount ' + (amountClass) + ' ">' + debts[i].toFixed(2) + '</span>.';
			var neg = null;
			
			$('#bill_explanation_container #explanation_items').append('<p class="item">' + html + '</p>');
		}
		
		$('#bill_explanation_container').show();
	}
	
	function init_autocomplete(obj) {
		$(obj).tokenInput(names, {
			'classes': {
				'tokenList': "token-input-list-wepay",
				'token': "token-input-token-wepay",
				'tokenDelete': "token-input-delete-token-wepay",
				'selectedToken': "token-input-selected-token-wepay",
				'highlightedToken': "token-input-highlighted-token-wepay",
				'dropdown': "token-input-dropdown-wepay",
				'dropdownItem': "token-input-dropdown-item-wepay",
				'dropdownItem2': "token-input-dropdown-item2-wepay",
				'selectedDropdownItem': "token-input-selected-dropdown-item-wepay",
				'inputToken': "token-input-input-token-wepay"},
			'searchDelay': 0,
			'onResult': function(results) {
					var name = $(current_text).val();
					var obj = {'id': name, 'name': name};
					var all_names = add_to_names_array(obj, names.slice());
					return trim_names(name, all_names);
				},
			'onSelect': function(selection) {
					names = add_to_names_array(selection, names);
				},
			'onSet': function() {
				$(obj).closest('tr').find('input').removeClass('example');
				update_bill(obj);
			},
			'onRemove': update_bill(obj),
			'enableCache': false,
			'hintText': 'Start typing a friend\'s name'
	    });
		
		var row = obj.closest('tr');
		$('.who_cell .token-input-list-wepay input[type=text]', row).blur(function() {
			$('input', row).removeClass('example');
			if (!$('.who_cell .payer_name:first', row).val() && !$('.what_cell input', row).hasClass('example')) {
				$.validationEngine.buildPrompt($(this).closest('.who_cell'), 'Please enter at least one person', 'error');
			}
			else {
				$.validationEngine.closePrompt($(this).closest('.who_cell'));
			}
		});
	}
	
	//Return names that have been entered but is a superstring of the input so far (for autocomplete)
	function trim_names(name, list) {
		var result = [];
		for(var i = 0; i < list.length; ++i) {
			if (list[i].name.indexOf(name) != -1) {
				result.push({'id': list[i].id, 'name': list[i].name});
			}
		}
		return result;
	}
	
	function init_debt_settler() {
		$("#settle_debt_link").tooltip({
			'delay': 250,
			'direction': 'down',
			'effect': 'slide',
			'position': 'bottom center'
		});
		$('#settle_debt_link').click(function() {
			if (!debts_exist(debts)) {
                $.validationEngine.buildPrompt('#settle_debt_link', 'No debts need to be settled!', 'error');
				return false;
			}
			else {
				fill_debts();
				$('#settle_container').show();
				$('#settle_container').dialog('open');
			}
		});
		
		$('#settle_container').dialog({
			'modal': true,
			'autoOpen': false,
			'width': '500px',
			'title': 'Make it easy for you and your friends to pay each other by using WePay',
			'open': function() {
				$('.formError').remove();
			},
			'close': function() {
				$('#confirm_container').hide();
				$('#response_container').hide();
				$('#contact_container').show();
				$('#settle_container').hide();
				$('.formError').remove();
			}
		});
	}
	/*** End Initializing Expense Table ***/
	

	/*** Expense Calculator ***/
	function add_to_names_array(obj, array) {
		//Linear search to see if it exists, if so replace
		for(var i = 0; i < array.length; ++i) {
			if (array[i].id == obj.id) {
				array[i] = obj;
				return array;
			}
		}
		//Otherwise add
		array.splice(0, 0, obj);
		return array;
	}
	
	function debts_exist(debts) {
		for(var i in debts) {
			if (debts[i] != 0) {
				return true;
			}
		}
		return false;
	}

	function fill_debts() {
		$('#contact_table tbody tr:not(.template)').remove();
		$('#creator_dropdown option').remove();
		var contact_counter = 0;
		for(var i in debts) {
			add_contact_row(i, debts[i], contact_counter);
			++contact_counter;
		}
	}
	
	function parseMoney(str) {
		if (str.length > 0 && str[0] == '$') {
			return parseFloat(str.substring(1));
		}
		return parseFloat(str);
	}
	
	function update_bill(obj) {
		//Make sure all info is there and valid
		if (is_row_valid($(obj).closest('tr'))) {
			update_bill_globals();
			
			var html = '';
			for(var i in debts) {
				html += '<p class="debt-row"><span class="name">' + i + '</span>';
				if (debts[i] == 0) {
					html += ' is even.</p>';
				}
				else {
					html += ' needs to <span class="verb">' + ((debts[i] > 0) ? 'collect' : 'pay') + '</span>';
					html += ' <span class="amount ' + ((debts[i] > 0) ? 'positive' : 'negative') + '">&#36;' + Math.abs(debts[i]).toFixed(2) + '</span></p>';
				}
			}

			$('#bill').html(html);
			$('#total_container').text('$' + bill_total.toFixed(2));
		}
	}

	function is_row_valid(row) {
		return ($(row).find('.expense_text').val() && $(row).find('.payer_name').val() && !isNaN(parseMoney($(row).find('.expense_text').val())));
	}
	
	function update_bill_globals() {
		var payers = {};
		debts = {};
		num_payers = 0;
		bill_total = 0.0;
		bill_rounded = false;
		
		//Iterate through each row
		$('#expense_table tbody tr').each(function() {
			if (is_row_valid(this)) {
				var name_string = $('.payer_name', this).val();
				var payer_names = name_string.split(',');
				
				payer_names = payer_names.slice(0, payer_names.length - 1);	//The last element will always be blank so get rid of it
				var cost = parseMoney($('.expense_text', this).val());
				bill_total += cost;
				var each_paid = cost / payer_names.length;
				
				//Update what everyone paid
				for(var i in payer_names) {
					if (!payers[payer_names[i]]) {
						payers[payer_names[i]] = 0.0;
						++num_payers;
					}
					payers[payer_names[i]] += each_paid;
				}
			}
		});
		update_debts_obj(payers);
	}
	
	function update_debts_obj(payers) {
		var each_owed = bill_total / num_payers;
		var debt_sum = 0;
		
		for(var i in payers) {
			var debt = parseMoney((payers[i] - each_owed).toFixed(2));
			debts[i] = debt;
			debt_sum += debt;
		}
		
		//Make sure sum of credit equal sum of debit since (100/3 * 3 != 100) due to integer rounding
		for(var i in debts) {
			//If not, some lucky participant gets his cut changed by a penny
			if (Math.round(Math.abs(debt_sum) * 100) / 100 != 0.00) {
				var toAdd = (debt_sum > 0) ? -0.01 : 0.01;
				debts[i] += toAdd;
				debt_sum += toAdd;
				bill_rounded = true;
			}
			else {
				break;
			}
		}
	}
	/*** End Expense Calculator ***/
	
	
	
	/*** Settle Dialog ***/
	$('#contact_table .email input[type=text]').live('focus', function() {
		if ($(this).hasClass('default_input')) {
			$(this).val('').removeClass('default_input');
		}
	});
	
    $('#contact_table .email input[type=text]').live('blur', function () {
    	if (!$(this).val() || !$(this).val().toUpperCase().match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/)) {
            $.validationEngine.buildPrompt(this, 'Please enter a valid email', 'error');
        }
        else {
        	$.validationEngine.closePrompt(this);
        }
    });
    
	$('#settle_container .next').click(function() {
        if ($('.formError').size() > 0) {
            return false;
        }
        
        if ($('#contact_table tr:not(.template) .default_input').size() > 0) {
            $.validationEngine.buildPrompt(this, 'Please enter emails for your friends', 'error');
            return false;
        }
        else {
        	$.validationEngine.closePrompt(this);
        }
        
		$('#contact_container').hide();
		$('#response_container').hide();
		fill_confirm_page();
		var group = $('#contact_container input[name=group_name]').val();
		$("#settle_container").dialog( "option", "title", 'A bill will be created for "' + group + '"');
		
		$('#confirm_container').show();
	});
	
	$('#settle_container .back').click(function() {
		$('#confirm_container').hide();
		$('#response_container').hide();
		$('#response_container .results').hide();
		$('#response_container .results div').hide();
		$("#settle_container").dialog( "option", "title", 'Make it easy for you and your friends to pay each other by using WePay');
		$('#contact_container').show();
	});
	
	$('#settle_container .submit').click(function() {    
		$('#confirm_container').hide();
		$('#contact_container').hide();
		$("#settle_container").dialog( "option", "title", 'Creating bills and reimbursements...');
		$('#response_container').show();
		$('#response_container .loading').show();
		
		$.post('post.php', $('#settle_container form').serialize(), function(json) {
			$('#response_container .loading').hide();
			$('#response_container .results div').hide();
			$('#response_container .results').show();

            if (json.error) {
        		$("#settle_container").dialog( "option", "title", 'An error has occurred...');
            	$('#response_container .results .error').show();
                if (json.result) {
                    $('#response_container .results .known_error').text(json.result).show();
                }
                else {
                	$('#response_container .results .unknown_error').show();
                }
            }
            else {
        		$("#settle_container").dialog( "option", "title", 'Success!');
        		$('#response_container .results .success').show();
                if (json.registered) {
                	//Already a WePay user
                	$('#response_container .results .return_user a').attr('href', 'https://www.wepay.com/session/login');
                	$('#response_container .results .return_user').show();
                }
                else {
                	//New WePay user
                	$('#response_container .results .new_user a').attr('href', json.url);
                	$('#response_container .results .new_user').show();
                }
            }
		});
	});
	
	function add_contact_row(name, debt, index) {
		var clone = $('#contact_table .template').clone();
		$('td.name input:first', clone).attr('name', "user[" + index + "][name]");
		$('td.email input:first', clone).attr('name', "user[" + index + "][email]");
		$('td.email input[type=hidden]:first', clone).attr('name', "user[" + index + "][debt]");
		$('td.email input[type=hidden]:first', clone).attr('value', debt);
		$('td.email input[type=text]:first', clone).attr('value', name + '@email.com').addClass('default_input');
		$('td.me input[type=checkbox]:first', clone).val(index).click(function() {
			$('#contact_table td.me input[type=checkbox]').attr('checked', false);
			$(this).attr('checked', true);
		});
		if (index == 0) {
			$('td.me input[type=checkbox]:first', clone).attr('checked', true);
		}
		clone.removeClass('template').appendTo('#contact_table tbody');
		$('td.name input:first', clone).val(name);
	}
	
	function fill_confirm_page() {
		var group_name = 'Splitting the costs of ' + get_items_string(get_items_from_expense_table());
		$('#contact_container input[name=group_name]').val(group_name);
		
		$('#confirm_container > p:not(.template)').remove();
		$('#contact_table tbody tr:not(.template)').each(function() {
			var clone = $('#confirm_container .template').clone();
			$('span.name:first', clone).text($('.name input:first', this).val());
			$('span.email:first', clone).text($('.email input[type=text]:first', this).val());
			var amount = parseFloat($('.email input[type=hidden]:first', this).val());
			if (amount > 0) {
				$('span.amount:first', clone).addClass('positive');
				$('span.verb:first', clone).text('reimbursed');
			}
			else {
				$('span.amount:first', clone).addClass('negative');
				$('span.verb:first', clone).text('billed');
			}
			
			$('span.amount:first', clone).text('$' + Math.abs(amount).toFixed(2));
			clone.removeClass('template');
			$('#confirm_container .button_container').before(clone);
		});
	}
	
	function get_items_from_expense_table() {
		var items = [];
		$('#expense_table .what_cell .textbox').each(function() {
			if ($(this).val()) {
				items.push($.trim($(this).val()));
			}
		});
		
		return items;
	}
	
	function get_items_string(items) {
		if (items.length == 0) {
			return 'everything';
		}
		else if (items.length == 1) {
			return items[0];
		}
		else if (items.length == 2) {
			return items[0] + ' and ' + items[1];
		}
		else if (items.length >= 3) {
			var last_item = items[items.length - 1];
			var sub_items = items.splice(0, items.length - 1);
			return sub_items.join(', ') + ' and ' + last_item;
		}
	}
	/*** End Settle Dialog ***/
});
