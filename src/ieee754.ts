export interface IFloatConfig {
    readonly sBit: number;     // 符号位
    readonly eBit: number;     // 指数位
    readonly mBit: number;     // 尾数位
}

export class SingleFloatConfig implements IFloatConfig {
    sBit = 1;
    eBit = 8;
    mBit = 23;
}

export class DoubleFloatConfig implements IFloatConfig {
    sBit = 1;
    eBit = 11;
    mBit = 52;
}

export class IEEE754 {

    static regexc =/^(\d+)\.(\d+)/;

    public static singleFloatToHex(num: number) {
        return this.convertIEEE(String(num), new SingleFloatConfig());
    }

    public static doubleFloatToHex(num: number) {
        return this.convertIEEE(String(num), new DoubleFloatConfig());
    }

    public static hexToSingleFloat(num: string) {
        return this.fromHextoIEEEFloat(num, new SingleFloatConfig());
    }

    public static hexToDoubleFloat(num: string) {
        return this.fromHextoIEEEFloat(num, new DoubleFloatConfig());
    }

    private static fromHextoIEEEFloat(num: string, floatConfig: IFloatConfig) {
        let binNum = this.hexToBin(num);
        let binLen = binNum.length;
        let allBits = floatConfig.sBit + floatConfig.eBit + floatConfig.mBit;
        for (let i = 0;i < allBits - binLen;i++) {
            binNum = '0' + binNum;
        }

        let S,E,M;
        S = binNum.substr(0,floatConfig.sBit);
        E = binNum.substr(floatConfig.sBit,floatConfig.eBit);
        M = binNum.substr(floatConfig.sBit + floatConfig.eBit,floatConfig.mBit);
        let e,s,m;
        s = Number(S);
        let result;
        if (!this.isAllZero(E) && !this.isAllOne(E)) {                     // 规约
            e = this.binToTen(E) - (Math.pow(2,floatConfig.eBit - 1) - 1);
            m = this.binToTen('1.'+M);
            result = Math.pow(-1,s)*m*Math.pow(2,e);
        } else if (this.isAllZero(E)) {                                   // 非规约
            e = 1 - (Math.pow(2,floatConfig.eBit - 1) - 1);
            m = this.binToTen('0.'+M);
            result = Math.pow(-1,s)*m*Math.pow(2,e);
        } else if (this.isAllOne(E)) {                                    // 特殊值
            if (this.isAllZero(M) && S === '0') {
                result = Number.POSITIVE_INFINITY;
            } else if (this.isAllZero(M) && S === '1') {
                result = Number.NEGATIVE_INFINITY;
            } else if (!this.isAllZero(M)) {
                result = Number.NaN;
            }
        } else {
            throw 'convert float fail';
        }
         
        return result;
    }

    // 16 进制转 2 进制
    public static hexToBin(num: string) {
        if (num.indexOf('0x') === 0 || num.indexOf('0X') === 0) {
            num = num.substr(2);
        }
        let binResult = '';
        for (let i = 0;i < num.length;i++) {
            binResult += this.oneHexCharToBin(num[i]);
        }

        return binResult;
    }

    private static oneHexCharToBin(num: string) {
        let result = '';
        num = num.toLowerCase();
        switch(num) {
            case '0':
                result = '0000';
                break; 
            case '1':
                result = '0001';
                break; 
            case '2':
                result = '0010';
                break; 
            case '3':
                result = '0011';
                break; 
            case '4':
                result = '0100';
                break; 
            case '5':
                result = '0101';
                break; 
            case '6':
                result = '0110';
                break; 
            case '7':
                result = '0111';
                break; 
            case '8':
                result = '1000';
                break; 
            case '9':
                result = '1001';
                break; 
            case 'a':
                result = '1010';
                break; 
            case 'b':
                result = '1011';
                break; 
            case 'c':
                result = '1100';
                break; 
            case 'd':
                result = '1101';
                break; 
            case 'e':
                result = '1110';
                break; 
            case 'f': 
                result = '1111';
                break;
            default:
                throw 'fail to convert hex';
        }

        return result;
    }

