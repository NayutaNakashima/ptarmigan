#!/bin/sh
#	method: forward
#	$1: short_channel_id
#	$2: amt_to_forward
#	$3: outgoing_cltv_value
#	$4: payment_hash
#	$5: node_id
echo $(date +%c) $(date +%N)
echo { \"method\": \"forward\", \"short_channel_id\": \"$1\", \"amt_to_forward\": $2, \"outgoing_cltv_value\": $3, \"payment_hash\": \"$4\", \"node_id\": \"$5\" } | jq .