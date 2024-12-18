// Infinite loop to print milliseconds
setInterval(() => {
    const milliseconds = Date.now();
    console.log(milliseconds);
}, 1); // Adjust the interval as needed (1000 ms = 1 second)