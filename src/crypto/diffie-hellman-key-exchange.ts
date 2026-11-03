import crypto from 'crypto';

export class EscrowKeyNegotiator {
  public static generateKeyPair(): { publicKeyHex: string; privateKeyHex: string } {
    const ecdh = crypto.createECDH('prime256v1');
    ecdh.generateKeys();
    return {
      publicKeyHex: ecdh.getPublicKey('hex'),
      privateKeyHex: ecdh.getPrivateKey('hex'),
    };
  }

  public static deriveSharedSecret(privateKeyHex: string, peerPublicKeyHex: string): Buffer {
    const ecdh = crypto.createECDH('prime256v1');
    ecdh.setPrivateKey(Buffer.from(privateKeyHex, 'hex'));
    return ecdh.computeSecret(Buffer.from(peerPublicKeyHex, 'hex'));
  }
}
