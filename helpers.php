<?php

require_once 'config.php';


function create_group($name, $description, $owner) {
	//WePay API does not allow groups to have the name wepay
	$name = str_ireplace('wepay', 'WP', $name);
	$params = array('name' => $name,
					'description' => $description);
	$response = send_api_request('group/create', $params, $owner);
	return (!empty($response->result) ? $response->result : false);
}

function get_or_create_user($email, $name = NULL) {
	$params = array('email' => $email, 
					'name' => $name);
	$response = send_api_request('user/register', $params);
	if (empty($response->result)) {
		return false;
	}
	
	return $response->result;
}

function invite_user($group, $user_id, $proxy_id) {
	$result = send_api_request('/group/invite/' . $group->id, array('user_id' => $user_id), $proxy_id);
	return isset($result->result) ? $result->result: false;
}

function accept_invite($invite_id, $proxy_id) {
	$result = send_api_request('/user/invite_accept/' . $invite_id, array(), $proxy_id);
	return isset($result->result) ? $result->result: false;
}

function request_money($group_id, $recipient, $amount, $reason) {
	$params = array('amount' => $amount,
					'reason' => $reason);
	$response = send_api_request('group/request_money/' . $group_id, $params, $recipient);
	return (!empty($response->result) ? $response->result : false);
}

function send_bill($group_id, $recipient, $amount, $reason, $due) {
	$params = array('amount' => $amount,
					'to' => $recipient,
					'due' => $due,
					'reason' => $reason,
					'fee_type' => 'convenience');
	$response = send_api_request('group/send_bill/' . $group_id, $params);
	return (!empty($response->result) ? $response->result : false);
}

function send_api_request($request, $params, $proxy = NULL) {
	try {
		if ($proxy) {
			$params['proxy_user_id'] = $proxy;
		}
		$oauth = new OAuth(WEPAY_KEY, WEPAY_SECRET, OAUTH_SIG_METHOD_HMACSHA1, OAUTH_AUTH_TYPE_URI);		   
		$oauth->enableDebug();
		$oauth->setToken(WEPAY_OAUTH_TOKEN, WEPAY_OAUTH_SECRET);
		$oauth->fetch(WEPAY_API_URL . $request, $params, OAUTH_HTTP_METHOD_POST);
		$json = $oauth->getLastResponse();
		return json_decode($json);
	}
	catch (OAuthException $E) {
		error_log($E->getMessage());
		return false;
	}
}
