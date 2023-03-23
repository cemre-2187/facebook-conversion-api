const { pool } = require("./connection")
require('dotenv').config()

const bizSdk = require('facebook-nodejs-business-sdk');
const Content = bizSdk.Content;
const CustomData = bizSdk.CustomData;
const DeliveryCategory = bizSdk.DeliveryCategory;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const ServerEvent = bizSdk.ServerEvent;

console.log(process.env.TOKEN);
const access_token = process.env.TOKEN;
const pixel_id = process.env.PIXELID;
const api = bizSdk.FacebookAdsApi.init(access_token);

const sendOldUsersToFacebook = () => {
  pool.query(`select
  amount,ts.currency,ts.created_at,
  us.email,ba.first_name,ba.last_name,gsm_number,ba.address_line1,ba.address_line2,city,country,pp.id as pp
  from ***`, (err, res) => {
    //offset 0 limit 100
    if (err) {
      console.error(err);
    } else {
      console.log(res.rows);
      res.rows.map(ts => {
        let current_timestamp = Math.floor(ts.created_at / 1000);

        const userData = (new UserData())
          .setEmail(ts.email.toLowerCase())
          .setPhone(ts.gsm_number)
          .setFirstName(ts.first_name.toLowerCase())
          .setLastName(ts.last_name.toLowerCase())
          .setCity(ts.city.toLowerCase())


        const content = (new Content())
          .setId(String(ts.pp))
          .setQuantity(1)


        const customData = (new CustomData())
          .setContents([content])
          .setCurrency(ts.currency)
          .setValue(Number(ts.amount));

        const serverEvent = (new ServerEvent())
          .setEventName('Purchase')
          .setEventTime(current_timestamp)
          .setUserData(userData)
          .setCustomData(customData)
          .setEventSourceUrl('https://payment.rexven.com' + '?price=' + ts.amount + '&currency=' + ts.currency + '&productId=' + ts.pp)
          .setActionSource('website');

        const eventsData = [serverEvent];
        const eventRequest = (new EventRequest(access_token, pixel_id))
          .setEvents(eventsData);

        eventRequest.execute().then(
          response => {
            console.log('Response: ', response);
          },
          err => {
            console.error('Error: ', err);
          }
        );


      })
    }
    // pool.end(); // release the client back to the pool
  });
}
module.exports = { sendOldUsersToFacebook }


//url parametresini price currency productid 