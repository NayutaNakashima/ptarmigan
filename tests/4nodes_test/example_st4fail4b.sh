#!/bin/sh -ue
#	途中でfulfillしない(6666)
#	4444 --> 3333 --> 5555 --> 6666

echo "--------------------------------------------"
echo "NO_FULFILL(6666): 4444 --> 3333 --> 5555 --> 6666"
echo "--------------------------------------------"

ROUTECONF=pay_route.conf
AMOUNT=15000000
PAY_BEGIN=4444
PAY_END=6666
ACCIDENT=6666

PAYER=node_${PAY_BEGIN}
PAYER_PORT=$(( ${PAY_BEGIN} + 1 ))
PAYEE=node_${PAY_END}
PAYEE_PORT=$(( ${PAY_END} + 1 ))
ACCIDENT_PORT=$(( ${ACCIDENT} + 1 ))

nodeid() {
	cat conf/peer$1.conf | awk '(NR==3) { print $1 }' | cut -d '=' -f2
}

./routing -d $PAYER -s `nodeid $PAY_BEGIN` -r `nodeid $PAY_END` -a $AMOUNT
if [ $? -ne 0 ]; then
	echo no routing
	exit -1
fi

INVOICE=`./ptarmcli -i $AMOUNT $PAYEE_PORT`
if [ $? -ne 0 ]; then
	echo fail get invoice
	exit -1
fi
HASH=`echo $INVOICE | jq -r '.result.hash'`

./routing -d $PAYER -s `nodeid $PAY_BEGIN` -r `nodeid $PAY_END` -a $AMOUNT > $ROUTECONF

# fulfillしない
./ptarmcli --debug 1 $ACCIDENT_PORT

# 送金実施
./ptarmcli -p $ROUTECONF,$HASH $PAYER_PORT

read -p "Hit ENTER Key!" key

# 戻す
./ptarmcli --debug 1 $ACCIDENT_PORT
