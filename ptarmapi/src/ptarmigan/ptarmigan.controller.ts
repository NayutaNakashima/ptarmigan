import { Controller, Get, Patch, Put, Param, Post, Body, Delete, Logger, Query } from '@nestjs/common';
import { exec, execSync } from 'child_process';
import { PtarmiganService } from './ptarmigan.service';
import { BitcoinService } from '../bitcoin/bitcoin.service';
import { ApiUseTags, ApiModelProperty, ApiImplicitQuery, ApiCreatedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { Validate, Matches } from 'class-validator';
import { FeeDto } from '../model/fee';
import { InvoiceDto } from '../model/invoice';
import { PaymentHashDto } from '../model/payment-hash';
import { Bolt11Dto } from '../model/bolt11';
import { PeerDto } from '../model/peer';
import { PeerNodeDto } from '../model/peer-node';
import { FundDto } from '../model/fund';
import { ListUnspentDto } from '../model/list-unspent';
import { RouteNodeDto } from '../model/route-node';
import { PaymentIdDto } from '../model/payment-id';
import { SendPaymentDto } from '../model/send-payment';

@Controller('/')
export class PtarmiganController {

    constructor(
        private readonly ptarmiganService: PtarmiganService,
        private readonly bitcoinService: BitcoinService,
    ) {
    }

    @ApiUseTags('Node')
    @Post('stop') // stop -> stop
    async executeStop() {
        return await this.ptarmiganService.requestTCP('stop', []);
    }

    @ApiUseTags('Node')
    @Post('getinfo') // getinfo -> getinfo
    async executeGetInfo(): Promise<string> {
        return await this.ptarmiganService.requestTCP('getinfo', []);
    }

    @ApiUseTags('Fee')
    @Post('setfeerate') // setfeerate -> setfeerate
    async executeSetFeerate(@Body() dto: FeeDto) {
        return await this.ptarmiganService.requestTCP('setfeerate', [dto.feeratePerKw]);
    }

    @ApiUseTags('Fee')
    @Post('estimatefundingfee') // estimatefundingfee -> dev-estimatefundingfee
    async executeEstimateFundingFee(@Body() dto: FeeDto) {
        return await this.ptarmiganService.requestTCP('estimatefundingfee', [dto.feeratePerKw]);
    }

    @ApiUseTags('Invoice')
    @Post('createinvoice') // createinvoice -> invoice
    async executeCreateInvoice(@Body() dto: InvoiceDto) {
        return await this.ptarmiganService.requestTCP('invoice', [dto.amountMsat, dto.minFinalCltvExpiry]);
    }

    @ApiUseTags('Invoice')
    @Post('removeinvoice') // eraseinvoice -> removeinvoice
    async executeEraseInvoice(@Body() dto: PaymentHashDto) {
        return await this.ptarmiganService.requestTCP('eraseinvoice', [dto.paymentHash]);
    }

    @ApiUseTags('Invoice')
    @Post('removeallinvoices') // eraseinvoice -> removeallinvoices
    async executeRemoveAllInvoices() {
        return await this.ptarmiganService.requestTCP('eraseinvoice', ['']);
    }

    @ApiUseTags('Invoice')
    @Post('listinvoices') // listinvoice -> listinvoices
    async executeListInvoice() {
        return await this.ptarmiganService.requestTCP('listinvoice', []);
    }

    @ApiUseTags('Invoice')
    @Post('decodeinvoice') // none -> decodeinvoice
    async executeDecodeInvoice(@Body() dto: Bolt11Dto) {
        return await this.ptarmiganService.requestTCP('decodeinvoice', [dto.bolt11]);
    }

    // ------------------------------------------------------------------------------
    // peer
    // ------------------------------------------------------------------------------
    @ApiUseTags('Peer')
    @Post('connect') // connect -> connectpeer
    async executeConnect(@Body() dto: PeerDto) {
        return await this.ptarmiganService.requestTCP('connect', [dto.peerNodeId, dto.peerAddr, dto.peerPort]);
    }

    @ApiUseTags('Peer')
    @Post('disconnect') // disconnect -> disconnectpeer
    async executeDisconnect(@Body() dto: PeerNodeDto) {
        return await this.ptarmiganService.requestTCP('disconnect', [dto.peerNodeId, '0.0.0.0', 0]);
    }

    @ApiUseTags('Peer')
    @Post('getlasterror') // getlasterror -> getlasterror
    async executeGetLastErrort(@Body() dto: PeerNodeDto) {
        return await this.ptarmiganService.requestTCP('getlasterror', [dto.peerNodeId, '0.0.0.0', 0]);
    }

    @ApiUseTags('Peer')
    @Post('dev-disautoconn') // disautoconn -> dev-disableautoconnect
    @ApiImplicitQuery({
        name: 'enable',
        enum: [0, 1],
    })
    async executeDisAutoConn(@Query('enable') enable: number) {
        return await this.ptarmiganService.requestTCP('disautoconn', [enable.toString(10)]);
    }

    @ApiUseTags('Peer')
    @Post('dev-listtransactions') // getcommittx -> dev-listtransactions
    async executeGetCommitTx(@Body() dto: PeerNodeDto) {
        return await this.ptarmiganService.requestTCP('getcommittx', [dto.peerNodeId, '0.0.0.0', 0]);
    }

    // ------------------------------------------------------------------------------
    // channel
    // ------------------------------------------------------------------------------
    @ApiUseTags('Channel')
    @Post('openchannel') // fund -> openchannel
    async executeOpenChannel(@Body() dto: FundDto) {
        return await this.ptarmiganService.commandExecuteOpenChannel(dto.peerNodeId, dto.fundingSat, dto.pushMsat, dto.feeratePerKw);
    }

    @ApiUseTags('Channel')
    @Post('close') // close -> closechannel
    async executeCloseChannel(@Body() dto: PeerNodeDto) {
        return await this.ptarmiganService.requestTCP('close', [dto.peerNodeId, '0.0.0.0', 0]);
    }

    @ApiUseTags('Channel')
    @Post('forceclose') // close -> closechannel
    async executeForceCloseChannel(@Body() dto: PeerNodeDto) {
        return await this.ptarmiganService.requestTCP('close', [dto.peerNodeId, '0.0.0.0', 0, 'force']);
    }

    @ApiUseTags('Channel')
    @Post('dev-removechannel/:channelId') // removechannel -> dev-removechannel
    async executeRemoveChannel(@Param('channelId') channelId: string) {
        return await this.ptarmiganService.requestTCP('removechannel', [channelId]);
    }

    @ApiUseTags('Channel')
    @Post('resetroutestate') // removechannel -> dev-removechannel
    async executeResetRouteState() {
        return await this.ptarmiganService.requestTCP('resetroutestate', []);
    }

    // ------------------------------------------------------------------------------
    // payment
    // ------------------------------------------------------------------------------
    @ApiUseTags('Payment')
    @Post('sendpayment') // routepay -> sendpayment
    async executeSendPayment(@Body() dto: SendPaymentDto) {
        return await this.ptarmiganService.requestTCP('routepay', [dto.bolt11, dto.addAmountMsat]);
    }

    @ApiUseTags('Payment')
    @Post('listpayments') // listpayment -> listpayments
    async executeListPaymentState() {
        return await this.ptarmiganService.requestTCP('listpayment', []);
    }

    @ApiUseTags('Payment')
    @Post('removepayment') // removepayment -> removepayment
    async executeRemovePaymentState(@Body() dto: PaymentIdDto) {
        return await this.ptarmiganService.requestTCP('removepayment', [dto.paymentId]);
    }

    // ------------------------------------------------------------------------------
    // funding
    // ------------------------------------------------------------------------------
    @ApiUseTags('Wallet')
    @Post('getwalletinfo') // getnewaddress
    async executeGetWalletInfo(): Promise<string> {
        return await this.bitcoinService.requestHTTP('getwalletinfo', []);
    }

    @ApiUseTags('Wallet')
    @Post('getnewaddress') // getnewaddress
    async executeGetNewAddress(): Promise<string> {
        return await this.bitcoinService.requestHTTP('getnewaddress', ['', 'p2sh-segwit']);
    }

    @ApiUseTags('Wallet')
    @Post('listunspent') // listunspent
    async executeListUnspent(@Body() dto: ListUnspentDto): Promise<string> {
        return await this.bitcoinService.requestHTTP('listunspent', [dto.minconf, dto.maxconf, dto.addresses]);
    }

    @ApiUseTags('Channel')
    @Post('listchannels')
    async executeListChannels(): Promise<string> {
        try {
            return this.ptarmiganService.commandExecuteShowdbGetChannels().toString();
        } catch (error) {
            return 'error';
        }
    }

    @ApiUseTags('Channel')
    @Post('listnodes')
    async executeListNodes(): Promise<string> {
        try {
            return this.ptarmiganService.commandExecuteShowdbListGossipNode().toString();
        } catch (error) {
            return 'error';
        }
    }

    @ApiUseTags('Channel')
    @Post('getroute')
    async executeGetRoute(@Body() dto: RouteNodeDto): Promise<string> {
        try {
            return this.ptarmiganService.commandExecuteRoutingGetRoute(dto.senderNodeId, dto.receiverNodeId).toString();
        } catch (error) {
            return 'error';
        }
    }
}
