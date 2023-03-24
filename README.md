# ieee-754
样例：
// 第一种实现方式，完全按照 IEEE 754 规范而写
  <br>十进制单精度浮点数（32bit）转16进制：IEEE754.singleFloatToHex(10.125);
  <br>十进制双精度浮点数（62bit）转16进制：IEEE754.doubleFloatToHex(10.125);
  <br>16进制转十进制单精度浮点数（32bit）：IEEE754.hexToSingleFloat('0x0000ffef');
  <br>16进制转十进制双精度浮点数（62bit）：IEEE754.doubleFloatToHex('0x000000000000ffef');

// 第二种实现方式，利用 TypeArray 能力
  <br>十进制单精度浮点数（32bit）转16进制：IEEE754_NEW.singleFloatToHex(10.125);
  <br>十进制双精度浮点数（62bit）转16进制：IEEE754_NEW.doubleFloatToHex(10.125);
  <br>16进制转十进制单精度浮点数（32bit）：IEEE754_NEW.hexToSingleFloat('0x0000ffef');
  <br>16进制转十进制双精度浮点数（62bit）：IEEE754_NEW.doubleFloatToHex('0x000000000000ffef');
