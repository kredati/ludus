let raise = (error, message) => { throw new error(message) };

let report = (...msgs) => {
  msgs.forEach(msg => console.error(msg));
}

export {raise, report}