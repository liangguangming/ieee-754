export class IEEE754 {

    static regexc =/^(\d+)\.(\d+)/;

    public static DecToFloat(num: string) {
        return this.convertIEEE(num);
    }

    private static convertTenToTwo(num: string) {
        let S = '';
        if (num[0] === '-') {
            S = '1';
            num = num.substr(1);
        } else {
            S = '0';
        }
        let match = this.regexc.exec(num);
        if (!match && Number(num)) {
            num = num + '.0';
            match = this.regexc.exec(num);
        }
        let integer = '';
        let Decimal = '';
        if (match) {
            console.log(match[1])
           integer = this.getInteger(match[1]);
           Decimal = this.getDecimal(Number('0.'+match[2]), 23);
        }

        console.log('integer: ', integer);
        console.log('Decimal: ', Decimal);

        return [S,integer, Decimal];
    }

    private static convertIEEE(num: string) {
        let E = '';
        let M = '';
        let S = '';
        let nums = this.convertTenToTwo(num)
        // 判断指数位数
        S = nums[0];
        let e = this.getDigit(nums[1]);
        console.log('e: ', e);
        E = this.convertTenToTwo((Math.pow(2, 8-1) - 1 + e).toString())[1];
        M = (nums[1].substr(1) + nums[2]).substring(0,23);
        let binNum: string = '';
        binNum = S+E+M;
        console.log('E: ', E);
        console.log('M: ', M);

        console.log('binNum: ', binNum)
        if (!this.isAllZero(E) && !this.isAllOne(E)) {
            return parseInt(binNum,2).toString(16);
        }
    }

    private static getDigit(num: string) {
        if (num.length > 0) {
            return num.length - 1;
        }
    }

    private static getIntegerAndDecimal(num: number) {
        let numStr = num.toString();
        let match = this.regexc.exec(numStr);
        if (match) {
            return [Number(match[1]), Number('0.'+match[2])];
        }
        return [num, null];
    }

    private static getInteger(num: string) {
        let startNum = Number(num);
        let saveNum = [];
        let isNotFinish = true;
        while(isNotFinish) {
            if (this.getIntegerAndDecimal(startNum/2)[0] ===0) {
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

    public static test() {
        console.log('125 integer: ', this.getInteger('125'))
        console.log('0.24 float : ', this.getDecimal(0.24, 23))
        console.log('source: ', 125.24, 'finally: ', this.DecToFloat('125.24'));
    }
}

IEEE754.test();