<?php

include 'config.php';

$db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if (mysqli_connect_errno()) {
	printf("Connect failed: %s\n", mysqli_connect_error()); 
    exit;
}

function db_insert_invite($user_id, $group_id, $amount) {
	global $db;
	$stmt = $db->prepare("INSERT INTO invites (user_id, group_id, amount) VALUES (?,?,?)");
	
	$stmt->bind_param('ddd', $user_id, $group_id, $amount);
	$stmt->execute();
	return $stmt->affected_rows;
}

function db_insert_group($id, $name, $debts, $creator) {
	global $db;
	$stmt = $db->prepare("INSERT INTO groups (wepay_id, name, debts, creator) VALUES (?,?,?,?)");
	
	$stmt->bind_param('dsss', $id, $name, $debts, $creator);
	$stmt->execute();
	return $stmt->affected_rows;
}

function db_select_debt_from_group($wepay_id) {
	global $db;
	$stmt = $db->prepare("SELECT debts FROM groups WHERE wepay_id=?");
	$stmt->bind_param('d', $wepay_id);
	
	if ($stmt->execute()) {
		$stmt->bind_result($debts);
		$stmt->fetch();
		return $debts;
	}
	return NULL;
}
