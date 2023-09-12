
export class Utils {
    public static getRandomInt(max: number, min: number = 0): number {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min)) + min
    }

    public static formatNumber(num) {
        // cc.log('number=' + number);
        num = '' + num;
        const re = '\\d(?=(\\d{3})+' + ('$') + ')';
        return num.replace(new RegExp(re, 'g'), '$&,');
    }
    
}

