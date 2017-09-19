import { TestGroup, Test } from '../client/config/test_data';
import { StateModel } from '../client/config/state';
import * as sinon from 'Sinon';
import { setupTestBridge } from '../client/config/bridge';
import { TestRunner } from '../client/config/test_runner';

describe('Test', function() {
  let testRunner: TestRunner;

  beforeEach(() => {
    testRunner = new TestRunner(null);
  });

  it('detects failing tests', async function() {
    const group = new TestGroup(null, 'root');
    const test1 = new Test('test fail', group, () => { throw Error('Failed') });
    const test2 = new Test('test pass', group, () => { });
    group.tests.push(test1, test2);

    const result = await testRunner.testGroup(group);
    result.should.be.false;

    group.startTime.should.be.greaterThan(0);
    group.endTime.should.be.greaterThan(0);
    group.duration.should.equal(group.endTime - group.startTime);
    
    test1.startTime.should.be.greaterThan(0);
    test1.endTime.should.be.greaterThan(0);
    test1.duration.should.equal(test1.endTime - test1.startTime);
    test1.error.message.should.equal('Failed');

    test2.startTime.should.be.greaterThan(0);
    test2.endTime.should.be.greaterThan(0);
    test2.duration.should.equal(test2.endTime - test2.startTime);
    (test2.error == null).should.be.true;
  });
});