    // 二进制转10进制,注意：分符号
    /**
     * eg: -1.1  ==> -1.5;
     *      1.1  ==>  1.5; 
     * @param num 
     */
    public static binToTen(num: string) {
        let isPositiveNum = true;
        if (num[0] === '-') {
            isPositiveNum = false;
            num = num.substr(1);
        }
        let result = 0;
        let binToTenRegExp = /([01]+)(\.([01]+))?/;
        let match = binToTenRegExp.exec(num);
        if (!match) {
            throw '传入的二进制参数不正确';
        }
        
        let integer = match[1];
        let decimal = '0';
        if (match[2]) {
            decimal = match[3];
        }
        for (let i = integer.length - 1, e = 0;i >= 0;i--,e++) {
            result += Number(integer[i]) * Math.pow(2,e);
        }
        for (let j = 0, e = -1;j < decimal.length;j++,e--) {
            result += Number(decimal[j]) * Math.pow(2,e);
        }

        return isPositiveNum? result: (0-result);
    }

    // 不能传递一个科学计数的形式数
    private static convertTenToTwo(num: string, floatConfig: IFloatConfig) {
        let S = '';
        if (num[0] === '-') {
            S = '1';
            num = num.substr(1);
        } else {
            S = '0';
        }
        let match = this.regexc.exec(num);
        if (!match && !Number.isNaN(Number(num))) {
            num = num + '.0';
            match = this.regexc.exec(num);
        }
        let integer = '';
        let Decimal = '';
        integer = this.getInteger(match[1]);
        let validDecimalBit =  Math.pow(2, floatConfig.eBit - 1) - 1 + floatConfig.mBit;
        Decimal = this.getDecimal(Number('0.'+match[2]), validDecimalBit);

        return [S,integer, Decimal];
    }

    private static convertIEEE(num: string, floatConfig: IFloatConfig) {
        let E = '';
        let M = '';
        let S = '';
        let nums = this.convertTenToTwo(num,floatConfig)
        // 判断指数位数
        S = nums[0];
        let e = this.getDigit(nums[1]);
        if (e === 0 && Number(nums[1]) === 0) {
            let dec = nums[2];
            e = 0-(dec.indexOf('1')+1);
            E = this.convertTenToTwo((Math.pow(2, floatConfig.eBit-1) - 1 + e).toString(),floatConfig)[1];
            M = dec.substr(dec.indexOf('1')+1, floatConfig.mBit)
        } else {
            E = this.convertTenToTwo((Math.pow(2, floatConfig.eBit-1) - 1 + e).toString(),floatConfig)[1];
            M = (nums[1].substr(1) + nums[2]).substring(0,floatConfig.mBit);
        }
        let eLen = E.length;
        for (let i = 0;i<floatConfig.eBit - eLen;i++) {
            E = '0' + E;
        }
        let binNum: string = '';
        binNum = S+E+M;
        let hex = this.binToHex(binNum);
        let allBits = floatConfig.sBit + floatConfig.eBit + floatConfig.mBit;
        for (let k = 0;k<allBits/4 - hex.length;k++) {
            hex = '0' + hex;
        }
        return '0x' + hex;

    }

    // 二进制转16进制
    private static binToHex(num: string) {
        let len = num.length;
        if (len%4 !== 0) {
            for(let i = 0;i<len%4;i++) {
                num = '0' + num;
            }
        }
        let result = '';
        for (let j=0;j<num.length;j+=4 ) {
            let numStr = num.substr(j,4);
            result += this.fourBitBinToHexChar(numStr);
        }
        return result;
    }

    private static fourBitBinToHexChar (numstr: string) {
        let bitRegExp = /^([01])([01])([01])([01])$/
        let match = bitRegExp.exec(numstr);
        if (!match) {
            throw '传入的二进制数值不正确';
        }
        let four = Number(match[1]);
        let three = Number(match[2]);
        let two = Number(match[3]);
        let one = Number(match[4]);

        let num = four*Math.pow(2,3) + three*Math.pow(2,2) + two*Math.pow(2,1) + one * Math.pow(2,0);
        if(num<10) {
            return num.toString();
        }
        if (num === 10) {
            return 'a';
        } else if (num === 11) {
            return 'b';
        } else if (num === 12) {
            return 'c';
        } else if (num === 13) {
            return 'd';
        } else if (num === 14) {
            return 'e';
        } else if (num === 15) {
            return 'f';
        }
    }

    private static getDigit(num: string) {
        if (num.length > 0) {
            return num.length - 1;
        }

        return 0;
    }

