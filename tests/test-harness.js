(function () {
  const results = [];

  window.test = function (name, fn) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (error) {
      results.push({ name, passed: false, error: error.message });
    }
  };

  window.ok = function (value, message) {
    if (!value) throw new Error(message || `Expected truthy value, received ${value}`);
  };

  window.equal = function (actual, expected) {
    if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  };

  window.deepEqual = function (actual, expected) {
    const left = JSON.stringify(actual);
    const right = JSON.stringify(expected);
    if (left !== right) throw new Error(`Expected ${right}, received ${left}`);
  };

  window.addEventListener('load', function () {
    const passed = results.filter((result) => result.passed).length;
    const failed = results.length - passed;
    const list = document.querySelector('#test-results');
    results.forEach((result) => {
      const item = document.createElement('li');
      item.className = result.passed ? 'pass' : 'fail';
      item.textContent = result.passed ? `PASS: ${result.name}` : `FAIL: ${result.name} - ${result.error}`;
      list.appendChild(item);
    });
    document.querySelector('#test-summary').textContent = `${passed} passed, ${failed} failed`;
    document.body.dataset.failed = String(failed);
  });
}());
