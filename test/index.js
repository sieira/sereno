var should = require('chai').should(),
    MasterKey = require('../model/masterKey');

describe('# Master Key', function() {
  it('generateMasterKey: ', function() {
    masterKey1 = new MasterKey();
    masterKey1.should.not.be.null;
  });

//TODO this test will do the opposite,
//the key shoud not be accessible
  it('getKey: ', function() {
    var generatedKey = masterKey1.getMasterKey();
    generatedKey.should.not.be.null;
  });

  it('getKey has to return same result: ', function() {
    var generatedKey = masterKey1.getMasterKey();
    var generatedKey2 = masterKey1.getMasterKey();
    generatedKey.should.be.equal(generatedKey2);
  });

  it('different crypto gives different result: ', function() {
    var generatedKey = masterKey1.getMasterKey();
    var masterKey2 = new MasterKey(),
        generatedKey2 = masterKey2.getMasterKey();
    generatedKey.should.not.be.equal(generatedKey2);
  });
});

describe('# Encryption', function() {
  it('encrypt: ', function() {
    var masterKey1 = new MasterKey(),
        message = "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero , adarga antigua, rocín flaco y galgo corredor . Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados , lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda . El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino. Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza , que así ensillaba el rocín como tomaba la podadera. Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza. Quieren decir que tenía el sobrenombre de Quijada, o Quesada, que en esto hay alguna diferencia en los autores que deste caso escriben ; aunque, por conjeturas verosímiles, se deja entender que se llamaba Quejana. Pero esto importa poco a nuestro cuento; basta que en la narración dél no se salga un punto de la verdad. ",
        encryptedMessage = masterKey1.encrypt(message);
    var message2 = "It's a dangerous business, Frodo, going out your door. You step onto the road, and if you don't keep your feet, there's no knowing where you might be swept off to. ― J.R.R. Tolkien, The Lord of the Rings  ",
        encryptedMessage2 = masterKey1.encrypt(message);

    encryptedMessage.should.not.be.equal(message);
    encryptedMessage.should.not.be.equal(encryptedMessage2);
  });

  it('decrypt: ', function() {
    var masterKey = new MasterKey(),
        message = "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero , adarga antigua, rocín flaco y galgo corredor . Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados , lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda . El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino. Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza , que así ensillaba el rocín como tomaba la podadera. Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza. Quieren decir que tenía el sobrenombre de Quijada, o Quesada, que en esto hay alguna diferencia en los autores que deste caso escriben ; aunque, por conjeturas verosímiles, se deja entender que se llamaba Quejana. Pero esto importa poco a nuestro cuento; basta que en la narración dél no se salga un punto de la verdad. ",
        encryptedMessage = masterKey.encrypt(message),
        redecriptedMessage = masterKey.decrypt(encryptedMessage);

    encryptedMessage.should.not.be.equal(message);
    redecriptedMessage.should.be.equal(message);
  });
});
