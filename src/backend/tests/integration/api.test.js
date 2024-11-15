const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Integration Tests for Api', () => {
  it('should create a timestamp', (done) => {
    chai.request(app)
      .post('/api/timestamp')
      .send({ timestamp: new Date().toISOString(), type: 'in' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });

  it('should retrieve summary information', (done) => {
    chai.request(app)
      .get('/api/summaries/daily')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.length).to.not.empty();
        console.log(res.body);
        done();
      });
  });
});