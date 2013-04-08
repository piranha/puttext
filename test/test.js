var __ = function(x) { return x; };

console.log(__("just a test"));

function x(n) {
    return console.log(__("that's 1 coin", "that's {n} coins", n, {n: n}));
}

console.log(leco.__('marker test'));
