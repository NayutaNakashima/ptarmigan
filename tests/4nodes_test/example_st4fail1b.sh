#!/bin/sh -ue
#	送金中にノード不在
#	(add_htlc)4444 --> 3333 --> 5555 --> 6666
#	(fulfill )4444 <-- 3333 <-- (x 5555) <-- 6666

echo "--------------------------------------------"
echo "PAY FAIL(3333): 4444 --> 3333 --> 5555 --> 6666"
echo "--------------------------------------------"

ROUTECONF=pay_route.conf
AMOUNT=100000
PAY_BEGIN=4444
PAY_END=6666

PAYER=node_${PAY_BEGIN}
PAYER_PORT=$(( ${PAY_BEGIN} + 1 ))
PAYEE=node_${PAY_END}
PAYEE_PORT=$(( ${PAY_END} + 1 ))

echo "途中のノードがないため、中継ノードで失敗する(fulfill)"


nodeid() {
	cat conf/peer$1.conf | awk '(NR==3) { print $1 }' | cut -d '=' -f2
}

./routing -d $PAYER -s `nodeid $PAY_BEGIN` -r `nodeid $PAY_END` -a $AMOUNT
if [ $? -ne 0 ]; then
	echo no routing
	exit -1
fi

echo -n hash= > $ROUTECONF
echo `./ptarmcli -i $AMOUNT $PAYEE_PORT` | jq -r '.result.hash' >> $ROUTECONF
./routing -d $PAYER -s `nodeid $PAY_BEGIN` -r `nodeid $PAY_END` -a $AMOUNT >> $ROUTECONF

# fulfillを戻すことに失敗する
./ptarmcli --debug 64 5556

# 送金実施
./ptarmcli -p $ROUTECONF $PAYER_PORT

# 戻す
read -p "Hit ENTER Key!" key
./ptarmcli --debug 64 5556