    private static getIntegerAndDecimal(num: number) {
        let numStr = this.scienceToNum(num.toString());

        let match = this.regexc.exec(numStr);
        if (match) {
            return [Number(match[1]), Number('0.'+match[2])];
        }
        return [num, null];
    }

    public static scienceToNum(scienceNum: string) {
       
        if ( Number.isNaN(Number(scienceNum))) {
            throw 'enter input is invalid number';
        }
        const scienceRegExp = /(\d|\d\.\d+)e(\-?\d+)/;
        let match = scienceRegExp.exec(scienceNum);
        if (match) {
            let num = match[1].replace('.','');
            let e = Number(match[2]);
            let result = '';
            if (Number(e)<0) {
                result = '0.';
                for (let i = 0;i<Math.abs(e) - 1; i++) {
                    num = '0' + num;
                }
            } else if(Number(e)>0 && e<num.length - 1) {
                num = num.substring(0,e+1) + '.' + num.substring(e+1);
            } else {
                let len = num.length;
                for (let i = 0;i<Math.abs(e) - len + 1; i++) {
                    num = num + '0';
                }
            }
            result += num;

            return result;
        }

        return scienceNum;
    }

    private static getInteger(num: string) {
        let startNum = Number(num);
        let saveNum = [];
        let isNotFinish = true;
        while(isNotFinish) {
            if (this.getIntegerAndDecimal(startNum/2)[0] === 0) {
                isNotFinish = false;
            }
            saveNum.push(startNum%2);

            startNum = this.getIntegerAndDecimal(startNum/2)[0];
        }
        let returnNum = '';
        saveNum.reverse().forEach(value => {
            returnNum += value;
        })

        return returnNum;
    }

    private static getDecimal(num: number, dec: number) {
        let saveNum = [];
        while(saveNum.length<dec) {
            let nums = this.getIntegerAndDecimal(num*2);
            saveNum.push(nums[0]);
            num = nums[1];
        }

        let returnNum = '';
        saveNum.forEach(value => {
            returnNum += value;
        })

        return returnNum;
    }

    private static isAllZero(num: string) {
        if (num.includes('1')) {
            return false;
        }
        return true;
    }

    private static isAllOne(num: string) {
        if (num.includes('0')) {
            return false;
        }
        return true;
    }
}

export class IEEE754_NEW {
    public static singleFloatToHex(num: number): string {
        return this.floatToHex(num, Float32Array);
    }

    public static doubleFloatToHex(num: number) {
        return this.floatToHex(num, Float64Array);
    }

    public static hexToSingleFloat(hex: string) {
        return this.hexToFloat(hex, Float32Array);
    }

    public static hexToDoubleFloat(hex: string) {
        return this.hexToFloat(hex, Float64Array);
    }

    private static checkoutHex(hex: string) {
        if (hex.indexOf('0x') === 0 || hex.indexOf('0X') === 0) {
            return hex.substring(2);
        }

        throw new Error("hex 必须是 0x 或 0X 开头");
    }

    private static hexToFloat(hex: string, Type: Float32ArrayConstructor | Float64ArrayConstructor) {
        hex = this.checkoutHex(hex);
        const numberArray = [];
        const length = Type.name === "Float32Array" ? 32 / 8 : 64 / 8;
        for (let i = length - 1; i > -1; i--) {
            let unit = hex.substring(i * 2, i * 2 + 2);
            numberArray.push(Number(`0x${unit}`));
        }
        const uint8Array = new Uint8Array(numberArray);
        const floatArray = new Type(uint8Array.buffer);

        return floatArray[0];
    }

    private static floatToHex(num: number, Type: Float32ArrayConstructor | Float64ArrayConstructor) {
        let result = "0x";
        const floatArray = new Type([num]);
        const uint8Array = new Uint8Array(floatArray.buffer);
        const length = floatArray instanceof Float32Array ? 32 / 8 : 64 / 8;
        for (let i = length - 1; i > -1; i--) {
            const byte = uint8Array[i];
            const first = byte >> 4;
            const second = byte - first * 16;
            result += first.toString(16);
            result += second.toString(16);
        }

        return result;
    }
}

console.log(IEEE754.doubleFloatToHex(15.32));
console.log(IEEE754.hexToDoubleFloat("0x402ea3d70a3d70a4"));
console.log(IEEE754_NEW.doubleFloatToHex(15.32));
console.log(IEEE754_NEW.hexToDoubleFloat("0x402ea3d70a3d70a4"));
