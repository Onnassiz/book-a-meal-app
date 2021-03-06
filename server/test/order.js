import chai from 'chai';
import chaiHttp from 'chai-http';
import timekeeper from 'timekeeper';
import expect from 'expect';
import server from '../app';
import models from '../models';
import userMockData from './mock/userMockData';
import otherMockData from './mock/otherMockData';

/** Test cases for creating the Order for the day
We are testing all input case time to make sure that our validations are working
and that we are getting the desired output
*/

const {
  customerLoginDetailsFirst,
  customerLoginDetailsSecond,
  catererLoginDetailsSecond,
} = userMockData;

const {
  placeOrderProd,
  modifyOrderProd,
} = otherMockData;

let secondCatererToken;
let firstCustomerToken;
let secondCustomerToken;
let orderId;

chai.use(chaiHttp);

describe('Order Controller', () => {
  before((done) => {
    const time = new Date(Date.now()).setHours(12);
    timekeeper.freeze(time);
    done();
  });
  before((done) => {
    chai.request(server)
      .post('/auth/login')
      .send(catererLoginDetailsSecond)
      .end((err, res) => {
        secondCatererToken = res.body.token;
        done();
      });
  });
  before((done) => {
    chai.request(server)
      .post('/auth/login')
      .send(customerLoginDetailsFirst)
      .end((err, res) => {
        firstCustomerToken = res.body.token;
        done();
      });
  });
  before((done) => {
    chai.request(server)
      .post('/auth/login')
      .send(customerLoginDetailsSecond)
      .end((err, res) => {
        secondCustomerToken = res.body.token;
        done();
      });
  });
  before((done) => {
    models.order
      .destroy({
        where: {},
        truncate: true,
      })
      .then(() => {
        done();
      });
  });
  after((done) => {
    timekeeper.reset();
    done();
  });

  describe('Get all Orders - Caterer', () => {
    it(`It should return the message "You don't have any order yet" 
  when a caterer tries to get the order for that day when there is none`, (done) => {
      chai.request(server)
        .get('/orders/caterer')
        .set({ authorization: secondCatererToken })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          expect(res.body.message).toEqual('You don\'t have any order yet');
          done();
        });
    });
  });
  describe('Get my Orders - Customer', () => {
    it(`It should return the message "You have not placed any order yet" 
  when a customer tries to get all orders without setting one`, (done) => {
      chai.request(server)
        .get('/orders/customer')
        .set({ authorization: secondCustomerToken })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          expect(res.body.message).toEqual('You have not placed any order yet');
          done();
        });
    });
  });
  describe('Modify an order', () => {
    it(`It should return the message "Order not found" 
  when a customer wants to modify an order`, (done) => {
      chai.request(server)
        .put('/orders/d65a1b90-ea1c-424c-a0d0-3fe7769a5b54')
        .set({ authorization: secondCustomerToken })
        .send(modifyOrderProd)
        .end((err, res) => {
          expect(res.status).toEqual(404);
          expect(res.body.message).toEqual('Order not found');
          done();
        });
    });
  });
  describe('Place an order', () => {
    it(`It should return the message "Order Placed successfully" 
  when a customer places an order`, (done) => {
      chai.request(server)
        .post('/orders')
        .set({ authorization: secondCustomerToken })
        .send(placeOrderProd)
        .end((err, res) => {
          orderId = res.body.data.id;
          expect(res.status).toEqual(201);
          expect(res.body).toHaveProperty('data');
          expect(res.body.message).toEqual('Order Placed successfully');
          done();
        });
    });
  });
  describe('Get all Orders - Caterer', () => {
    it(`It should return the message "You have the following orders" 
  when a caterer tries to get all orders for the day`, (done) => {
      chai.request(server)
        .get('/orders/caterer')
        .set({ authorization: secondCatererToken })
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('totalSales');
          expect(res.body.message).toEqual('You have the following orders');
          done();
        });
    });
  });
  describe('Get all Orders - Caterer', () => {
    it(`It should return the message "You have the following orders" 
  when a caterer tries to get all orders that has ever been made`, (done) => {
      chai.request(server)
        .get('/orders/caterer/all')
        .set({ authorization: secondCatererToken })
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('totalSales');
          expect(res.body.message).toEqual('You have the following orders');
          done();
        });
    });
  });
  describe('Get all Orders - Customer', () => {
    it(`It should return the message "You have placed the following orders" 
  when a customer tries to get all orders`, (done) => {
      chai.request(server)
        .get('/orders/customer')
        .set({ authorization: secondCustomerToken })
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('totalExpenses');
          expect(res.body.message).toEqual('You have placed the following orders');
          done();
        });
    });
  });
  describe('Modify an order', () => {
    it(`It should return the message "Order Modified successfully" 
  when a customer wants to modify an order`, (done) => {
      chai.request(server)
        .put(`/orders/${orderId}`)
        .set({ authorization: secondCustomerToken })
        .send(modifyOrderProd)
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toHaveProperty('data');
          expect(res.body.message).toEqual('Order Modified successfully');
          done();
        });
    });
  });
  describe('Modify an order', () => {
    it(`It should return the message "You can not modify this order" 
  when a customer wants to modify another customer's order`, (done) => {
      chai.request(server)
        .put(`/orders/${orderId}`)
        .set({ authorization: firstCustomerToken })
        .send(modifyOrderProd)
        .end((err, res) => {
          expect(res.status).toEqual(401);
          expect(res.body.message).toEqual('You can not modify this order');
          done();
        });
    });
  });
});
