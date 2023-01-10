import axios from 'axios';
require('dotenv').config()

export const getCoordinates = async (address: string) => {

    var API_KEY = process.env.LOCATIONIQ_API_KEY;
    var BASE_URL = "https://us1.locationiq.com/v1/search?format=json&limit=1";

    var url = BASE_URL + "&key=" + API_KEY + "&q=" + address;

    let config = {
        method: 'get',
        url: url,
        headers: { }
      };
    await axios(config).then( function (response) {
        console.log('Here')
        console.log(response.data[0])
        // console.log(JSON.stringify(response.data));
        return response.data[0]
        // return new Promise<{}>((resolve) => {
        //     resolve(response.data[0]);
        // });
    }).catch(function (error) {
        console.log(error);
        return null
    });
      
};