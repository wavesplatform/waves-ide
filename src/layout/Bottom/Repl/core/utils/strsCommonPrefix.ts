function strsCommonPrefix(strs: string[]) {
    if (strs.length < 1){
        return '';
    };

    var p = 0, i = 0, c = strs[0][0];

    while (p < strs[i].length && strs[i][p] === c) {
        i++;

        if (i === strs.length) {
            i = 0;
            p++;
            c = strs[0][p];
        };
    };

    return strs[0].substr(0, p);
};

export default strsCommonPrefix;
