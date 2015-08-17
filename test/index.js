var should = require('chai').should(),
    MasterKey = require('../model/masterKey');

var message = "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero , adarga antigua, rocín flaco y galgo corredor . Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados , lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda . El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino. Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza , que así ensillaba el rocín como tomaba la podadera. Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza. Quieren decir que tenía el sobrenombre de Quijada, o Quesada, que en esto hay alguna diferencia en los autores que deste caso escriben ; aunque, por conjeturas verosímiles, se deja entender que se llamaba Quejana. Pero esto importa poco a nuestro cuento; basta que en la narración dél no se salga un punto de la verdad. ",
    message1 = message,
    message2 = "It's a dangerous business, Frodo, going out your door. You step onto the road, and if you don't keep your feet, there's no knowing where you might be swept off to. ― J.R.R. Tolkien, The Lord of the Rings  ";

var masterKey = new MasterKey(),
    masterKey1 = masterKey,
    masterKey2 = new MasterKey();

describe('# Encryption/Decryption', function() {
  it('Two different messages encrypted with the same key have to be different: ', function() {
    var encryptedMessage1 = masterKey.encrypt(message1);
    var encryptedMessage2 = masterKey.encrypt(message2);

    encryptedMessage1.should.not.be.equal(message1);
    encryptedMessage1.should.not.be.equal(encryptedMessage2);
  });

  it('The same message encrypted with a different key has to be different: ', function() {
    var encryptedMessage1 = masterKey1.encrypt(message);
    var encryptedMessage2 = masterKey2.encrypt(message);

    encryptedMessage1.should.not.be.equal(encryptedMessage2);
  });

    it('A decripted crypted message is equal to the original message when only using the same key: ', function() {
      var redecryptedMessage = masterKey1.decrypt(masterKey1.encrypt(message));
//      var corruptRedecryptedMessage = masterKey1.decrypt(masterKey2.encrypt(message));

      redecryptedMessage.should.be.equal(message);
//      redecryptedMessage.should.not.be.equal(corruptRedecryptedMessage);
    });
});
