var __ = function(x) { return x; };

console.log(__("just a test"));
console.log(__(/*some notes*/"phrase with comment"));

function x(n) {
    return console.log(__(/*coins amount*/"that's 1 coin", "that's {n # 10 billion} coins", n, {n: n}));
}

console.log(leco.__('marker test'));
