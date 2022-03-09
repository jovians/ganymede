"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randHex = exports.saltedDomainSha512 = exports.saltedSha512 = exports.saltedXorCrypt = exports.SecureChannel = exports.SecureChannelTypes = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var fourq_1 = require("@jovian/fourq");
var common_1 = require("../../shared/common");
var crypto = common_1.isNodeJs ? require('crypto') : window.crypto.subtle;
var verticalBarBuffer = Buffer.from('|', 'ascii');
var SecureChannelTypes;
(function (SecureChannelTypes) {
    SecureChannelTypes["NONE"] = "NONE";
    SecureChannelTypes["DEFAULT"] = "ECC_4Q";
    SecureChannelTypes["ECC_4Q"] = "ECC_4Q";
})(SecureChannelTypes = exports.SecureChannelTypes || (exports.SecureChannelTypes = {}));
var SecureChannel = /** @class */ (function () {
    function SecureChannel(type, channelId, peerInfo, localKeypair) {
        this.peerInfo = { ecdhPublicKey: null };
        this.sharedSecret = null;
        this.expires = 0;
        this.type = type ? type : SecureChannelTypes.DEFAULT;
        this.channelId = !channelId || channelId === 'generate' ? fourq_1.FourQ.randomBytes(16).toString('base64') : channelId;
        this.pregeneratedNonce = fourq_1.FourQ.randomBytes(32);
        if (peerInfo) {
            this.fromPeerPublicKey(peerInfo, localKeypair);
        }
        this.refreshNonce();
    }
    SecureChannel.getIdentityFrom = function (privateKey) {
        return fourq_1.FourQ.generateIdentity(Buffer.from(privateKey, 'base64'));
    };
    SecureChannel.getPublicKeyFrom = function (privateKey) {
        return fourq_1.FourQ.generateIdentity(Buffer.from(privateKey, 'base64')).publicKeySchnorr.toString('base64');
    };
    SecureChannel.fromJSON = function (json) {
        var a = new SecureChannel();
        return a.fromJSONObject(JSON.parse(json));
    };
    SecureChannel.getAccessor = function (user, baseToken, nonceHex) {
        var timeHex = Date.now().toString(16);
        if (timeHex.length % 2 === 1) {
            timeHex = '0' + timeHex;
        }
        if (!nonceHex) {
            nonceHex = randHex(16);
        }
        var accessorParts = [user, timeHex, nonceHex];
        var accessorBuffer = Buffer.from(user, 'ascii');
        var nonceBuffer = Buffer.from(nonceHex, 'hex');
        var timeBuffer = Buffer.from(timeHex, 'hex');
        var baseTokenBuffer = typeof baseToken === 'string' ? Buffer.from(baseToken, 'base64') : baseToken;
        var accessorSecret = saltedSha512(baseTokenBuffer, accessorBuffer);
        var oneTimeHash = saltedSha512(accessorSecret, timeBuffer, nonceBuffer).toString('base64');
        accessorParts.push(oneTimeHash);
        return accessorParts.join('.');
    };
    SecureChannel.getAccessorHeader = function (user, baseToken, nonceHex) {
        return "Accessor ".concat(SecureChannel.getAccessor(user, baseToken, nonceHex));
    };
    SecureChannel.verifyAccessor = function (accessorExpression, baseToken, timeWindow) {
        if (timeWindow === void 0) { timeWindow = 5000; }
        var accessorData = accessorExpression.split('.');
        var accessor = accessorData[0];
        var accessorBuffer = Buffer.from(accessor, 'ascii');
        var timeHex = accessorData[1];
        var nonceHex = accessorData[2];
        var nonceBuffer = Buffer.from(nonceHex, 'hex');
        var timeBuffer = Buffer.from(timeHex, 'hex');
        var oneTimeHash = accessorData[3];
        var baseTokenBuffer = typeof baseToken === 'string' ? Buffer.from(baseToken, 'base64') : baseToken;
        var accessorSecret = saltedSha512(baseTokenBuffer, accessorBuffer);
        var expectedHash = saltedSha512(accessorSecret, timeBuffer, nonceBuffer).toString('base64');
        if (oneTimeHash !== expectedHash) {
            return null;
        }
        var t = parseInt(timeHex, 16);
        if (Math.abs(Date.now() - t) > timeWindow) {
            return null;
        }
        return { accessor: accessor, t: t };
    };
    SecureChannel.verifyStamp = function (sigData, publicKey) {
        if (!publicKey || !sigData || !sigData.sig || !sigData.payload) {
            return null;
        }
        var payloadBuffer = Buffer.from(sigData.payload, 'ascii');
        var publicKeyBuffer = typeof publicKey === 'string' ? Buffer.from(publicKey, 'base64') : publicKey;
        var valid = fourq_1.FourQ.verify(Buffer.from(sigData.sig, 'base64'), payloadBuffer, publicKeyBuffer);
        if (!valid) {
            return null;
        }
        return sigData;
    };
    SecureChannel.prototype.fromPeerPublicKey = function (peerInfo, localKeypair) {
        this.peerInfo = peerInfo; // Buffer.from(peerPubKeyB64, 'base64');
        this.localKeyPair = localKeypair ? localKeypair : fourq_1.FourQ.ecdhGenerateKeyPair();
        if (this.peerInfo.ecdhPublicKey.length === 32) {
            this.sharedSecret = fourq_1.FourQ.getSharedSecret(this.localKeyPair.secretKey, this.peerInfo.ecdhPublicKey);
        }
        return this;
    };
    SecureChannel.prototype.refreshNonce = function () {
        this.pregeneratedNonce = fourq_1.FourQ.randomBytes(32);
    };
    SecureChannel.prototype.fromJSONObject = function (src) {
        this.type = src.type;
        this.channelId = src.channelId;
        this.peerInfo = {
            ecdhPublicKey: src.peerPublicKeyB64 ? Buffer.from(src.peerPublicKeyB64, 'base64') : null,
            signaturePublicKey: src.peerSignaturePublicKeyB64 ? Buffer.from(src.peerSignaturePublicKeyB64, 'base64') : null,
            iden: src.peerIden,
            data: src.peerData,
        };
        this.localKeyPair = {
            isDH: true,
            type: fourq_1.CryptoScheme.FourQ,
            publicKey: src.localKeyPairPublicKeyB64 ? Buffer.from(src.localKeyPairPublicKeyB64, 'base64') : null,
            secretKey: src.localKeyPairPublicKeyB64 ? Buffer.from(src.localKeyPairSecretKeyB64, 'base64') : null,
        };
        if (src.sharedSecretB64) {
            this.sharedSecret = Buffer.from(src.sharedSecretB64, 'base64');
        }
        else {
            this.fromPeerPublicKey(this.peerInfo, this.localKeyPair.publicKey ? this.localKeyPair : null);
        }
        this.expires = src.expires;
        return this;
    };
    SecureChannel.prototype.toJSON = function () {
        return JSON.stringify({
            type: this.type,
            channelId: this.channelId,
            peerIden: this.peerInfo.iden,
            peerData: this.peerInfo.data,
            peerPublicKeyB64: this.peerInfo.ecdhPublicKey ? this.peerInfo.ecdhPublicKey.toString('base64') : null,
            peerSignaturePublicKeyB64: this.peerInfo.signaturePublicKey ? this.peerInfo.signaturePublicKey.toString('base64') : null,
            localKeyPairPublicKeyB64: this.localKeyPair ? this.localKeyPair.publicKey.toString('base64') : null,
            localKeyPairSecretKeyB64: this.localKeyPair ? this.localKeyPair.secretKey.toString('base64') : null,
            sharedSecretB64: this.sharedSecret ? this.sharedSecret.toString('base64') : null,
            expires: this.expires,
        });
    };
    SecureChannel.prototype.createWrappedPayloadFromBuffer = function (payload) {
        var sharedKey64Bytes = Buffer.concat([this.pregeneratedNonce, this.sharedSecret]);
        var keyHash = crypto.createHash('sha512').update(sharedKey64Bytes).digest();
        var wrapped = {
            __scp: true,
            c: this.channelId,
            n: this.pregeneratedNonce.toString('base64'),
            p: fourq_1.FourQ.xorCryptSHA512(keyHash, payload).toString('base64'),
        };
        this.refreshNonce();
        return wrapped;
    };
    SecureChannel.prototype.createWrappedPayload = function (payload) {
        if (typeof payload === 'string') {
            return this.createWrappedPayloadFromBuffer(Buffer.from(payload, 'utf8'));
        }
        else {
            return this.createWrappedPayloadFromBuffer(payload);
        }
    };
    SecureChannel.prototype.createWrappedPayloadObject = function (obj) {
        return this.createWrappedPayloadFromBuffer(Buffer.from(JSON.stringify(obj), 'utf8'));
    };
    SecureChannel.prototype.createWrappedPayloadString = function (obj) {
        return JSON.stringify(this.createWrappedPayloadObject(obj));
    };
    SecureChannel.prototype.createWrappedPayloadBase64 = function (obj) {
        return Buffer.from(this.createWrappedPayloadString(obj), 'utf8').toString('base64');
    };
    SecureChannel.prototype.decryptSecureChannelPayloadObject = function (wrapped, outputEncoding) {
        if (outputEncoding === void 0) { outputEncoding = 'utf8'; }
        var nonce = Buffer.from(wrapped.n, 'base64');
        var sharedKey64Bytes = Buffer.concat([nonce, this.sharedSecret]);
        var keyHash = crypto.createHash('sha512').update(sharedKey64Bytes).digest();
        var payloadEnc = Buffer.from(wrapped.p, 'base64');
        switch (outputEncoding) {
            case 'utf8': {
                return fourq_1.FourQ.xorCryptSHA512(keyHash, payloadEnc).toString('utf8');
            }
            default: {
                return fourq_1.FourQ.xorCryptSHA512(keyHash, payloadEnc);
            }
        }
    };
    SecureChannel.prototype.decryptSecureChannelPayload = function (wrapped) {
        return this.decryptSecureChannelPayloadObject(wrapped);
    };
    SecureChannel.prototype.decryptSecureChannelPayloadIntoString = function (wrapped) {
        return this.decryptSecureChannelPayloadObject(wrapped, 'utf8');
    };
    SecureChannel.prototype.decryptPayloadBase64 = function (payloadStrB64) {
        var payload = this.parseWrappedPayloadString(Buffer.from(payloadStrB64, 'base64').toString('utf8'));
        return this.parseSecureChannelPayloadIntoObject(payload);
    };
    SecureChannel.prototype.parseSecureChannelPayloadIntoObject = function (wrapped) {
        return JSON.parse(this.decryptSecureChannelPayloadIntoString(wrapped));
    };
    SecureChannel.prototype.parseWrappedPayloadString = function (payloadStr) {
        return JSON.parse(payloadStr);
    };
    SecureChannel.prototype.parseWrappedPayloadBase64 = function (payloadStrB64) {
        return this.parseWrappedPayloadString(Buffer.from(payloadStrB64, 'base64').toString('utf8'));
    };
    SecureChannel.API_PATH_PUBLIC_INFO = '/public-info';
    SecureChannel.API_PATH_NEW_CHANNEL = '/secure-channel';
    SecureChannel.API_PATH_SECURE_API = '/secure-api';
    return SecureChannel;
}());
exports.SecureChannel = SecureChannel;
function saltedXorCrypt(payload, secret) {
    var salts = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        salts[_i - 2] = arguments[_i];
    }
    return fourq_1.FourQ.xorCryptSHA512(saltedSha512.apply(void 0, __spreadArray([secret], salts, false)), payload);
}
exports.saltedXorCrypt = saltedXorCrypt;
function saltedSha512(message) {
    var salts = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        salts[_i - 1] = arguments[_i];
    }
    var sharedKey64Bytes = Buffer.concat(__spreadArray(__spreadArray([], salts, true), [message], false));
    return crypto.createHash('sha512').update(sharedKey64Bytes).digest();
}
exports.saltedSha512 = saltedSha512;
function saltedDomainSha512(message, domain) {
    var salts = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        salts[_i - 2] = arguments[_i];
    }
    var sharedKey64Bytes = Buffer.concat(__spreadArray(__spreadArray([domain, verticalBarBuffer], salts, true), [verticalBarBuffer, message], false));
    return crypto.createHash('sha512').update(sharedKey64Bytes).digest();
}
exports.saltedDomainSha512 = saltedDomainSha512;
function randHex(length) {
    var characters = '0123456789abcdef';
    var str = [];
    for (var i = 0; i < length; ++i) {
        str.push(characters[Math.floor(Math.random() * 16)]);
    }
    return str.join('');
}
exports.randHex = randHex;
