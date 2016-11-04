const lessPackager = require('../bin/less-packager');
const assert = require('assert');

describe('hadron-component', function() {
  it('runs without errors', function() {
    assert(lessPackager);
  });
});
