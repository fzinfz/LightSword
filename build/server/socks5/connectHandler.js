//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }
        function onfulfill(value) { try { step("next", value); } catch (e) { reject(e); } }
        function onreject(value) { try { step("throw", value); } catch (e) { reject(e); } }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
var net = require('net');
var crypto = require('crypto');
var cryptoEx = require('../../lib/cipher');
function connect(client, rawData, dst, options) {
    let proxySocket = net.createConnection(dst.port, dst.addr, () => __awaiter(this, void 0, Promise, function* () {
        console.log(`connecting: ${dst.addr}:${dst.port}`);
        let reply = rawData.slice(0, rawData.length);
        reply[0] = 0x05;
        reply[1] = 0x00;
        let encryptor = cryptoEx.createCipher(options.cipherAlgorithm, options.password);
        let cipher = encryptor.cipher;
        let iv = encryptor.iv;
        let pl = Number((Math.random() * 0xff).toFixed());
        let el = new Buffer([pl]);
        let pd = crypto.randomBytes(pl);
        let er = cipher.update(Buffer.concat([el, pd, reply]));
        yield client.writeAsync(Buffer.concat([iv, er]));
        client.pipe(options.decipher).pipe(proxySocket);
        proxySocket.pipe(cipher).pipe(client);
    }));
    function dispose(err) {
        if (err)
            console.info(err.message);
        client.dispose();
        proxySocket.dispose();
    }
    proxySocket.on('error', dispose);
    proxySocket.on('end', dispose);
    client.on('error', dispose);
    client.on('end', dispose);
    proxySocket.setTimeout(options.timeout * 1000);
    client.setTimeout(options.timeout * 1000);
}
exports.connect = connect;
