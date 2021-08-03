const promise1 = new Promise((resolve, reject) => {
    setTimeout(resolve, 1500, "1500 miliseconds");
});

const promise2 = new Promise((resolve, reject) => {
    setTimeout(resolve, 3000, "three seconds");
});

const promise3 = new Promise((resolve, reject, n) => {
    setTimeout(resolve, 1000 * n, `custom delay where n = ${n}`);
});

promise1();